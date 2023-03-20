use Mojo::Base -strict;
use Test::More;
use Mojo::ByteStream 'b';
use Test::Mojo::WithRoles 'Session';
use Mojo::File qw/path tempfile/;
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
    oauth2 => 1,
    experimental_client_registration => 1
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
  ->element_exists('form[action=/user/login] input[name=handle_or_email]')
  ->element_exists('aside.active')
  ->element_exists_not('aside.off')
  ;

$t->get_ok('/settings/oauth')
  ->status_is(401)
  ->text_is('p.no-results', 'Not authenticated')
  ;

$t->get_ok('/settings/marketplace')
  ->status_is(401)
  ->text_is('p.no-results', 'Not authenticated')
  ;

# Test for bug with long password
$t->post_ok('/user/login' => form => {
  handle_or_email => 'test',
  pwd => 'kjskjhndkjndqknaskjnakjdnkjdankajdnkjdsankjdsakjdfkjahzroiuqzriudjoijdmlamdlkmdsalkmdl' })
  ->status_is(302)
  ->header_is('Location' => '/');

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
  ->element_exists_not('div.notify-success')
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
  ->element_exists_not('aside.off')
  ->element_exists_not('aside.active')
  ->element_exists('aside.settings')
  ;

# Now the user is logged in and should be able to
# search with authorization
$t->get_ok('/?q=Baum')
  ->status_is(200)
  ->session_has('/auth')
  ->session_is('/auth', 'Bearer ' . $access_token)
  ->session_is('/auth_r', $refresh_token)
  ->session_is('/user', 'test')
  ->text_like('h1 span', qr/KorAP: Find .Baum./i)
  ->text_like('#total-results', qr/\d+$/)
  ->element_exists_not('div.notify-error')
  ->content_like(qr/${q}authorized${q}:${q}yes${q}/)
  ->element_exists('div.button.top a')
  ->element_exists('div.button.top a.logout[title~="test"]')
  ;

$t->get_ok('/?q=Paum')
  ->status_is(200)
  ->text_like('h1 span', qr/KorAP: Find .Paum./i)
  ->text_is('#total-results', '')
  ->content_like(qr/${q}authorized${q}:${q}yes${q}/)
  ->element_exists_not('p.hint')
  ;

# Query with error
$t->get_ok('/?q=error')
  ->status_is(400)
  ->text_is('#notifications .notify-error','500: Internal Server Error')
;

# Logout
$t->get_ok('/user/logout')
  ->status_is(302)
  ->session_hasnt('/auth')
  ->session_hasnt('/auth_r')
  ->session_hasnt('/user')
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->element_exists('div.notify-success')
  ->text_is('div.notify-success', 'Logout successful')
  ->element_exists("input[name=handle_or_email]")
  ->element_exists("input[name=handle_or_email][value=test]")
  ;

$t->get_ok('/?q=Baum')
  ->status_is(200)
  ->text_like('h1 span', qr/KorAP: Find .Baum./i)
  ->text_like('#total-results', qr/\d+$/)
  ->content_like(qr/${q}authorized${q}:null/)
  ;

$t->get_ok('/?q=Paum')
  ->status_is(200)
  ->text_like('h1 span', qr/KorAP: Find .Paum./i)
  ->text_is('#total-results', '')
  ->content_like(qr/${q}authorized${q}:null/)
  ->text_is('p.hint', 'Maybe you need to log in first?')
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
  ->content_like(qr/${q}authorized${q}:${q}yes${q}/)
  ->header_is('X-Kalamar-Cache', 'true')
  ;

# Query without partial cache (unfortunately) (but no total results)
my $err = $t->get_ok('/?q=baum&cutoff=true')
  ->status_is(200)
  ->session_is('/auth', 'Bearer ' . $access_token_2)
  ->session_is('/auth_r', $refresh_token_2)
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->content_like(qr/${q}authorized${q}:${q}yes${q}/)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->content_like(qr!${q}cutOff${q}:true!)
  ->element_exists_not('#total-results')
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');

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
$err = $t->get_ok('/?q=baum&cutoff=true')
  ->status_is(400)
  ->session_hasnt('/auth')
  ->session_hasnt('/auth_r')
  ->text_is('div.notify-error','Access token invalid')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->content_unlike(qr/${q}authorized${q}:${q}yes${q}/)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->element_exists('p.no-results')
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');


$t->get_ok('/x/invalid')
  ->status_is(200)
  ->content_is('okay')
  ;

