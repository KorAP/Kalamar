use Mojo::Base -strict;
use lib '../lib', 'lib';
use Test::More;
use Test::Mojo;
use Data::Dumper;

$ENV{MOJO_USERAGENT_DEBUG} = 1;

my $t = Test::Mojo->new('Kalamar');

$t->app->mode('test');

# my $c = $t->app->build_controller;

$t->get_ok('/')
  ->element_exists('form[action=/user/login] input[name=handle_or_email]');

$t->post_ok('/user/login' => form => { handle_or_email => 'test' })
  ->status_is(302);

$t->post_ok('/user/login' => form => { handle_or_email => 'test', pwd => 'xyz' });

done_testing;
__END__


ok(!$c->user->get('details'), 'User not logged in');

# Login with user credentials
ok($c->user->login('kustvakt', 'kustvakt2015'), 'Login with demo user');
is($c->stash('user'), 'kustvakt', 'Kustvakt is logged in');
like($c->stash('auth'), qr/^api_token /, 'Kustvakt is logged in');

my $details = $c->user->get('details');
is($details->{email}, 'kustvakt@ids-mannheim.de', 'Email');
is($details->{firstName}, 'Kustvakt', 'Firstname');
is($details->{lastName}, 'KorAP', 'Lastname');
is($details->{country}, 'Germany', 'Country');
is($details->{address}, 'Mannheim', 'Address');
is($details->{username}, 'kustvakt', 'Username');
is($details->{institution}, 'IDS Mannheim', 'Institution');

my $settings = $c->user->get('settings');
is($settings->{username}, 'kustvakt', 'Username');

# ok($c->user->set(details => { firstName => 'Me' }), 'Set first name');
#ok($c->user->set(details => {
#  firstName => 'Akron',
#  lastName => 'Fuxfell'
#}), 'Set first name');

# diag Dumper $c->user->get('info');

ok(1,'Fine');

done_testing;
__END__
