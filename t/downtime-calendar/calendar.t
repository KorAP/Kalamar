use strict;
use warnings;
use utf8;
use Test::More;
use DateTime;
use lib 'lib';
use Mojolicious::Plugin::DowntimeCalendar::Calendar;
my $parser = Mojolicious::Plugin::DowntimeCalendar::Calendar->new;
sub epoch { DateTime::Format::ICal->parse_datetime($_[0])->epoch }
sub cal { "BEGIN:VCALENDAR\r\nVERSION:2.0\r\n" . join('', map {"BEGIN:VEVENT\n$_\nEND:VEVENT\n"} @_) . "END:VCALENDAR\n" }
sub events {
  $parser->events(cal(@_), now => epoch('20261116T120000Z'), until => epoch('20261130T120000Z'), hosts => ['worker', 'worker.example.org', '192.0.2.8']);
}
my $common = "DTSTART:20261117T100000Z\nDTEND:20261117T110000Z\nLOCATION:worker";
my $result = events("UID:one\n$common\nSUMMARY:Wartung\\, Prüfung\n Fortsetzung\nDESCRIPTION:Zeile 1\\nZeile 2",
  "UID:two\n$common\nSUMMARY:Separate notice");
is scalar @$result, 2, 'same-time events with distinct UIDs survive';
is $result->[0]{summary}, 'Wartung, PrüfungFortsetzung', 'escaped UTF-8 and folded lines';
is $result->[0]{description}, "Zeile 1\nZeile 2", 'escaped newlines';
is $result->[0]{start}, '2026-11-17T11:00:00+0100', 'UTC displayed in configured zone';
is scalar @{events("UID:other\n$common.example.net")}, 0, 'different FQDN does not match short alias';
is scalar @{events("UID:none\nDTSTART:20261117T100000Z\nDTEND:20261117T110000Z")}, 0, 'missing location excluded';
is scalar @{events("UID:global\nDTSTART:20261117T100000Z\nDURATION:PT1H\nLOCATION:*")}, 1, 'explicit wildcard matches all hosts';
is scalar @{events("UID:cancel\n$common\nSTATUS:CANCELLED")}, 0, 'cancelled event omitted';
$result = events(
  "UID:ongoing\nDTSTART:20261115T100000Z\nDTEND:20261116T120001Z\nLOCATION:worker",
  "UID:expired\nDTSTART:20261115T100000Z\nDTEND:20261116T120000Z\nLOCATION:worker",
  "UID:boundary\nDTSTART:20261130T120000Z\nDURATION:PT1H\nLOCATION:worker",
  "UID:later\nDTSTART:20261130T120001Z\nDURATION:PT1H\nLOCATION:worker");
is_deeply [map {$_->{uid}} @$result], ['ongoing', 'boundary'], 'ongoing, exclusive end, inclusive 14-day horizon';
$result = events("UID:day\nDTSTART;VALUE=DATE:20261117\nLOCATION:worker");
ok $result->[0]{all_day}, 'date-only event';
is $result->[0]{start}, '2026-11-17T00:00:00+0100', 'all-day local midnight';
is $result->[0]{end}, '2026-11-18T00:00:00+0100', 'default all-day duration is one day';
$result = events("UID:local\nDTSTART;TZID=Europe/Berlin:20261117T100000\nDURATION:PT2H\nLOCATION:other\\, worker");
is $result->[0]{start_epoch}, epoch('20261117T090000Z'), 'TZID interpreted';
is $result->[0]{end_epoch} - $result->[0]{start_epoch}, 7200, 'duration parsed';
$result = events("UID:floating\nDTSTART:20261117T100000\nDURATION:PT1H\nLOCATION:worker");
is $result->[0]{start_epoch}, epoch('20261117T090000Z'), 'floating times use configured zone';
$result = events(
  "UID:series\nDTSTART;TZID=Europe/Berlin:20261001T100000\nDURATION:PT1H\nRRULE:FREQ=DAILY\nEXDATE;TZID=Europe/Berlin:20261118T100000\nRDATE;TZID=Europe/Berlin:20261117T150000\nLOCATION:worker",
  "UID:series\nRECURRENCE-ID;TZID=Europe/Berlin:20261119T100000\nSTATUS:CANCELLED",
  "UID:series\nRECURRENCE-ID;TZID=Europe/Berlin:20261120T100000\nDTSTART;TZID=Europe/Berlin:20261120T120000\nDURATION:PT2H\nLOCATION:worker\nSUMMARY:Moved");