# Query without cache
# The token is invalid and can't be refreshed!
$err = $t->get_ok('/?q=baum&cutoff=true')
  ->status_is(200)
  ->session_is('/auth', 'Bearer ' . $access_token_2)
  ->session_is('/auth_r', $refresh_token_2)
  ->element_exists_not('div.notify-error','Access token invalid')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->content_like(qr/${q}authorized${q}:${q}yes${q}/)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->element_exists_not('p.no-results')
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');


$t->get_ok('/x/expired-with-wrong-refresh')
  ->status_is(200)
  ->content_is('okay')
  ;


# The token is invalid and can't be refreshed!
my $dom = $t->get_ok('/?q=baum&cutoff=true')
  ->status_is(400)
  ->session_hasnt('/auth')
  ->session_hasnt('/auth_r')
  ->text_is('div.notify-error','Refresh token is expired')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->content_unlike(qr/${q}authorized${q}:${q}yes${q}/)
  ->element_exists('p.no-results')
  ->tx->res->dom;

$csrf = $dom->at('input[name="csrf_token"]')
  ->attr('value')
  ;

$err = $dom->at('#error');
is(defined $err ? $err->text : '', '');


# This should fail
my $wide_char_login = "\x{61}\x{E5}\x{61}"; # "\x{443}\x{434}";
$t->post_ok('/user/login' => form => {
  handle_or_email => $wide_char_login,
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
  ->element_exists('input[name=handle_or_email]:not([value])')
  ->element_exists_not('div.button.top a')
  ;

# Login:
# UTF8 request
my $username = b('täst')->encode;
$t->post_ok('/user/login' => form => {
  handle_or_email => $username,
  pwd => 'pass',
  csrf_token => $csrf
})
  ->status_is(302)
  ->content_is('')
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->content_type_is('text/html;charset=UTF-8')
  ->element_exists_not('div.notify-error')
  ->element_exists('div.notify-success')
  ->text_is('div.notify-success', 'Login successful')
  # Weird error in certain environments otherwise
  ->attr_like('a.logout', 'title', qr!^Logout: t.+st$!)
  ->element_exists_not('aside.off')
  ->element_exists_not('aside.active')
  ->element_exists('aside.settings')
  ;

$t->get_ok('/settings/oauth')
  ->text_is('form.form-table legend', 'Register new client application')
  ->attr_is('form.oauth-register','action', '/settings/oauth/register')
  ->text_is('label[for=name]','Name of the client application')
  ->text_is('label[for=type]','Type of the client application')
  ->text_is('label[for=desc]','Short description')
  ->text_is('label[for=url]','Homepage')
  ->text_is('label[for=redirect_uri]','Redirect URI')
  ->text_is('label[for=src]','Declaration of the plugin (*.json file)')
  ->element_exists('ul.client-list')
  ->element_exists_not('ul.client-list > li')
  ->header_is('Cache-Control','max-age=0, no-cache, no-store, must-revalidate')
  ->header_is('Expires','Thu, 01 Jan 1970 00:00:00 GMT')
  ->header_is('Pragma','no-cache')
  ;


$t->get_ok('/settings/marketplace')
  ->status_is(200)
  ->text_is('html head title' => 'Marketplace')
  ->element_exists_not('ul.plugin_list')
  ->element_exists_not('ul.plugin_in-list')
  ;

$csrf = $t->post_ok('/settings/oauth/register' => form => {
  name => 'MyApp',
  type => 'PUBLIC',
  desc => 'This is my plugin application'
})
  ->text_is('div.notify-error', 'Bad CSRF token')
  ->tx->res->dom->at('input[name="csrf_token"]')
  ->attr('value')
  ;

$t->post_ok('/settings/oauth/register' => form => {
  name => 'MyApp',
  type => 'PUBLIC',
  desc => 'This is my plugin application',
  csrf_token => $csrf,
  src => {
    filename => '',
    content => ''
  }
})
  ->status_is(200)
  ->element_exists('div.notify-success')
  ->text_is('legend', 'Client Credentials')
  ->text_is('label[for=client_id]', 'ID of the client application')
  ->element_exists('input[name=client_id][readonly][value]')
  ->element_exists_not('input[name=client_secret][readonly][value]')
  ->header_is('Cache-Control','max-age=0, no-cache, no-store, must-revalidate')
  ->header_is('Expires','Thu, 01 Jan 1970 00:00:00 GMT')
  ->header_is('Pragma','no-cache')
  ;

my $anchor = $t->get_ok('/settings/oauth')
  ->text_is('.form-table legend', 'Register new client application')
  ->attr_is('.oauth-register','action', '/settings/oauth/register')
  ->text_is('ul.client-list > li > span.client-name a', 'MyApp')
  ->text_is('ul.client-list > li > p.client-desc', 'This is my plugin application')
  ->header_is('Cache-Control','max-age=0, no-cache, no-store, must-revalidate')
  ->header_is('Expires','Thu, 01 Jan 1970 00:00:00 GMT')
  ->header_is('Pragma','no-cache')
  ->tx->res->dom->at('ul.client-list > li > p.client-url a')
  ;
is(defined $anchor ? $anchor->text : '', '');

$t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ->status_is(200)
  ->text_is('ul.client-list > li.client > span.client-name', 'MyApp')
  ->text_is('ul.client-list > li.client > p.client-desc', 'This is my plugin application')
  ->text_is('a.client-unregister', 'Unregister')
  ->attr_is('a.client-unregister', 'href', '/settings/oauth/fCBbQkA2NDA3MzM1Yw==/unregister?name=MyApp')
  ;

$csrf = $t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==/unregister?name=MyApp')
  ->content_like(qr!Do you really want to unregister \<span class="client-name"\>MyApp\<\/span\>?!)
  ->attr_is('.form-table input[name=client-name]', 'value', 'MyApp')
  ->header_is('Cache-Control','max-age=0, no-cache, no-store, must-revalidate')
  ->header_is('Expires','Thu, 01 Jan 1970 00:00:00 GMT')
  ->header_is('Pragma','no-cache')
  ->tx->res->dom->at('input[name="csrf_token"]')
  ->attr('value')
  ;

$t->post_ok('/settings/oauth/xxxx==/unregister' => form => {
  'client-name' => 'MyApp',
  'csrf_token' => $csrf
})->status_is(302)
  ->content_is('')
  ->header_is('Location' => '/settings/oauth')
  ;

$t->get_ok('/settings/oauth')
  ->text_is('.form-table legend', 'Register new client application')
  ->attr_is('.oauth-register','action', '/settings/oauth/register')
  ->element_exists('ul.client-list > li')
  ->text_is('div.notify', 'Unknown client with xxxx==.')
  ->header_is('Cache-Control','max-age=0, no-cache, no-store, must-revalidate')
  ->header_is('Expires','Thu, 01 Jan 1970 00:00:00 GMT')
  ->header_is('Pragma','no-cache')
  ;

$t->post_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==/unregister' => form => {
  'client-name' => 'MyApp',
  'csrf_token' => $csrf
})->status_is(302)
  ->content_is('')
  ->header_is('Location' => '/settings/oauth')
  ;

