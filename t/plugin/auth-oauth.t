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
  ->element_exists('form[action=/user/login] input[name=handle]')
  ->element_exists('aside.active')
  ->element_exists_not('aside.off')
  ;

# Test for bug with long password
$t->post_ok('/user/login' => form => {
  handle => 'test',
  pwd => 'kjskjhndkjndqknaskjnakjdnkjdankajdnkjdsankjdsakjdfkjahzroiuqzriudjoijdmlamdlkmdsalkmdl' })
  ->status_is(302)
  ->header_is('Location' => '/');

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
  ->element_exists_not('div.notify-success')
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
  ->text_is('div.notify-error', '2022: LDAP Authentication failed due to unknown user or password!')
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
  ->element_exists("input[name=handle]")
  ->element_exists("input[name=handle][value=test]")
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

$t->post_ok('/user/login' => form => {
  handle => 'test',
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
$t->get_ok('/?q=baum&cutoff=true')
  ->status_is(200)
  ->session_is('/auth', 'Bearer ' . $access_token_2)
  ->session_is('/auth_r', $refresh_token_2)
  ->text_is('#error','')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->content_like(qr/${q}authorized${q}:${q}yes${q}/)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->content_like(qr!${q}cutOff${q}:true!)
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
  ->status_is(400)
  ->session_hasnt('/auth')
  ->session_hasnt('/auth_r')
  ->text_is('#error','')
  ->text_is('div.notify-error','Access token invalid')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->content_unlike(qr/${q}authorized${q}:${q}yes${q}/)
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
  ->content_like(qr/${q}authorized${q}:${q}yes${q}/)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->element_exists_not('p.no-results')
  ;


$t->get_ok('/x/expired-with-wrong-refresh')
  ->status_is(200)
  ->content_is('okay')
  ;


# The token is invalid and can't be refreshed!
$csrf = $t->get_ok('/?q=baum&cutoff=true')
  ->status_is(400)
  ->session_hasnt('/auth')
  ->session_hasnt('/auth_r')
  ->text_is('#error','')
  ->text_is('div.notify-error','Refresh token is expired')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->content_unlike(qr/${q}authorized${q}:${q}yes${q}/)
  ->element_exists('p.no-results')
  ->tx->res->dom->at('input[name="csrf_token"]')
  ->attr('value')
  ;

# Login:
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
  ;

$t->get_ok('/settings/oauth')
  ->text_is('form.form-table legend', 'Register new client application')
  ->attr_is('form.oauth-register','action', '/settings/oauth/register')
  ->element_exists('ul.client-list')
  ->element_exists_not('ul.client-list > li')
#  ->text_is('ul.client-list > li > span.client-name', 'R statistical computing tool ')
#  ->text_is('ul.client-list > li > span.client-desc', 'R is a free software environment for statistical computing and graphics.')
#  ->text_is('ul.client-list > li > span.client-url a', 'https://www.r-project.org/')
#  ->text_is('ul.client-list > li a.client-unregister', 'Unregister')
#  ->attr_is('ul.client-list > li a.client-unregister', 'href', '/settings/oauth/unregister/9aHsGW6QflV13ixNpez?name=R+statistical+computing+tool')
  ;
$csrf = $t->post_ok('/settings/oauth/register' => form => {
  name => 'MyApp',
  type => 'PUBLIC',
  desc => 'This is my application'
})
  ->text_is('div.notify-error', 'Bad CSRF token')
  ->tx->res->dom->at('input[name="csrf_token"]')
  ->attr('value')
  ;

$t->post_ok('/settings/oauth/register' => form => {
  name => 'MyApp',
  type => 'CONFIDENTIAL',
  desc => 'This is my application',
  csrf_token => $csrf
})
  ->status_is(200)
  ->element_exists('div.notify-success')
  ->text_is('legend', 'Client Credentials')
  ->text_is('label[for=client_id]', 'ID of the client application')
  ->element_exists('input[name=client_id][readonly][value]')
  ->element_exists('input[name=client_secret][readonly][value]')
  ;

$t->get_ok('/settings/oauth')
  ->text_is('.form-table legend', 'Register new client application')
  ->attr_is('.oauth-register','action', '/settings/oauth/register')
  ->text_is('ul.client-list > li > span.client-name a', 'MyApp')
  ->text_is('ul.client-list > li > span.client-desc', 'This is my application')
  ->text_is('ul.client-list > li > span.client-url a', '')
  ;

$t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ->status_is(200)
  ->text_is('ul.client-list > li.client > span.client-name', 'MyApp')
  ->text_is('ul.client-list > li.client > span.client-desc', 'This is my application')
  ->text_is('a.client-unregister', 'Unregister')
  ->attr_is('a.client-unregister', 'href', '/settings/oauth/fCBbQkA2NDA3MzM1Yw==/unregister?name=MyApp')
  ;

$csrf = $t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==/unregister?name=MyApp')
  ->content_like(qr!Do you really want to unregister \<span class="client-name"\>MyApp\<\/span\>?!)
  ->attr_is('.form-table input[name=client-name]', 'value', 'MyApp')
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
  ;

$t->post_ok('/settings/oauth/register' => form => {
  name => 'MyApp2',
  type => 'PUBLIC',
  desc => 'This is my application',
  csrf_token => $csrf
})->status_is(200)
  ->element_exists('div.notify-success')
  ->text_is('legend', 'Client Credentials')
  ->text_is('label[for=client_id]', 'ID of the client application')
  ->element_exists('input[name=client_id][readonly][value]')
  ->element_exists_not('input[name=client_secret][readonly][value]')
  ;

$t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==')
  ->text_is('.client-name', 'MyApp2')
  ->text_is('.client-desc', 'This is my application')
  ->text_is('.client-issue-token', 'IssueToken')
  ->attr_is('.client-issue-token', 'href', '/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token?name=MyApp2')
  ;

$csrf = $t->get_ok('/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token?name=MyApp2')
  ->status_is(200)
  ->attr_is('#issue-token','action', '/settings/oauth/fCBbQkA2NDA3MzM1Yw==/token')
  ->attr_is('input[name=client-id]', 'value', 'fCBbQkA2NDA3MzM1Yw==')
  ->attr_is('input[name=name]', 'value', 'MyApp2')
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

done_testing;
__END__
