use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw(path);
use utf8;

local $ENV{KALAMAR_PLUGINS};
local $ENV{DOWNTIME_CALENDAR_URL};
local $ENV{KALAMAR_API} = '/realapi/';

sub frontend {
  my ($options) = @_;
  my $t = Test::Mojo->new('Kalamar' => $options // {});
  $t->app->mode('production');
  $t->app->plugin(Mount => {'/realapi/' => path(__FILE__)->dirname->child('server/mock.pl')});
  return $t;
}

my $plain = frontend();
$plain->get_ok('/')->status_is(200)->element_exists_not('.maintenance-notices');
ok !exists $INC{'Mojolicious/Plugin/DowntimeCalendar.pm'}, 'normal Kalamar does not load bundled calendar module';
ok !exists $INC{'Data/ICal.pm'}, 'normal Kalamar does not load parser dependencies';
unshift @{$plain->app->renderer->paths}, path(__FILE__)->dirname->child('fixtures/downtime-legacy')->to_string;
$plain->get_ok('/')->status_is(200)->content_like(qr/LEGACY_NOTICE/);
my $missing_url = eval { frontend({Kalamar => {plugins => ['DowntimeCalendar']}}); 1 };
ok !$missing_url, 'explicit activation requires a calendar URL';
like $@, qr/no calendar URL is configured/, 'missing URL error explains configuration';
ok !exists $INC{'Mojolicious/Plugin/DowntimeCalendar.pm'}, 'invalid configuration does not load optional dependency';

{
  local @INC = (sub {
    die "Calendar deliberately unavailable\n" if $_[1] eq 'Mojolicious/Plugin/DowntimeCalendar.pm';
    return;
  }, @INC);
  my $ok = eval {
    frontend({Kalamar => {plugins => ['DowntimeCalendar']}, DowntimeCalendar => {url => 'https://example.org/calendar'}});
    1;
  };
  ok !$ok, 'explicit activation with a missing bundled module fails';
  like $@, qr/cpanm --installdeps/, 'load error explains standard dependency installation';
}

{
  require Mojolicious::Plugin::DowntimeCalendar;
  Mojolicious::Plugin::DowntimeCalendar->VERSION('0.02');
  my $active = frontend({Kalamar => {plugins => ['DowntimeCalendar']}, DowntimeCalendar => {url => 'https://example.org/calendar', resolve_hosts => 0}});
  my $events = [{
    start => '2026-11-16T00:00:00+0100', end => '2026-11-18T00:00:00+0100',
    start_epoch => 1794783600, end_epoch => 1794956400, all_day => 1, ongoing => 1,
  }];
  $active->app->helper('downtime_calendar.public_events' => sub {$events});
  $active->get_ok('/' => {'Accept-Language' => 'de'})
    ->status_is(200)->text_is('#maintenance-title', 'Mögliche Dienstunterbrechungen')
    ->element_exists('.intro-container.with-announcements > .intro + .maintenance-notices')
    ->content_like(qr/16\.11\.2026/)->content_like(qr/17\.11\.2026/)
    ->content_like(qr/Systemwartung/)->content_like(qr/zeitweise nicht verfügbar/)
    ->content_unlike(qr/example\.org|worker-05|SUMMARY|LOCATION/);
  $active->get_ok('/' => {'Accept-Language' => 'en'})
    ->status_is(200)->text_is('#maintenance-title', 'Possible service interruptions')
    ->content_like(qr/System maintenance/)->content_like(qr/temporarily unavailable/);
  # A legacy announcement at the old include point must not duplicate the panel.
  my $legacy = path(__FILE__)->dirname->child('fixtures/downtime-legacy');
  unshift @{$active->app->renderer->paths}, "$legacy";
  $active->get_ok('/')->status_is(200)->content_unlike(qr/LEGACY_NOTICE/);
  $events = [];
  $active->get_ok('/')->status_is(200)->element_exists_not('.maintenance-notices')
    ->content_unlike(qr/LEGACY_NOTICE/);
  $events = [{start => '2026-11-17T10:00:00+0100', end => '2026-11-17T11:30:00+0100', start_epoch => 1794906000, end_epoch => 1794911400, all_day => 0, ongoing => 0}];
  $active->get_ok('/')->status_is(200)->content_like(qr/17\.11\.2026 10:00/)
    ->content_like(qr/17\.11\.2026 11:30/);
  my $utc = frontend({Kalamar => {plugins => ['DowntimeCalendar']}, DowntimeCalendar => {url => 'https://example.org/calendar', resolve_hosts => 0, time_zone => 'UTC'}});
  $utc->app->helper('downtime_calendar.public_events' => sub {$events});
  $utc->get_ok('/')->status_is(200)->content_like(qr/17\.11\.2026 09:00/)->content_like(qr/17\.11\.2026 10:30/);
}
done_testing;