$t->get_ok('/settings/oauth')
  ->text_is('.form-table legend', 'Register new client application')
  ->attr_is('.oauth-register','action', '/settings/oauth/register')
  ->element_exists_not('ul.client-list > li')
  ->text_is('div.notify-success', 'Successfully deleted MyApp')
  ->header_is('Cache-Control','max-age=0, no-cache, no-store, must-revalidate')
  ->header_is('Expires','Thu, 01 Jan 1970 00:00:00 GMT')
  ->header_is('Pragma','no-cache')
  ;

$t->post_ok('/settings/oauth/register' => form => {
  name => 'MyApp2',
  type => 'PUBLIC',
  desc => 'This is my plugin application',
  csrf_token => $csrf
})->status_is(200)
  ->element_exists('div.notify-success')
  ->text_is('legend', 'Client Credentials')
  ->text_is('label[for=client_id]', 'ID of the client application')
  ->element_exists('input[name=client_id][readonly][value]')
  ->element_exists_not('input[name=client_secret][readonly][value]')
  ->header_is('Cache-Control','max-age=0, no-cache, no-store, must-revalidate')
  ->header_is('Expires','Thu, 01 Jan 1970 00:00:00 GMT')
  ->header_is('Pragma','no-cache')
  ->element_exists('.client-issue-token')
  ;

$t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ->text_is('.client-name', 'MyApp2')
  ->text_is('.client-desc', 'This is my plugin application')
  ->text_is('.client-issue-token', 'Issue new token')
  ->attr_is('.client-issue-token', 'href', '/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token?name=MyApp2')
  ->header_is('Cache-Control','max-age=0, no-cache, no-store, must-revalidate')
  ->header_is('Expires','Thu, 01 Jan 1970 00:00:00 GMT')
  ->header_is('Pragma','no-cache')
  ->text_is('ul.token-list label[for=token]', 'Access Token')
  ->text_is('p[name=created]', 'Created at ')
  ->text_is('p[name=expires]', 'Expires in 31533851 seconds.')
  ->element_exists('.client-issue-token')
  ;

