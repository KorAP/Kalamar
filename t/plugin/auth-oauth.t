use Mojo::Base -strict;
use Test::More;
use Test::Mojo::WithRoles 'Session';
use Mojo::File qw/path/;
use Data::Dumper;


#####################
# Start Fake server #
#####################
my $mount_point = '/realapi/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo::WithRoles->new('Kalamar' => {
  Kalamar => {
    plugins => ['Auth']
  },
  'Kalamar-Auth' => {
    client_id => 2,
    client_secret => 'k414m4r-s3cr3t',
    oauth2 => 1
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
my $fake_backend_app = $fake_backend->pattern->defaults->{app};

# Set general app logger for simplicity
$fake_backend_app->log($t->app->log);

my $access_token = $fake_backend_app->get_token('access_token');
my $refresh_token = $fake_backend_app->get_token('refresh_token');
my $access_token_2 = $fake_backend_app->get_token('access_token_2');
my $refresh_token_2 = $fake_backend_app->get_token('refresh_token_2');

# Some routes to modify the session
# This expires the session
$t->app->routes->get('/x/expire')->to(
  cb => sub {
    my $c = shift;
    $c->session(auth_exp => 0);
    return $c->render(text => 'okay')
  }
);

# This expires the session and removes the refresh token
$t->app->routes->get('/x/expire-no-refresh')->to(
  cb => sub {
    my $c = shift;
    $c->session(auth_exp => 0);
    delete $c->session->{auth_r};
    return $c->render(text => 'okay')
  }
);

# This sets an invalid token
$t->app->routes->get('/x/invalid')->to(
  cb => sub {
    my $c = shift;
    $c->session(auth_exp => time + 1000);
    $c->session(auth_r => $refresh_token_2);
    $c->session(auth => 'Bearer inv4lid');
    return $c->render(text => 'okay')
  }
);


# This sets an invalid token
$t->app->routes->get('/x/invalid-no-refresh')->to(
  cb => sub {
    my $c = shift;
    $c->session(auth_exp => time + 1000);
    delete $c->session->{auth_r};
    $c->session(auth => 'Bearer inv4lid');
    return $c->render(text => 'okay')
  }
);

# This sets an invalid refresh token
$t->app->routes->get('/x/expired-with-wrong-refresh')->to(
  cb => sub {
    my $c = shift;
    $c->session(auth_exp => 0);
    $c->session(auth => 'Bearer inv4lid');
    $c->session(auth_r => 'inv4lid');
    return $c->render(text => 'okay')
  }
);


$t->get_ok('/realapi/v1.0')
  ->status_is(200)
  ->content_is('Fake server available');

$t->get_ok('/?q=Baum')
  ->status_is(200)
  ->text_like('h1 span', qr/KorAP: Find .Baum./i)
  ->text_like('#total-results', qr/\d+$/)
  ->content_like(qr/\"authorized\"\:null/)
  ->element_exists_not('div.button.top a')
  ->element_exists_not('aside.active')
  ->element_exists_not('aside.off')
  ;

$t->get_ok('/')
  ->status_is(200)
  ->element_exists('form[action=/user/login] input[name=handle_or_email]')
  ->element_exists('aside.active')
  ->element_exists_not('aside.off')
  ;

$t->post_ok('/user/login' => form => { handle_or_email => 'test', pwd => 'fail' })
  ->status_is(302)
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', 'Bad CSRF token')
  ->element_exists('input[name=handle_or_email][value=test]')
  ->element_exists_not('div.button.top a')
  ;

$t->post_ok('/user/login' => form => { handle_or_email => 'test', pwd => 'pass' })
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
  handle_or_email => 'test',
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
  ->element_exists('input[name=handle_or_email][value=test]')
  ->element_exists_not('div.button.top a')
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

$t->post_ok('/user/login' => form => {
  handle_or_email => 'test',
  pwd => 'unknown',
  csrf_token => $csrf
})
  ->status_is(302)
  ->content_is('')
  ->header_is('Location' => '/');

$csrf = $t->get_ok('/')
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', '2022: LDAP Authentication failed due to unknown user or password!')
  ->element_exists('input[name=handle_or_email][value=test]')
  ->element_exists_not('div.button.top a')
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

$t->post_ok('/user/login' => form => {
  handle_or_email => 'test',
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
  ;

# Now the user is logged in and should be able to
# search with authorization
$t->get_ok('/?q=Baum')
  ->status_is(200)
  ->text_like('h1 span', qr/KorAP: Find .Baum./i)
  ->text_like('#total-results', qr/\d+$/)
  ->element_exists_not('div.notify-error')
  ->content_like(qr/\"authorized\"\:\"yes\"/)
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

$t->get_ok('/?q=Baum&ql=poliqarp')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->element_exists('div.notify-success')
  ->text_is('div.notify-success', 'Login successful')
  ->session_has('/auth')
  ->session_is('/auth', 'Bearer ' . $access_token)
  ->session_is('/auth_r', $refresh_token)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ;

# Expire the session
# (makes the token be marked as expired - though it isn't serverside)
$t->get_ok('/x/expire')
  ->status_is(200)
  ->content_is('okay')
  ;

## It may be a problem, but the cache is still valid
$t->get_ok('/?q=Baum')
  ->status_is(200)
  ->text_like('h1 span', qr/KorAP: Find .Baum./i)
  ->text_like('#total-results', qr/\d+$/)
  ->content_like(qr/\"authorized\"\:\"yes\"/)
  ->header_is('X-Kalamar-Cache', 'true')
  ;

# Query without partial cache (unfortunately) (but no total results)
$t->get_ok('/?q=baum&cutoff=true')
  ->status_is(200)
  ->session_is('/auth', 'Bearer ' . $access_token_2)
  ->session_is('/auth_r', $refresh_token_2)
  ->text_is('#error','')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->content_like(qr/\"authorized\"\:\"yes\"/)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->content_like(qr!\"cutOff":true!)
  ->element_exists_not('#total-results')
  ;

# Expire the session and remove the refresh option
$t->get_ok('/x/expire-no-refresh')
  ->status_is(200)
  ->content_is('okay')
  ;

$t->app->defaults(no_cache => 1);


$t->get_ok('/x/invalid-no-refresh')
  ->status_is(200)
  ->content_is('okay')
  ;

# Query without cache
# The token is invalid and can't be refreshed!
$t->get_ok('/?q=baum&cutoff=true')
  ->status_is(200)
  ->session_hasnt('/auth')
  ->session_hasnt('/auth_r')
  ->text_is('#error','')
  ->text_is('div.notify-error','Access token invalid')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->content_unlike(qr/\"authorized\"\:\"yes\"/)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->element_exists('p.no-results')
  ;

$t->get_ok('/x/invalid')
  ->status_is(200)
  ->content_is('okay')
  ;

# Query without cache
# The token is invalid and can't be refreshed!
$t->get_ok('/?q=baum&cutoff=true')
  ->status_is(200)
  ->session_is('/auth', 'Bearer ' . $access_token_2)
  ->session_is('/auth_r', $refresh_token_2)
  ->text_is('#error','')
  ->element_exists_not('div.notify-error','Access token invalid')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->content_like(qr/\"authorized\"\:\"yes\"/)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->element_exists_not('p.no-results')
  ;


$t->get_ok('/x/expired-with-wrong-refresh')
  ->status_is(200)
  ->content_is('okay')
  ;


# The token is invalid and can't be refreshed!
$t->get_ok('/?q=baum&cutoff=true')
  ->status_is(200)
  ->session_hasnt('/auth')
  ->session_hasnt('/auth_r')
  ->text_is('#error','')
  ->text_is('div.notify-error','Refresh token is expired')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->content_unlike(qr/\"authorized\"\:\"yes\"/)
  ->element_exists('p.no-results')
  ;


done_testing;
__END__

