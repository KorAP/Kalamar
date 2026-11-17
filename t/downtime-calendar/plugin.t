use strict;
use warnings;
use Test::More;
use Test::Mojo;
use Mojolicious;
use Mojo::IOLoop;
use lib 'lib';
use Mojolicious::Plugin::DowntimeCalendar;

my $now = 1794830400; # 2026-11-16 12:00 UTC
my ($requests, $mode, $etag_seen, $modified_seen) = (0, 'ok');
my $source = <<'ICS';
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:maintenance
DTSTART:20261117T100000Z
DTEND:20261117T110000Z
LOCATION:worker
SUMMARY:<script>alert(1)</script>
END:VEVENT
BEGIN:VEVENT
UID:later
DTSTART:20261201T100000Z
DURATION:PT1H
LOCATION:worker
SUMMARY:Later
END:VEVENT
END:VCALENDAR
ICS
my $feed = Mojolicious->new;
$feed->log->level('fatal');
$feed->routes->get('/calendar')->to(cb => sub {
  my $c = shift;
  $requests++;
  $etag_seen = $c->req->headers->if_none_match;
  $modified_seen = $c->req->headers->if_modified_since;
  return $c->render(status => 503, text => 'unavailable') if $mode eq 'http_error';
  return $c->render(status => 304, text => '') if $mode eq 'unchanged';
  return $c->render(text => '<html>login</html>') if $mode eq 'invalid';
  return $c->render(text => 'x' x 4096) if $mode eq 'oversize';
  $c->res->headers->etag('"v1"');
  $c->res->headers->last_modified('Mon, 16 Nov 2026 10:00:00 GMT');
  $c->render(text => $source);
});
my $app = Mojolicious->new;
$app->log->level('fatal');
my $cache = $app->plugin(DowntimeCalendar => {
  url => 'https://example.org/calendar', hosts => ['worker'], resolve_hosts => 0,
  cache_ttl => 300, max_stale => 600, retry_interval => 60,
});
$cache->clock(sub {$now});
my $feed_test = Test::Mojo->new($feed);
$cache->ua($feed_test->ua)->url('/calendar');
my $c = $app->build_controller;
is_deeply $c->downtime_calendar->hosts, ['worker'], 'host helper';
is_deeply $c->downtime_calendar->events, [], 'cold cache returns immediately';
is $requests, 0, 'rendering did not wait for HTTP';
ok $c->downtime_calendar->status->{refreshing}, 'refresh in progress';
my $p1 = $c->downtime_calendar->refresh_p;
my $p2 = $c->downtime_calendar->refresh_p;
is $p1, $p2, 'concurrent refreshes share one promise';
my $success;
$p1->then(sub {$success = shift})->wait;
is $success, 1, 'refresh succeeds';
is $requests, 1, 'single request';
ok !$c->downtime_calendar->status->{refreshing}, 'pending request cleared';
is scalar @{$c->downtime_calendar->events}, 1, 'only event within 14 days';
is $requests, 1, 'fresh cache requires no request';
my $public = $c->downtime_calendar->public_events;
is_deeply [sort keys %{$public->[0]}], [sort qw(start end start_epoch end_epoch all_day ongoing)], 'public helper exposes only schedule fields';
ok !exists($public->[0]{summary}) && !exists($public->[0]{location}) && !exists($public->[0]{description}) && !exists($public->[0]{uid}), 'private calendar fields absent';
$public->[0]{start} = 'modified';
isnt $c->downtime_calendar->public_events->[0]{start}, 'modified', 'public results cannot mutate the cache';
ok !$c->downtime_calendar->events->[0]{ongoing}, 'upcoming event';
$c->downtime_calendar->events->[0]{summary} = 'changed';
is $c->downtime_calendar->events->[0]{summary}, '<script>alert(1)</script>', 'consumer cannot mutate cache';
$now += 301;
$mode = 'http_error';
is scalar @{$c->downtime_calendar->events}, 1, 'serve old notices while refreshing';
$c->downtime_calendar->refresh_p->then(sub {$success = shift})->wait;
is $success, 0, 'HTTP failure resolves to false';
ok $c->downtime_calendar->status->{stale}, 'stale status';
is $c->downtime_calendar->status->{error}, 'Calendar refresh failed', 'safe error status';
is scalar @{$c->downtime_calendar->events}, 1, 'last good calendar retained on error';
is $requests, 2, 'retry is throttled';
$mode = 'invalid';
$c->downtime_calendar->refresh_p->then(sub {$success = shift})->wait;
is $success, 0, 'malformed calendar fails';
is scalar @{$c->downtime_calendar->events}, 1, 'bad calendar does not replace cache';
$mode = 'unchanged';
$c->downtime_calendar->refresh_p->then(sub {$success = shift})->wait;
is $success, 1, '304 succeeds';
is $etag_seen, '"v1"', 'ETag conditional request';
is $modified_seen, 'Mon, 16 Nov 2026 10:00:00 GMT', 'Last-Modified conditional request';
ok !$c->downtime_calendar->status->{error}, 'success clears error';