$csrf = $t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token?name=MyApp2')
  ->status_is(200)
  ->attr_is('#issue-token','action', '/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token')
  ->attr_is('input[name=client-id]', 'value', 'fCBbQkA2NDA3MzM1Yw==')
  ->attr_is('input[name=name]', 'value', 'MyApp2')
  ->header_is('Cache-Control','max-age=0, no-cache, no-store, must-revalidate')
  ->header_is('Expires','Thu, 01 Jan 1970 00:00:00 GMT')
  ->header_is('Pragma','no-cache')
  ->text_is('a.button-abort', 'Abort')
  ->attr_is('#issue-token input[type=submit]', 'value', 'Issue new token')
  ->content_like(qr!Issue a new token for!)
  ->tx->res->dom->at('input[name="csrf_token"]')
  ->attr('value')
  ;

$t->post_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token' => form => {
  csrf_token => $csrf,
  name => 'MyApp2',
  'client-id' => 'fCBbQkA2NDA3MzM1Yw=='
})
  ->status_is(302)
  ->header_is('Location','/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ;

$t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ->status_is(200)
  ->text_is('div.notify-success', 'New access token created')
  ->status_is(200)
  ->header_is('Cache-Control','max-age=0, no-cache, no-store, must-revalidate')
  ->header_is('Expires','Thu, 01 Jan 1970 00:00:00 GMT')
  ->header_is('Pragma','no-cache')
  ;

$t->post_ok('/settings/oauth/307/token' => form => {
  csrf_token => $csrf,
  name => 'MyApp2',
})
  ->status_is(302)
  ->header_is('Location','/settings/oauth/307')
  ;

$t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ->status_is(200)
  ->text_is('div.notify-success', 'New access token created')
  ->status_is(200)
  ->header_is('Cache-Control','max-age=0, no-cache, no-store, must-revalidate')
  ->header_is('Expires','Thu, 01 Jan 1970 00:00:00 GMT')
  ->header_is('Pragma','no-cache')
  ;


$csrf = $t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ->status_is(200)
  ->attr_is('form.token-revoke', 'action', '/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token/revoke')
  ->attr_is('form.token-revoke input[name=token]', 'value', 'jhkhkjhk_hjgjsfz67i')
  ->attr_is('form.token-revoke input[name=name]', 'value', 'MyApp2')
  ->tx->res->dom->at('input[name="csrf_token"]')
  ->attr('value')
  ;

$t->post_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token/revoke' => form => {
  csrf_token => $csrf,
  name => 'MyApp2',
  token => 'jhkhkjhk_hjgjsfz67i'
})
  ->status_is(200)
  ->attr_is('form#revoke-token','action','/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token?_method=DELETE')
  ->attr_is('form#revoke-token','method','POST')
  ->attr_is('form#revoke-token input[name=token]','value','jhkhkjhk_hjgjsfz67i')
  ->text_is('a.button-abort', 'Abort')
  ->attr_is('#revoke-token input[type=submit]', 'value', 'Revoke')
  ->content_like(qr!Revoke a token for!)
;


