use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/path/;
use Mojo::ByteStream 'b';
use Data::Dumper;


#####################
# Start Fake server #
#####################
my $mount_point = '/realapi/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['Auth']
  }
});

# Mount fake backend
# Get the fixture path
my $fixtures_path = path(Mojo::File->new(__FILE__)->dirname, '..', 'server');
my $fake_backend = $t->app->plugin(
  Mount => {
    $mount_point =>
      $fixtures_path->child('mock.pl')
  }
);
# Configure fake backend
$fake_backend->pattern->defaults->{app}->log($t->app->log);

my $q = qr!(?:\"|&quot;)!;

$t->get_ok('/realapi/v1.0')
  ->status_is(200)
  ->content_is('Fake server available');

$t->get_ok('/?q=Baum')
  ->status_is(200)
  ->text_like('h1 span', qr/KorAP: Find .Baum./i)
  ->text_like('#total-results', qr/\d+$/)
  ->content_like(qr/${q}authorized${q}:null/)
  ->element_exists_not('div.button.top a')
  ->element_exists_not('aside.active')
  ->element_exists_not('aside.off')
  ;

$t->get_ok('/')
  ->status_is(200)
  ->element_exists('form[action=/user/login] input[name=handle]')
  ->element_exists('aside.active')
  ->element_exists_not('aside.off')
  ;

$t->post_ok('/user/login' => form => { handle => 'test', pwd => 'fail' })
  ->status_is(302)
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', 'Bad CSRF token')
  ->element_exists('input[name=handle][value=test]')
  ->element_exists_not('div.button.top a')
  ;

$t->post_ok('/user/login' => form => { handle => 'test', pwd => 'pass' })
  ->status_is(302)
  ->header_is('Location' => '/');

my $csrf = $t->get_ok('/')
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', 'Bad CSRF token')
  ->element_exists_not('div.button.top a')
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

$t->post_ok('/user/login' => form => {
  handle => 'test',
  pwd => 'ldaperr',
  csrf_token => $csrf
})
  ->status_is(302)
  ->content_is('')
  ->header_is('Location' => '/');

$csrf = $t->get_ok('/')
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', '2022: LDAP Authentication failed due to unknown user or password!')
  ->element_exists('input[name=handle][value=test]')
  ->element_exists_not('div.button.top a')
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

$t->post_ok('/user/login' => form => {
  handle => 'test',
  pwd => 'unknown',
  csrf_token => $csrf
})
  ->status_is(302)
  ->content_is('')
  ->header_is('Location' => '/');

$csrf = $t->get_ok('/')
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', 'Access denied')
  ->element_exists('input[name=handle][value=test]')
  ->element_exists_not('div.button.top a')
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

$t->post_ok('/user/login' => form => {
  handle => 'test',
  pwd => 'pass',
  csrf_token => $csrf
})
  ->status_is(302)
  ->content_is('')
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->element_exists('div.notify-success')
  ->text_is('div.notify-success', 'Login successful')
  ->element_exists('aside.off')
  ->element_exists_not('aside.active')
  ->attr_is('a.logout', 'title', "Logout: test")
  ;

# Now the user is logged in and should be able to
# search with authorization
$t->get_ok('/?q=Baum')
  ->status_is(200)
  ->text_like('h1 span', qr/KorAP: Find .Baum./i)
  ->text_like('#total-results', qr/\d+$/)
  ->element_exists_not('div.notify-error')
  ->content_like(qr/${q}authorized${q}:${q}test${q}/)
  ->element_exists('div.button.top a')
  ->element_exists('div.button.top a.logout[title~="test"]')
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
  ->content_like(qr/${q}authorized${q}:null/)
  ;

# Get redirect
my $fwd = $t->get_ok('/?q=Baum&ql=poliqarp')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->tx->res->dom->at('input[name=fwd]')->attr('value')
  ;

is($fwd, '/?q=Baum&ql=poliqarp', 'Redirect is valid');

$t->post_ok('/user/login' => form => {
  handle => 'test',
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

# UTF8 request
my $username = b('täst')->encode;
$t->post_ok('/user/login' => form => {
  handle => $username,
  pwd => 'pass',
  csrf_token => $csrf,
  fwd => $fwd
})
  ->status_is(302)
  ->header_is('Location' => '/?q=Baum&ql=poliqarp');

$t->get_ok('/')
  ->element_exists('div.notify-success')
  ->attr_is('a.logout', 'title', "Logout: $username")
  ;

# Logout
$t->get_ok('/user/logout')
  ->status_is(302)
  ->header_is('Location' => '/');

$csrf = $t->get_ok('/')
  ->status_is(200)
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

# This should fail
my $wide_char_login = "\x{61}\x{E5}\x{61}"; # "\x{443}\x{434}";

$t->post_ok('/user/login' => form => {
  handle => $wide_char_login,
  pwd => 'pass',
  csrf_token => $csrf,
  fwd => $fwd
})
  ->status_is(302)
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', 'Invalid character in request')
  ->element_exists('input[name=handle]:not([value])')
  ->element_exists_not('div.button.top a')
  ;

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