$app->routes->get('/')->to(cb => sub {
  my $c = shift;
  $c->render(inline => '% for my $e (@{$self->downtime_calendar->events}) {' . "\n" . '<p><%= $e->{summary} %></p>' . "\n% }\n");
});
my $t = Test::Mojo->new($app);
$t->get_ok('/')->status_is(200)->element_exists_not('script')->content_like(qr/&lt;script&gt;/);
$mode = 'http_error';
$now += 901;
is_deeply $c->downtime_calendar->events, [], 'over-age cache is hidden';
$c->downtime_calendar->refresh_p->wait;
$now = 1794909600; # event starts
$mode = 'ok';
$c->downtime_calendar->refresh_p->wait;
ok $c->downtime_calendar->events->[0]{ongoing}, 'event becomes ongoing';
$now = 1794913200; # event ends
is_deeply $c->downtime_calendar->events, [], 'expired event hidden even before refreshing';
$c->downtime_calendar->refresh_p->wait;
$now = 1794999600; # next day: Dec 1 is now within 14 days
$mode = 'unchanged';
$c->downtime_calendar->refresh_p->wait;
is $c->downtime_calendar->events->[0]{uid}, 'later', '304 moves selection window forward';
$mode = 'ok';
$source = "BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR\n";
$c->downtime_calendar->refresh_p->wait;
is_deeply $c->downtime_calendar->events, [], 'valid empty feed removes notices';

my $disabled = Mojolicious->new;
$disabled->plugin('DowntimeCalendar', {resolve_hosts => 0});
my $dc = $disabled->build_controller;
is_deeply $dc->downtime_calendar->events, [], 'no URL disables calendar';
ok !$dc->downtime_calendar->status->{enabled}, 'disabled status';
for my $conf ({url => 'file:///etc/passwd'}, {hosts => 'worker'}, {cache_ttl => 0}, {unknown => 1}, {hosts => ['*']}) {
  ok !eval {Mojolicious->new->plugin(DowntimeCalendar => $conf); 1}, 'invalid configuration rejected';
}
# Exercise actual transport failure and response size limit with the plugin UA.
my $limited_app = Mojolicious->new;
$limited_app->log->level('fatal');
my $limited = $limited_app->plugin(DowntimeCalendar => {url => 'http://localhost/calendar', hosts => ['worker'], resolve_hosts => 0, max_response_size => 1024});
$limited->ua->server->app($feed);
$limited->url('/calendar');
$mode = 'oversize';
$limited->refresh_p->then(sub {$success = shift})->wait;
is $success, 0, 'oversized response fails';
$limited->url('http://127.0.0.1:1/calendar');
$limited->refresh_p->then(sub {$success = shift})->wait;
is $success, 0, 'connection failure resolves to false';
is_deeply $limited->events, [], 'no good cache remains invisible';
done_testing;