# CSRF missing
$t->post_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token?_method=DELETE' => form => {
  name => 'MyApp2',
  token => 'jhkhkjhk_hjgjsfz67i'
})->status_is(302)
  ->header_is('Location','/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ;

$t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ->element_exists_not('div.notify-success')
  ->text_is('div.notify-error', 'Bad CSRF token')
  ;

# Token missing
$t->post_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token?_method=DELETE' => form => {
  name => 'MyApp2',
  csrf_token => $csrf,
})->status_is(302)
  ->header_is('Location','/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ;

$t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ->element_exists_not('div.notify-success')
  ->text_is('div.notify-error', 'Some fields are invalid')
  ;

$t->post_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token?_method=DELETE' => form => {
  name => 'MyApp2',
  csrf_token => $csrf,
  token => 'jhkhkjhk_hjgjsfz67i'
})->status_is(302)
  ->header_is('Location','/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ;

$t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ->element_exists_not('div.notify-error')
  ->text_is('div.notify-success', 'Token was revoked successfully')
  ;

$t->app->routes->get('/x/redirect-target')->to(
  cb => sub {
    my $c = shift;
    return $c->render(text => 'redirected');
  }
);

$csrf = $t->post_ok('/settings/oauth/register' => form => {
  name => 'MyConfApp',
  type => 'CONFIDENTIAL',
  desc => 'This is my plugin application',
})
  ->text_is('div.notify-error', 'Bad CSRF token')
  ->tx->res->dom->at('input[name="csrf_token"]')
  ->attr('value')
  ;

$t->post_ok('/settings/oauth/register' => form => {
  name => 'MyConfApp',
  type => 'CONFIDENTIAL',
  desc => 'This is my confidential application',
  csrf_token => $csrf,
  redirect_uri => 'http://localhost/redirect-target'
})
  ->text_is('div.notify-error', undef)
  ->text_is('li.client span.client-name', 'MyConfApp')
  ->text_is('li.client p.client-desc', 'This is my confidential application')
  ->text_is('li.client .client-redirect-uri tt', 'http://localhost/redirect-target')
  ->text_is('li.client .client-type tt', 'CONFIDENTIAL')
  ->element_exists_not('.client-issue-token')
  ;

$t->post_ok('/settings/oauth/register' => form => {
  name => 'MyConfApp2',
  type => 'CONFIDENTIAL',
  desc => 'This is my second confidential application',
  csrf_token => $csrf,
  redirect_uri => 'http://localhost/FAIL'
})
  ->status_is(302)
  ->header_is('location','/settings/oauth/')
  ;

$t->get_ok('/settings/oauth/')
  ->text_is('div.notify-error', 'invalid_request: http://localhost/FAIL is invalid.')
  ;

# OAuth client authorization flow
$t->get_ok(Mojo::URL->new('/settings/oauth/authorize'))
  ->status_is(302)
  ->header_is('location','/settings/oauth')
  ;

$t->get_ok('/settings/oauth/')
  ->text_is('div.notify-error', 'Client ID required')
  ;

$t->get_ok(Mojo::URL->new('/settings/oauth/authorize?client_id=xyz'))
  ->status_is(302)
  ->header_is('location','/settings/oauth')
  ;

$t->get_ok('/settings/oauth/')
  ->text_is('div.notify-error', 'Scope required')
  ;

# OAuth client authorization flow
$t->get_ok(Mojo::URL->new('/settings/oauth/authorize?client_id=abc'))
  ->status_is(302)
  ->header_is('location','/settings/oauth')
  ;

$t->get_ok('/settings/oauth/')
  ->text_is('div.notify-error', 'Scope required')
  ;

# OAuth client authorization flow
$t->get_ok(Mojo::URL->new('/settings/oauth/authorize?client_id=abc&scope=match'))
  ->status_is(302)
  ->header_is('location','/settings/oauth')
  ;

$t->get_ok('/settings/oauth/')
  ->text_is('div.notify-error', 'Unknown client with abc.')
  ;

# Logout
$t->get_ok('/x/expired-with-wrong-refresh');

$t->get_ok('/user/logout')
  ->status_is(302)
  ->session_hasnt('/auth')
  ->session_hasnt('/auth_r')
  ->session_hasnt('/user')
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->element_exists('div.notify-success')
  ->text_is('div.notify-success', 'Logout successful')
  ->element_exists("input[name=handle_or_email]")
  ;

# OAuth client authorization flow - but user not logged in
$t->get_ok(Mojo::URL->new('/settings/oauth/authorize'))
  ->status_is(302)
  ->header_is('location','/')
  ;

$csrf = $t->get_ok('/')
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->element_exists_not('div.notify-success')
  ->text_is('div.notify-error', 'Client ID required')
  ->element_exists("input[name=handle_or_email]")
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

$fake_backend_app->add_client({
  "client_id" => 'xyz',
  "client_name" => 'New added client',
  "client_description" => 'This is a new client',
  "client_url" => 'http://example.com',
  "client_type" => 'CONFIDENTIAL'
#  "client_redirect_uri" => $redirect_uri
});


$fake_backend_app->add_client({
  "client_id" => 'xyz2',
  "client_name" => 'New added client',
  "client_description" => 'This is a new client',
  "client_url" => 'http://example.com',
  "client_type" => 'CONFIDENTIAL',
  "client_redirect_uri" => 'http://redirect.url/'
});

$t->get_ok('/settings/oauth/xyz2')
  ->status_is(200)
  ->text_is('li.client span.client-name','New added client')
  ->attr_is('li.client p.client-url a','href','http://example.com')
  ->attr_is('li.client input[name=client_id]','value','xyz2')
  ->element_exists('li.client p.client-type-confidential')
  ->text_is('li.client p.client-redirect-uri tt','http://redirect.url/')
  ;

$fwd = $t->get_ok(Mojo::URL->new('/settings/oauth/authorize')->query({
  client_id => 'xyz2',
  scope => 'search match',
  redirect_uri => 'http://test.com/',
}))
  ->status_is(200)
  ->text_is('div.notify-warn', 'redirect_uri host differs from registered host')
  ->element_exists_not('div.notify-error')
  ->element_exists_not('div.notify-success')
  ->element_exists("input[name=handle_or_email]")
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

$fwd = $t->get_ok(Mojo::URL->new('/settings/oauth/authorize')->query({
  client_id => 'xyz2',
  scope => 'search match',
  redirect_uri => 'http://redirect.url:9000/',
}))
  ->status_is(200)
  ->text_is('div.notify-warn', 'redirect_uri port differs from registered port')
  ->element_exists_not('div.notify-error')
  ->element_exists_not('div.notify-success')
  ->element_exists("input[name=handle_or_email]")
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;


$fake_backend_app->add_plugin({
"source" => {"key1" => 'wert1', "key2" => 'wert2'},
"client_id" => '52abc',
"permitted" => 'true',
"client_name" => 'Plugin 1',
"client_type" => 'CONFIDENTIAL',
"client_description" => 'Description Plugin 1',
"client_url" => 'http://example.client.de',
"registration_date" => '2022-05-31T14:30:09+02:00[Europe/Berlin]',
"registered_by" => 'system'
});


$fwd = $t->get_ok(Mojo::URL->new('/settings/oauth/authorize')->query({
  client_id => 'xyz',
  state => 'abcde',
  scope => 'search match',
  redirect_uri => 'http://test.com/',
}))
  ->status_is(200)
  ->attr_is('input[name=client_id]','value','xyz')
  ->attr_is('input[name=state]','value','abcde')
  ->attr_like('input[name=fwd]','value',qr!test\.com!)
  ->text_is('span.client-name','New added client')
  ->text_is('div.intro p:nth-child(2)', 'Please log in!')
  ->tx->res->dom->at('input[name=fwd]')->attr('value')
  ;

$fwd = $t->post_ok(Mojo::URL->new('/user/login')->query({
  csrf_token => $csrf,
  client_id => 'xyz',
  state => 'abcde',
  scope => 'search match',
  redirect_uri => 'http://test.com/',
  handle_or_email => 'test',
  pwd => 'pass',
  fwd => $fwd
}))
  ->status_is(302)
  ->header_like('location', qr!/settings/oauth/authorize!)
  ->tx->res->headers->header('location')
  ;

$t->get_ok($fwd)
  ->status_is(200)
  ->attr_is('input[name=client_id]','value','xyz')
  ->attr_is('input[name=state]','value','abcde')
  ->attr_like('input[name=redirect_uri]','value', qr!^http://test\.com\/\?crto=.{3,}!)
  ->text_is('ul#scopes li:nth-child(1)','search')
  ->text_is('ul#scopes li:nth-child(2)','match')
  ->text_is('span.client-name','New added client')
  ->attr_is('a.form-button','href','http://test.com/')
  ->attr_is('a.embedded-link', 'href', '/doc/korap/kalamar')
  ->element_exists_not('div.notify-error')
  ->element_exists_not('div.notify-warn')
  ->element_exists_not('blockquote.warning')
  ;

$t->get_ok('/settings/marketplace')
  ->status_is(200)
  ->text_is('html head title' => 'Marketplace')
  ->element_exists('ul.plugin-list')
  ->element_exists('ul.plugin-list > li')
  ->element_exists('p.registration_date')
  ->text_is('span.client-name','Plugin 1')
  ->text_is('p.plugin-desc','Description Plugin 1')
  ;



$fake_backend_app->add_plugin({
"source" => {"one" => '1', "two" => '2'},
"permitted" => 'false',
"client_id" => '53abc',
"client_name" => 'Plugin 2',
"client_type" => 'CONFIDENTIAL',
"client_description" =>'Description Plugin 2'
});

$t->get_ok('/settings/marketplace')
  ->status_is(200)
  ->element_exists('ul.plugin-list')
  ->element_exists('ul.plugin-list > li')
  ->text_is('span.client-name','Plugin 1')
  ->text_is('p.plugin-desc','Description Plugin 1')
  ->element_exists('ul.plugin-list > li + li')
  ->text_is('ul.plugin-list > li + li >span.client-name','Plugin 2')
  ->text_is('ul.plugin-list > li + li >p.plugin-desc','Description Plugin 2')
  ;

$t->ua->max_redirects(0);

$t->post_ok('/settings/marketplace/install-plugin', form => {'client-id' => '52abc'})
  ->status_is(302)
  ->header_is(location => '/settings/marketplace')
  ;

$t->ua->max_redirects(1);

$t->post_ok('/settings/marketplace/install-plugin', form => {'client-id' => '52abc'})
  ->status_is(200)
  ->element_exists('ul.plugin-list')
  ->element_exists('ul.plugin-list > li')
  ->text_is('ul.plugin-list > li > span.client-name','Plugin 2')
  ->text_is('ul.plugin-list > li > p.plugin-desc','Description Plugin 2')
  ->element_exists_not('ul.plugin-list > li + li')
  ->element_exists('ul.plugin_in-list')
  ->element_exists('ul.plugin_in-list > li')
  ->text_is('ul.plugin_in-list > li > span.client-name','Plugin 1')
  ->text_is('ul.plugin_in-list > li > p.inst_date','Date of Installation: 2022-12-13T16:33:27.621+01:00[Europe/Berlin]')
  ;

$t->ua->max_redirects(0);

 $t->post_ok('/settings/marketplace/install-plugin', form => {'client-id' => 'unsinn31'})
  ->status_is(302)
  ->header_is(location => '/settings/marketplace')
  ;

$t->ua->max_redirects(1);

$t->post_ok('/settings/marketplace/install-plugin', form => {'client-id' => 'unsinn31'})
  ->status_is(200)
  ->text_is('div.notify-error', 'Plugin could not be installed')
  ;

$t->ua->max_redirects(0);

$t->get_ok(Mojo::URL->new('/settings/oauth/authorize')->query({
  client_id => 'xyz',
  state => 'abcde',
  scope => 'search match',
  redirect_uri => 'http://test.com/'
}))
  ->status_is(200)
  ->attr_is('input[name=client_id]','value','xyz')
  ->attr_is('input[name=state]','value','abcde')
  ->text_is('ul#scopes li:nth-child(1)','search')
  ->text_is('ul#scopes li:nth-child(2)','match')
  ->text_is('span.client-name','New added client')
  ->attr_is('a.form-button','href','http://test.com/')
  ->attr_is('a.embedded-link', 'href', '/doc/korap/kalamar')
  ;

$t->post_ok(Mojo::URL->new('/settings/oauth/authorize')->query({
  client_id => 'xyz',
  state => 'abcde',
  scope => 'search match',
  redirect_uri => 'http://test.com/'
}))
  ->status_is(302)
  ->header_is('location', '/settings/oauth?error_description=Bad+CSRF+token')
  ;


my $local_port = $t->get_ok('/')->tx->local_port;
my $remote_port = $t->get_ok('/')->tx->remote_port;

like($local_port, qr!^\d+$!);
like($remote_port, qr!^\d+$!);

my $port = $remote_port;

my $redirect_url_fakeapi = $t->app->close_redirect_to(Mojo::URL->new('http://localhost:' . $port)->path($fake_backend_app->url_for('return_uri'))->to_abs->to_string);

$fwd = $t->post_ok(Mojo::URL->new('/settings/oauth/authorize')->query({
  client_id => 'xyz',
  state => 'abcde',
  scope => 'search match',
  redirect_uri_server => 'http://localhost:'.$port,
  redirect_uri => "$redirect_url_fakeapi",
  csrf_token => $csrf,
}))
  ->status_is(302)
  ->header_like('location', qr!^http://localhost:\d+/realapi/fakeclient/return\?code=.+$!)
  ->tx->res->headers->header('location')
  ;

unless ($^O eq 'MSWin32') {
  $t->get_ok($fwd)
    ->status_is(200)
    ->content_like(qr'welcome back! \[(.+?)\]')
    ;
};

my $fake_port = $port;

while ($fake_port == $remote_port || $fake_port == $local_port) {
  $fake_port++;
};

$redirect_url_fakeapi = $t->app->close_redirect_to(Mojo::URL->new('http://localhost:' . $fake_port)->path($fake_backend_app->url_for('return_uri'))->to_abs->to_string);

$fwd = $t->post_ok(Mojo::URL->new('/settings/oauth/authorize')->query({
  client_id => 'xyz',
  state => 'abcde',
  scope => 'search match',
  redirect_uri_server => 'http://localhost:'.$port,
  redirect_uri => "$redirect_url_fakeapi",
  csrf_token => $csrf,
}))
  ->status_is(302)
  ->header_unlike('location', qr!^http://localhost:\d+/realapi/fakeclient/return\?error_description=Connection\+refused$!)
  ->header_like('location', qr!^http://localhost:\d+/realapi/fakeclient/return\?code=.+?$!)
  ->tx->res->headers->header('location')
  ;

$t->post_ok(Mojo::URL->new('/settings/oauth/authorize')->query({
  client_id => 'xyz',
  state => 'abcde',
  scope => 'search match',
  redirect_uri_server => 'http://example.com/',
  redirect_uri => $t->app->close_redirect_to('http://wrong'),
  csrf_token => $csrf,
}))
  ->status_is(302)
  ->header_is('location', '/settings/oauth')
  ->tx->res->headers->header('location')
  ;

$t->get_ok('/settings/oauth')
  ->text_is('div.notify-error', 'Invalid redirect URI')
  ;

$t->post_ok(Mojo::URL->new('/settings/oauth/authorize')->query({
  client_id => 'xyz',
  state => 'fail',
  scope => 'search match',
# redirect_uri_server => 'http://example.com/',
  redirect_uri => $fake_backend_app->url_for('return_uri')->to_abs,
  csrf_token => $csrf,
}))
  ->status_is(302)
  ->header_is('location', '/realapi/fakeclient/return?error_description=FAIL')
  ;

my $json_post = {
  name => 'Funny',
  type => 'PUBLIC',
  desc => 'This is my plugin application 2',
  csrf_token => $csrf,
  src => 'hMMM'
};

$t->post_ok('/settings/oauth/register' => form => $json_post)
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', 'Plugin declarations need to be json files')
  ;

$json_post->{src} = {
  content => 'jjjjjj',
  filename => 'fun.txt'
};

$t->post_ok('/settings/oauth/register' => form => $json_post)
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', 'Plugins need to be confidential')
  ;

$json_post->{type} = 'CONFIDENTIAL';

# This somehow gets removed in the last form send ...
$json_post->{src} = {
  content => 'jjjjjj',
  filename => 'fun.txt'
};

$t->post_ok('/settings/oauth/register' => form => $json_post)
  ->status_is(200)
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', 'Plugin declarations need to be json files')
  ;

$json_post->{src} = {
  content => '{"name":"example"}',
  filename => 'fun.txt'
};

$t->post_ok('/settings/oauth/register' => form => $json_post)
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->element_exists('div.notify-success')
  ->text_is('div.notify-success', 'Registration successful')
  ;

$t->get_ok('/settings/oauth/jh0gfjhjbfdsgzjghj==')
  ->status_is(200)
  ->text_is('div.notify-error', undef)
  ->text_is('li.client #client_source', '{"name":"example"}')
  ->text_is('li.client span.client-name', 'Funny')
  ->text_is('li.client p.client-desc', 'This is my plugin application 2')
  ->element_exists_not('li.client .client-redirect-uri tt')
  ->text_is('li.client .client-type tt', 'CONFIDENTIAL')
  ;


# Retest client with super_client_file
my $client_file = tempfile;

$client_file->spurt(
  '{"client_id":"2","client_secret":"k414m4r-s3cr3t"}'
);

$t = Test::Mojo::WithRoles->new('Kalamar' => {
  Kalamar => {
    plugins => ['Auth']
  },
  'Kalamar-Auth' => {
    client_file => $client_file,
    oauth2 => 1
  }
});

$t->app->plugin(
  Mount => {
    $mount_point =>
      $fixtures_path->child('mock.pl')
  }
);

$csrf = $t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.button.top a')
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

$t->post_ok('/user/login' => form => {
  handle_or_email => 'test',
  pwd => 'pass',
  csrf_token => $csrf
})
  ->status_is(302)
  ->header_is('Location' => '/')
  ->content_is('');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->element_exists('div.notify-success')
  ->text_is('div.notify-success', 'Login successful')
  ->element_exists_not('aside.off')
  ->element_exists_not('aside.active')
  ->element_exists('aside.settings')
  ;

$main::ENV{KALAMAR_CLIENT_FILE} = $client_file;

$t = Test::Mojo::WithRoles->new('Kalamar' => {
  Kalamar => {
    plugins => ['Auth']
  },
  'Kalamar-Auth' => {
    oauth2 => 1,
#    client_file => $client_file,
  }
});

$t->app->plugin(
  Mount => {
    $mount_point =>
      $fixtures_path->child('mock.pl')
  }
);

$csrf = $t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.button.top a')
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

$t->post_ok('/user/login' => form => {
  handle_or_email => 'test',
  pwd => 'pass',
  csrf_token => $csrf
})
  ->status_is(302)
  ->header_is('Location' => '/')
  ->content_is('');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->element_exists('div.notify-success')
  ->text_is('div.notify-success', 'Login successful')
  ->element_exists_not('aside.off')
  ->element_exists_not('aside.active')
  ->element_exists('aside.settings')
  ;


done_testing;
__END__


