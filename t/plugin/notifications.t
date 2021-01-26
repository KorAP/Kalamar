use Mojolicious;
use Test::Mojo;
use Test::More;

my $app = Mojolicious->new;
my $t = Test::Mojo->new($app);

# Client notifications
$app->plugin(Notifications => {
  'Kalamar::Plugin::Notifications' => 1,
  JSON => 1,
  HTML => 1
});

my $c = $app->build_controller;

is($c->notifications('Kalamar::Plugin::Notifications'), '');

$c->notify(warn => 'Error');
$c->notify('warn' => 20, 'Hmmm');
$c->notify('success' => {src => 'Kustvakt'}, 'Hmmm');

my $n = $c->notifications('Kalamar::Plugin::Notifications');

like($n, qr!^<noscript>.*</noscript>$!s);
like($n, qr!<div class="notify notify-warn" data-type="warn">Error</div>!);
like($n, qr!<div class="notify notify-warn" data-type="warn">Hmmm</div>!);
like($n, qr!<div class="notify notify-success" data-type="success" data-src="Kustvakt">Hmmm</div>!);

done_testing;
__END__
