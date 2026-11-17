package Kalamar::Plugin::DowntimeCalendar;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::IOLoop;

# The shared implementation ships with Kalamar, but is loaded only when
# this adapter is explicitly activated with a calendar URL.
sub register {
  my ($self, $app, $param) = @_;
  my %options = (%{$app->config('DowntimeCalendar') // {}}, %{$param // {}});
  $options{url} //= $ENV{DOWNTIME_CALENDAR_URL} // '';
  die "DowntimeCalendar is enabled but no calendar URL is configured. Set DowntimeCalendar.url or DOWNTIME_CALENDAR_URL.\n"
    unless length $options{url};

  eval {
    require Mojolicious::Plugin::DowntimeCalendar;
    Mojolicious::Plugin::DowntimeCalendar->VERSION('0.02');
    1;
  } or die "DowntimeCalendar requires Mojolicious::Plugin::DowntimeCalendar 0.02 or newer. "
    . "Install Kalamar dependencies with 'cpanm --installdeps .' and check the bundled module.\n$@";

  $app->plugin('Mojolicious::Plugin::DowntimeCalendar' => \%options);
  $app->routes->get('/maintenance.json')->to(cb => sub {
    my $c = shift;
    $c->res->headers->cache_control('no-store');
    my $sent;
    my $respond = sub {
      return if $sent++;
      # Calling public_events also starts a refresh when the cache is due.
      my $events = $c->downtime_calendar->public_events;
      my $status = $c->downtime_calendar->status;
      my $last = $status->{last_success};
      my $valid_until = defined($last)
        ? $last + ($options{cache_ttl} // 300) + ($options{max_stale} // 86400) : undef;
      my $state = !defined($valid_until) || time > $valid_until
        ? 'unknown' : $status->{stale} ? 'stale' : 'ok';
      $c->render(json => {
        schema_version => 1, state => $state,
        time_zone => $options{time_zone} // 'Europe/Berlin',
        last_success => $last, valid_until => $valid_until,
        events => $state eq 'unknown' ? [] : $events,
      });
    };
    return $respond->() if defined $c->downtime_calendar->status->{last_success};
    # Give cold workers a chance to obtain the first schedule, without blocking
    # the event loop or making clients wait for the full calendar timeout.
    $c->render_later;
    my $timer = Mojo::IOLoop->timer(2 => sub { $respond->() });
    $c->on(finish => sub { $sent = 1; Mojo::IOLoop->remove($timer) });
    $c->downtime_calendar->refresh_p->finally(sub {
      Mojo::IOLoop->remove($timer);
      $respond->();
    })->catch(sub { $respond->() });
  })->name('maintenance');
  $app->content_block('intro.announcements' => sub {
    my $c = shift;
    return $c->render_to_string(
      template => 'partial/downtime',
      downtime_events => $c->downtime_calendar->public_events,
      downtime_time_zone => $options{time_zone} // 'Europe/Berlin',
      downtime_language => $c->localize->preference // 'en',
    );
  });
}

1;
