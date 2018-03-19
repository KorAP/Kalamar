use Mojo::Base -strict;
use lib '../lib', 'lib';
use Test::More;
use Test::Mojo;
use Data::Dumper;

$ENV{MOJO_MODE} = 'test';

my $t = Test::Mojo->new('Kalamar');

$t->app->defaults(auth_support => 1);

$t->get_ok('/?q=Baum')
  ->status_is(200)
  ->text_like('h1 span', qr/KorAP: Find .Baum./i)
  ->text_like('#total-results', qr/\d+$/)
  ->content_like(qr/\"authorized\"\:null/)
  ;

$t->get_ok('/')
  ->element_exists('form[action=/user/login] input[name=handle_or_email]');

$t->post_ok('/user/login' => form => { handle_or_email => 'test', pwd => 'fail' })
  ->status_is(302)
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->element_exists('input[name=handle_or_email][value=test]')
  ;

$t->post_ok('/user/login' => form => { handle_or_email => 'test', pwd => 'pass' })
  ->status_is(302)
  ->header_is('Location' => '/');

my $csrf = $t->get_ok('/')
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', 'Bad CSRF token')
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

$t->post_ok('/user/login' => form => { handle_or_email => 'test', pwd => 'pass', csrf_token => $csrf })
  ->status_is(302)
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->element_exists('div.notify-success')
  ->text_is('div.notify-success', 'Login successful')
  ;

# Now the user is logged in and should be able to
# search with authorization
$t->get_ok('/?q=Baum')
  ->status_is(200)
  ->text_like('h1 span', qr/KorAP: Find .Baum./i)
  ->text_like('#total-results', qr/\d+$/)
  ->element_exists_not('div.notify-error')
  ->content_like(qr/\"authorized\"\:\"test\"/)
  ;


# Logout
$t->get_ok('/user/logout')
  ->status_is(302)
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->element_exists('div.notify-success')
  ->text_is('div.notify-success', 'Logout successful')
  ;

$t->get_ok('/?q=Baum')
  ->status_is(200)
  ->text_like('h1 span', qr/KorAP: Find .Baum./i)
  ->text_like('#total-results', qr/\d+$/)
  ->content_like(qr/\"authorized\"\:null/)
  ;

# Get redirect
my $fwd = $t->get_ok('/?q=Baum&ql=poliqarp')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->tx->res->dom->at('input[name=fwd]')->attr('value')
  ;

is($fwd, '/?q=Baum&ql=poliqarp', 'Redirect is valid');

$t->post_ok('/user/login' => form => {
  handle_or_email => 'test',
  pwd => 'pass',
  csrf_token => $csrf,
  fwd => 'http://bad.example.com/test'
})
  ->status_is(302)
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->element_exists_not('div.notify-success')
  ->text_is('div.notify-error', 'Redirect failure')
  ;

$t->post_ok('/user/login' => form => {
  handle_or_email => 'test',
  pwd => 'pass',
  csrf_token => $csrf,
  fwd => $fwd
})
  ->status_is(302)
  ->header_is('Location' => '/?q=Baum&ql=poliqarp');




done_testing;
__END__


# Login mit falschem Nutzernamen:
# 400 und:
{"errors":[[2022,"LDAP Authentication failed due to unknown user or password!"]]}



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
