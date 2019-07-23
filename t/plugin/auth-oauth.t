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

$t->app->routes->get('/x/expire')->to(
  cb => sub {
    my $c = shift;
    $c->session(auth_exp => 0);
    return $c->render(text => 'okay')
  }
);

$t->app->routes->get('/x/expire-no-refresh')->to(
  cb => sub {
    my $c = shift;
    $c->session(auth_exp => 0);
    $c->session(auth_r => undef);
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

my $access_token = $fake_backend_app->get_token('access_token');
my $refresh_token = $fake_backend_app->get_token('refresh_token');

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

my $access_token_2 = $fake_backend_app->get_token('access_token_2');
my $refresh_token_2 = $fake_backend_app->get_token('refresh_token_2');

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



done_testing;
__END__

# Expire access token
# $fake_backend_app->expired($access_token => 1);



$t->app->routes->get(
  '/user/refresh' => sub {
    my $c = shift;

    my $old_auth = $c->auth->token;
    my $refresh = $c->chi('user')->get("refr_$old_auth");

    $c->auth->refresh_token($refresh)->then(
      sub {
        my $new_auth = $c->auth->token;
        $c->notify(success => $new_auth . ' vs. ' . $old_auth);
      }
    )->catch(
      sub {

        # Notify the user on login failure
        unless (@_) {
          $c->notify(error => $c->loc('Auth_refreshFail'));
        }

        # There are known errors
        foreach (@_) {
          if (ref $_ eq 'HASH') {
            my $err = ($_->{code} ? $_->{code} . ': ' : '') .
              $_->{message};
            $c->notify(error => $err);
          }
          else {
            $c->notify(error => $_);
          }
        };
      }
    )->finally(
      sub {
        return $c->redirect_to('index');
      }
    )->wait;
  }
);

$t->get_ok('/user/refresh')
  ->status_is(302)
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->element_exists('div.notify-success')
  ->text_like('div.notify-success', qr!Bearer abcde vs\. Bearer .{6,}!)
  ;


done_testing;
__END__

# Test before_korap_request_hook
my $app = $t->app;
my $c = $app->build_controller;
my $tx = $app->build_tx('GET', 'https://korap.ids-mannheim.de/');

# Emit Hook to alter request
$app->plugins->emit_hook(
  before_korap_request => ($c, $tx)
);

ok(!$tx->req->headers->authorization, 'No authorization');

# Set token
$c->auth->token('abcd', 100);

# Emit Hook to alter request
$app->plugins->emit_hook(
  before_korap_request => ($c, $tx)
);

is($tx->req->headers->authorization, 'abcd', 'authorization');

# Override authorization in header
$tx->req->headers->authorization('xyz');

# Emit Hook to alter request
$app->plugins->emit_hook(
  before_korap_request => ($c, $tx)
);

is($tx->req->headers->authorization, 'xyz', 'authorization');

done_testing;
__END__

