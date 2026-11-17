package Kalamar::Plugin::DowntimeCalendar;
use Mojo::Base 'Mojolicious::Plugin';

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