is scalar @$result, 13, 'old unbounded recurrence expanded only into window, with exceptions and addition';
ok !(grep {$_->{start} =~ /^2026-11-(18|19)T/} @$result), 'excluded and cancelled occurrences removed';
is scalar(grep {$_->{summary} eq 'Moved' && $_->{start} eq '2026-11-20T12:00:00+0100'} @$result), 1, 'override replaces original occurrence';
my $dst = $parser->events(cal("UID:dst\nDTSTART;VALUE=DATE:20260328\nDTEND;VALUE=DATE:20260330\nRRULE:FREQ=WEEKLY;COUNT=2\nLOCATION:worker"),
  now => epoch('20260327T000000Z'), until => epoch('20260410T000000Z'), hosts => ['worker']);
is $dst->[0]{end}, '2026-03-30T00:00:00+0200', 'all-day end stays at midnight across DST';
is $dst->[1]{end}, '2026-04-06T00:00:00+0200', 'recurring all-day duration stays in calendar days';
$result = events("UID:until\nDTSTART;TZID=Europe/Berlin:20261116T140000\nDURATION:PT1H\nRRULE:FREQ=DAILY;UNTIL=20261118T130000Z\nLOCATION:worker");
is scalar @$result, 3, 'UTC UNTIL includes last local occurrence exactly';
is $result->[-1]{start}, '2026-11-18T14:00:00+0100', 'recurrence retains event time zone';
$result = events("UID:count\nDTSTART:20261117T100000Z\nDURATION:PT1H\nRRULE:FREQ=DAILY;COUNT=2\nLOCATION:worker");
is scalar @$result, 2, 'COUNT includes DTSTART without duplicating it';
my $dst_timed = $parser->events(cal("UID:dsttimed\nDTSTART;TZID=Europe/Berlin:20260328T100000\nDURATION:PT1H\nRRULE:FREQ=DAILY;COUNT=3\nLOCATION:worker"),
  now => epoch('20260327T000000Z'), until => epoch('20260401T000000Z'), hosts => ['worker']);
is_deeply [map {$_->{start}} @$dst_timed], ['2026-03-28T10:00:00+0100', '2026-03-29T10:00:00+0200', '2026-03-30T10:00:00+0200'], 'daily maintenance preserves local wall time across DST';
for my $bad ('<html>Error</html>', "BEGIN:VCALENDAR\n", cal("UID:bad\nDTSTART:invalid\nLOCATION:worker"),
  cal("UID:bad\nDTSTART;TZID=Unknown/Zone:20261117T100000\nLOCATION:worker")) {
  ok !eval {$parser->events($bad, now => 0, until => 1, hosts => ['worker']); 1}, 'invalid feed rejected';
}
$result = events("UID:cancelseries\n$common\nRRULE:FREQ=DAILY\nSTATUS:CANCELLED",
  "UID:cancelseries\nRECURRENCE-ID:20261118T100000Z\nDTSTART:20261118T110000Z\nDURATION:PT1H\nLOCATION:worker");
is scalar @$result, 0, 'cancelled series suppresses its old exception components';
{
  my @warnings;
  local $SIG{__WARN__} = sub {push @warnings, @_};
  my $feed = cal("UID:metadata\n$common");
  $feed =~ s/VERSION:2.0/VERSION:2.0\nREFRESH-INTERVAL;VALUE=DURATION:PT4H/;
  $parser->events($feed, now => epoch('20261116T120000Z'), until => epoch('20261130T120000Z'), hosts => ['worker']);
  is scalar @warnings, 0, 'Nextcloud REFRESH-INTERVAL metadata causes no warnings';
}
my $small = Mojolicious::Plugin::DowntimeCalendar::Calendar->new(max_occurrences => 2);
ok !eval {$small->events(cal("UID:dense\nDTSTART:20261116T120000Z\nDURATION:PT1H\nRRULE:FREQ=MINUTELY\nLOCATION:worker"), now => epoch('20261116T120000Z'), until => epoch('20261117T120000Z'), hosts => ['worker']); 1}, 'recurrence expansion bounded';
done_testing;
