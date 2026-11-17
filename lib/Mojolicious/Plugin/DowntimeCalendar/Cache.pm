package Mojolicious::Plugin::DowntimeCalendar::Cache;
use Mojo::Base -base;
use Mojo::Promise;
use DateTime;

has [qw(url ua calendar log)];
has hosts => sub { [] };
has lookahead_days => 14;
has cache_ttl => 300;
has retry_interval => 60;
has max_stale => 86400;
has clock => sub { sub {time} };
has _events => sub { [] };
has [qw(_pending _last_success _last_attempt _error _etag _modified)];

sub _horizon {
  my ($self, $now) = @_;
  return DateTime->from_epoch(epoch => $now, time_zone => $self->calendar->time_zone)
    ->add(days => $self->lookahead_days)->epoch;
}

sub events {
  my $self = shift;
  my $now = $self->clock->();
  my $interval = $self->_error ? $self->retry_interval : $self->cache_ttl;
  if (length($self->url) && !defined($self->_pending)
      && (!defined($self->_last_attempt) || $now - $self->_last_attempt >= $interval)) {
    $self->refresh_p; # Always resolves, including on failure; never blocks rendering.
  }
  return [] unless defined $self->_last_success;
  return [] if $now - $self->_last_success > $self->cache_ttl + $self->max_stale;
  my $until = $self->_horizon($now);
  return [map { +{%$_, ongoing => $_->{start_epoch} <= $now ? 1 : 0} }
    grep {$_->{end_epoch} > $now && $_->{start_epoch} <= $until} @{$self->_events}];
}

sub status {
  my $self = shift;
  my $now = $self->clock->();
  return {
    enabled => length($self->url) ? 1 : 0,
    refreshing => $self->_pending ? 1 : 0,
    last_success => $self->_last_success,
    last_attempt => $self->_last_attempt,
    stale => defined($self->_last_success) && $now - $self->_last_success >= $self->cache_ttl ? 1 : 0,
    error => $self->_error,
  };
}

sub refresh_p {
  my $self = shift;
  return $self->_pending if $self->_pending;
  return Mojo::Promise->resolve(0) unless length $self->url;
  $self->_last_attempt($self->clock->());
  my %headers;
  $headers{'If-None-Match'} = $self->_etag if defined $self->_etag;
  $headers{'If-Modified-Since'} = $self->_modified if defined $self->_modified;
  my $promise = $self->ua->get_p($self->url => \%headers)->then(sub {
    my $tx = shift;
    my $res = $tx->result;
    my $now = $self->clock->();
    if ($res->code == 304) {
      die "Unexpected calendar response (304)\n" unless defined $self->_last_success;
      # Re-expand cached source to keep the recurrence window moving.
      $self->_store($self->{source}, $now);
    }
    else {
      die "Calendar HTTP request failed\n" unless $res->is_success;
      $self->_store($res->text, $now);
      $self->_etag($res->headers->etag);
      $self->_modified($res->headers->last_modified);
    }
    $self->_error(undef);
    return 1;
  })->catch(sub {
    # Do not log the private calendar URL, credentials or response body.
    $self->_error('Calendar refresh failed');
    $self->log->warn('DowntimeCalendar: calendar refresh failed; keeping cached notices');
    return 0;
  })->finally(sub { $self->_pending(undef) });
  $self->_pending($promise);
  return $promise;
}

sub _store {
  my ($self, $source, $now) = @_;
  # Include enough future occurrences for the maximum cache lifetime. The helper
  # still applies the precise 14-day horizon and removes expired events on read.
  my $events = $self->calendar->events($source,
    now => $now, until => $self->_horizon($now + $self->cache_ttl + $self->max_stale),
    hosts => $self->hosts);
  $self->_events($events);
  $self->{source} = $source;
  $self->_last_success($now);
}

1;
