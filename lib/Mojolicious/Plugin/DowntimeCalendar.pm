package Mojolicious::Plugin::DowntimeCalendar;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::URL;
use Mojo::UserAgent;
use DateTime::TimeZone;
use Mojolicious::Plugin::DowntimeCalendar::Calendar;
use Mojolicious::Plugin::DowntimeCalendar::Cache;
use Mojolicious::Plugin::DowntimeCalendar::Hosts;

our $VERSION = '0.02';

sub register {
  my ($self, $app, $conf) = @_;
  my %options = (
    url => '', hosts => [], resolve_hosts => 1, time_zone => 'Europe/Berlin',
    lookahead_days => 14, cache_ttl => 300, retry_interval => 60,
    max_stale => 86400, request_timeout => 5, max_response_size => 2 * 1024 * 1024,
    max_occurrences => 1000,
  );
  for my $key (keys %$conf) {
    die "Unknown DowntimeCalendar option: $key\n" unless exists $options{$key};
    $options{$key} = $conf->{$key};
  }
  die "DowntimeCalendar hosts must be an array reference\n" unless ref($options{hosts}) eq 'ARRAY';
  die "DowntimeCalendar hosts must contain non-empty strings\n"
    if grep {!defined || ref || !/\S/ || /[,;\s*]/} @{$options{hosts}};
  for my $key (qw(lookahead_days cache_ttl retry_interval max_stale request_timeout max_response_size max_occurrences)) {
    die "Invalid DowntimeCalendar $key\n" unless defined($options{$key}) && $options{$key} =~ /^\d+$/
      && ($key eq 'max_stale' || $options{$key} > 0);
  }
  DateTime::TimeZone->new(name => $options{time_zone});
  if (length $options{url}) {
    my $url = Mojo::URL->new($options{url});
    die "DowntimeCalendar url must be an absolute HTTP(S) URL\n"
      unless ($url->scheme // '') =~ /^https?$/ && $url->host;
  }
  my $ua = Mojo::UserAgent->new
    ->request_timeout($options{request_timeout})
    ->connect_timeout($options{request_timeout})
    ->max_response_size($options{max_response_size})->max_redirects(3);
  my $hosts = Mojolicious::Plugin::DowntimeCalendar::Hosts->discover(
    hosts => $options{hosts}, resolve => $options{resolve_hosts});
  my $cache = Mojolicious::Plugin::DowntimeCalendar::Cache->new(
    (map {$_ => $options{$_}} qw(url lookahead_days cache_ttl retry_interval max_stale)),
    ua => $ua, log => $app->log, hosts => $hosts,
    calendar => Mojolicious::Plugin::DowntimeCalendar::Calendar->new(
      time_zone => $options{time_zone}, max_occurrences => $options{max_occurrences}),
  );
  $app->helper('downtime_calendar.events' => sub { $cache->events });
  # Only these fields are suitable for public templates and JSON responses.
  $app->helper('downtime_calendar.public_events' => sub {
    return [map {
      my $event = $_;
      +{map {$_ => $event->{$_}} qw(start end start_epoch end_epoch all_day ongoing)}
    } @{$cache->events}];
  });
  $app->helper('downtime_calendar.status' => sub { $cache->status });
  $app->helper('downtime_calendar.hosts' => sub { [@$hosts] });
  $app->helper('downtime_calendar.refresh_p' => sub { $cache->refresh_p });
  return $cache;
}

1;

__END__

=head1 NAME

Mojolicious::Plugin::DowntimeCalendar - Host-specific maintenance notices from an iCalendar feed

=head1 SYNOPSIS

  $app->plugin(DowntimeCalendar => {
    url => 'https://cloud.example.org/remote.php/dav/public-calendars/TOKEN?export',
    time_zone => 'Europe/Berlin',
  });

  # In an EP template (text is escaped by Mojolicious):
  % for my $event (@{$self->downtime_calendar->public_events}) {
    <p><time datetime="<%= $event->{start} %>"><%= $event->{start} %></time>
      System maintenance</p>
  % }

=head1 DESCRIPTION

Fetches an iCalendar feed asynchronously and caches notices for the local host.
LOCATION contains a comma-separated host/IP list or C<*> for all hosts. The
C<KORAP_HOSTNAME> environment variable supplies the physical host in Docker.
Without it the local hostname is used. Explicit C<hosts> override discovery.

C<downtime_calendar.public_events> returns an array reference with ongoing events and
those starting within 14 days. It never waits for the network. A cold cache
returns an empty array and starts a background request. C<refresh_p> allows
explicit preloading and resolves to 1 on success or 0 on failure.

C<downtime_calendar.status> reports enabled, refreshing, last_success,
last_attempt, stale and error. C<downtime_calendar.hosts> reports the aliases.

C<events> additionally includes internal calendar text and host locations; do
not expose those fields publicly.

The README describes configuration, event fields, supported calendar features,
cache lifetime, and application and Docker Compose examples.

=head1 LICENSE

This software is free software; you can redistribute it and/or modify it under
the same terms as Perl itself.

=cut
