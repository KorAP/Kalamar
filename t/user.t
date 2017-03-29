use Mojo::Base -strict;
use lib;
use Test::More;
use Test::Mojo;
use Data::Dumper;

$ENV{MOJO_USERAGENT_DEBUG} = 1;

my $t = Test::Mojo->new('Kalamar');

my $c = $t->app->build_controller;

# Login with user credentials
ok($c->user->login('test_h', 'p278h'), 'Login with demo user');
is($c->stash('user'), 'test_h', 'Kustvakt is logged in');
like($c->stash('auth'), qr/^api_token /, 'Kustvakt is logged in');

done_testing;
__END__
