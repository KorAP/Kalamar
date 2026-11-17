package Mojolicious::Plugin::DowntimeCalendar::Calendar;
use Mojo::Base -base;
use Mojolicious::Plugin::DowntimeCalendar::Feed;
use DateTime;
use DateTime::Format::ICal;
use Mojolicious::Plugin::DowntimeCalendar::Hosts;

has time_zone => 'Europe/Berlin';
has max_occurrences => 1000;

sub _prop { ($_[1]->properties->{$_[2]} // [])->[0] }
sub _value { my $p = shift->_prop(@_); return $p ? $p->value : '' }

sub _date {
  my ($self, $prop, $value) = @_;
  die "Missing date\n" unless $prop;
  $value //= $prop->value;
  my $tz = $prop->parameters->{TZID};
  $tz =~ s/^"|"$//g if defined $tz;
  my $dt = DateTime::Format::ICal->parse_datetime(
    (defined $tz && $value !~ /Z$/ ? "TZID=$tz:" : '') . $value
  );
  $dt->set_time_zone($self->time_zone) if $dt->time_zone->is_floating;
  return $dt;
}

sub _duration {
  my ($self, $entry, $start) = @_;
  my $end = $self->_prop($entry, 'dtend');
  my $duration = $self->_value($entry, 'duration');
  die "Both DTEND and DURATION\n" if $end && length $duration;
  if ($end) {
    my $dtend = $self->_date($end);
    die "DTEND precedes DTSTART\n" if $dtend < $start;
    # Date-only events end at local midnight, including across DST changes.
    return $dtend->delta_days($start) if $self->_prop($entry, 'dtstart')->value =~ /^\d{8}$/;
    return DateTime::Duration->new(seconds => $dtend->epoch - $start->epoch);
  }
  return DateTime::Format::ICal->parse_duration($duration) if length $duration;
  return DateTime::Duration->new($self->_prop($entry, 'dtstart')->value =~ /^\d{8}$/ ? (days => 1) : (seconds => 0));
}

sub events {
  my ($self, $text, %args) = @_;
  die "Not a complete iCalendar feed\n" unless $text =~ /\ABEGIN:VCALENDAR\s*\r?\n/ && $text =~ /\nEND:VCALENDAR\s*\z/;
  my $calendar = Mojolicious::Plugin::DowntimeCalendar::Feed->new(data => $text);
  die "Invalid iCalendar feed\n" unless $calendar;
  my @entries = grep {$_->ical_entry_type eq 'VEVENT'} @{$calendar->entries};
  my (%masters, %overrides);
  for my $entry (@entries) {
    my $uid = $self->_value($entry, 'uid');
    die "Event without UID\n" unless length $uid;
    my $rid = $self->_prop($entry, 'recurrence-id');
    if ($rid) {
      die "RANGE overrides are unsupported\n" if $rid->parameters->{RANGE};
      $overrides{$uid}{$self->_date($rid)->epoch} = $entry;
    }
    else {
      die "Duplicate event UID\n" if $masters{$uid};
      $masters{$uid} = $entry;
    }
  }
  my @result;
  my $count = 0;
  for my $uid (sort keys %masters) {
    my $entry = $masters{$uid};
    next if uc($self->_value($entry, 'status')) eq 'CANCELLED';
    next unless Mojolicious::Plugin::DowntimeCalendar::Hosts->matches($self->_value($entry, 'location'), $args{hosts});
    my $start = $self->_date($self->_prop($entry, 'dtstart'));
    my $duration = $self->_duration($entry, $start);
    my %dates = ($start->epoch => $start);
    my %excluded;
    for my $p (@{$entry->properties->{exdate} // []}) {
      $excluded{$self->_date($p, $_)->epoch} = 1 for split /,/, $p->value;
    }
    for my $p (@{$entry->properties->{rdate} // []}) {
      die "RDATE periods are unsupported\n" if ($p->parameters->{VALUE} // '') eq 'PERIOD';
      for my $v (split /,/, $p->value) {
        my $date = $self->_date($p, $v);
        $dates{$date->epoch} = $date;
      }
    }
    die "EXRULE is unsupported\n" if $self->_prop($entry, 'exrule');
    for my $p (@{$entry->properties->{rrule} // []}) {
      # DateTime::Event::ICal yields floating wall times. Build the rule in
      # local wall time explicitly, then restore the event zone per occurrence.
      my $rule = $p->value;
      $rule =~ s{(?<=UNTIL=)([^;]+)}{
        my $limit = $self->_date($self->_prop($entry, 'dtstart'), $1);
        $limit->set_time_zone($start->time_zone)->strftime('%Y%m%dT%H%M%S')
      }e;
      my $set = DateTime::Format::ICal->parse_recurrence(
        recurrence => $rule, dtstart => $start->clone->set_time_zone('floating'));
      # Search back by the duration so occurrences already running are retained.
      my $from = DateTime->from_epoch(epoch => $args{now}, time_zone => $start->time_zone)->subtract_duration($duration)->subtract(days => 1);
      my $to = DateTime->from_epoch(epoch => $args{until}, time_zone => $start->time_zone);
      my $iterator = $set->iterator(start => $from->set_time_zone('floating'), end => $to->set_time_zone('floating'));
      while (my $date = $iterator->next) {
        die "Too many calendar occurrences\n" if ++$count > $self->max_occurrences;
        $date->set_time_zone($start->time_zone);
        $dates{$date->epoch} = $date;
      }
    }
    for my $epoch (sort {$a <=> $b} keys %dates) {
      next if $excluded{$epoch} || exists $overrides{$uid}{$epoch};
      $self->_append(\@result, $entry, $dates{$epoch}, $duration, %args);
    }
  }
  # Include moved occurrences even when their original date is outside the window.
  for my $uid (sort keys %overrides) {
    next if $masters{$uid} && uc($self->_value($masters{$uid}, 'status')) eq 'CANCELLED';
    for my $entry (values %{$overrides{$uid}}) {
      next if uc($self->_value($entry, 'status')) eq 'CANCELLED';
      my $start = $self->_date($self->_prop($entry, 'dtstart'));
      $self->_append(\@result, $entry, $start, $self->_duration($entry, $start), %args);
    }
  }
  die "Too many calendar events\n" if @result > $self->max_occurrences;
  return [sort {$a->{start_epoch} <=> $b->{start_epoch} || $a->{uid} cmp $b->{uid}} @result];
}

sub _append {
  my ($self, $result, $entry, $start, $duration, %args) = @_;
  return unless Mojolicious::Plugin::DowntimeCalendar::Hosts->matches($self->_value($entry, 'location'), $args{hosts});
  my $end = $start->clone->add_duration($duration);
  die "Negative event duration\n" if $end < $start;
  return if $end->epoch <= $args{now} || $start->epoch > $args{until};
  my $zone = $self->time_zone;
  push @$result, {
    uid => $self->_value($entry, 'uid'),
    summary => $self->_value($entry, 'summary'),
    description => $self->_value($entry, 'description'),
    location => $self->_value($entry, 'location'),
    all_day => $self->_prop($entry, 'dtstart')->value =~ /^\d{8}$/ ? 1 : 0,
    start_epoch => $start->epoch, end_epoch => $end->epoch,
    start => $start->clone->set_time_zone($zone)->strftime('%Y-%m-%dT%H:%M:%S%z'),
    end => $end->clone->set_time_zone($zone)->strftime('%Y-%m-%dT%H:%M:%S%z'),
  };
}

1;
