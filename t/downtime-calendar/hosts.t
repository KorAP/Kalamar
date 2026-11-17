use strict;
use warnings;
use Test::More;
use lib 'lib';
use Mojolicious::Plugin::DowntimeCalendar::Hosts;
my $class = 'Mojolicious::Plugin::DowntimeCalendar::Hosts';
local $ENV{KORAP_HOSTNAME} = 'Korap-Worker-08.ids-mannheim.de.';
my $hosts = $class->discover(resolve => 0);
is_deeply $hosts, ['korap-worker-08', 'korap-worker-08.ids-mannheim.de'], 'environment supplies physical host and short alias';
for my $location ('KORAP-WORKER-08.IDS-MANNHEIM.DE.', 'other, korap-worker-08', 'other;korap-worker-08', '*') {
  ok $class->matches($location, $hosts), "matches $location";
}
for my $location ('', 'worker-08', 'korap-worker-080', 'korap-worker-08.example.org', 'https://korap-worker-08', 'prefix-korap-worker-08') {
  ok !$class->matches($location, $hosts), "does not match $location";
}
is_deeply $class->discover(hosts => ['head.example.org', '192.0.2.8'], resolve => 0),
  ['192.0.2.8', 'head', 'head.example.org'], 'explicit configuration overrides environment';
ok $class->matches('[2001:db8::1]', ['2001:db8::1']), 'bracketed IPv6';
ok $class->matches('2001:0db8:0:0:0:0:0:1', ['2001:db8::1']), 'IPv6 canonicalization';
ok !$class->matches('192.0.2.80', ['192.0.2.8']), 'exact IPv4';
{
  local $ENV{KORAP_HOSTNAME};
  ok @{$class->discover(resolve => 0)}, 'local hostname fallback';
}
done_testing;
