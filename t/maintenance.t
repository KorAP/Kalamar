use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::Promise;

local $ENV{KALAMAR_PLUGINS};
local $ENV{DOWNTIME_CALENDAR_URL};

my $plain = Test::Mojo->new('Kalamar');
$plain->get_ok('/maintenance.json')->status_is(404);

my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {plugins => ['DowntimeCalendar']},
  DowntimeCalendar => {url => 'https://private.example.org/calendar', resolve_hosts => 0},
});
my $status = {last_success => time, stale => 0, error => 'private infrastructure error'};
my $events = [{start => '2026-11-18T10:00:00+0100', end => '2026-11-18T11:00:00+0100',
  start_epoch => 1794992400, end_epoch => 1794996000, all_day => 0, ongoing => 0}];
$t->app->helper('downtime_calendar.public_events' => sub { $events });
$t->app->helper('downtime_calendar.status' => sub { $status });
$t->get_ok('/maintenance.json')->status_is(200)
  ->header_is('Cache-Control', 'no-store')->json_is('/schema_version', 1)
  ->json_is('/state', 'ok')->json_is('/time_zone', 'Europe/Berlin')
  ->json_is('/events', $events)->json_is('/last_success', $status->{last_success})
  ->content_unlike(qr/private|infrastructure|calendar\.ics/);

$events = [];
$t->get_ok('/maintenance.json')->status_is(200)->json_is('/state', 'ok')->json_is('/events', []);
$status->{last_success} = time - 600;
$status->{stale} = 1;
$t->get_ok('/maintenance.json')->status_is(200)->json_is('/state', 'stale');
$status->{last_success} = time - 90000;
$events = [{start => 'must not publish expired cached events'}];
$t->get_ok('/maintenance.json')->status_is(200)->json_is('/state', 'unknown')->json_is('/events', []);

# A cold worker waits asynchronously for the first refresh before responding.
$status = {last_success => undef, stale => 0};
$events = [];
$t->app->helper('downtime_calendar.refresh_p' => sub {
  $status->{last_success} = time;
  return Mojo::Promise->resolve(1);
});
$t->get_ok('/maintenance.json')->status_is(200)->json_is('/state', 'ok');

# A failed first refresh is not represented as a known empty schedule.
$status->{last_success} = undef;
$t->app->helper('downtime_calendar.refresh_p' => sub { Mojo::Promise->resolve(0) });
$t->get_ok('/maintenance.json')->status_is(200)->json_is('/state', 'unknown')->json_is('/events', []);

# A stalled calendar never holds the public endpoint open indefinitely.
$t->app->helper('downtime_calendar.refresh_p' => sub { Mojo::Promise->new });
$t->get_ok('/maintenance.json')->status_is(200)->json_is('/state', 'unknown');
done_testing;
