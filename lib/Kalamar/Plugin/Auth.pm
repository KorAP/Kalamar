package Kalamar::Plugin::Auth;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::ByteStream 'b';

# TODO:
#   Get rid of auth_support for templates!
# TODO:
#   Make all authentification parts in templates
#   content_block aware!

# Register the plugin
sub register {
  my ($plugin, $app, $param) = @_;


  # Load parameter from config file
  if (my $config_param = $app->config('Kalamar-Auth')) {
    $param = { %$param, %$config_param };
  };


  # Temp
  $app->defaults(auth_support => 1);


  # Load 'notifications' plugin
  unless (exists $app->renderer->helpers->{notify}) {
    $app->plugin(Notifications => {
      HTML => 1
    });
  };


  # unless ($param->{client_id} && $param->{client_secret}) {
  #   $mojo->log->error('client_id or client_secret not defined');
  #   return;
  # };

  # TODO:
  #   Define user CHI cache

  $app->plugin('Localize' => {
    dict => {
      Auth => {
        _ => sub { $_->locale },
        de => {
          loginSuccess => 'Anmeldung erfolgreich',
          loginFail => 'Anmeldung fehlgeschlagen',
          logoutSuccess => 'Abmeldung erfolgreich',
          logoutFail => 'Abmeldung fehlgeschlagen',
          csrfFail => 'Fehlerhafter CSRF Token',
          openRedirectFail => 'Weiterleitungsfehler'
        },
        -en => {
          loginSuccess => 'Login successful',
          loginFail => 'Access denied',
          logoutSuccess => 'Logout successful',
          logoutFail => 'Logout failed',
          csrfFail => 'Bad CSRF token',
          openRedirectFail => 'Redirect failure'
        }
      }
    }
  });


  # Inject authorization to all korap requests
  $app->hook(
    before_korap_request => sub {
      my ($c, $tx) = @_;
      my $auth_token = $c->auth->token or return;
      my $h = $tx->req->headers;
      $h->header('Authorization' => $auth_token);
    }
  );


  # Get the user token necessary for authorization
  $app->helper(
    'auth.token' => sub {
      my $c = shift;

      # Get token from stash
      my $token = $c->stash('auth');

      return $token if $token;

      # Get auth from session
      my $auth = $c->session('auth') or return;

      # Set token to stash
      $c->stash(auth => $auth);

      return $auth;
    }
  );


  # Log in to the system
  my $r = $app->routes;
  $r->post('/user/login')->to(
    cb => sub {
      my $c = shift;

      # Validate input
      my $v = $c->validation;
      $v->required('handle_or_email', 'trim');
      $v->required('pwd', 'trim');
      $v->csrf_protect;
      $v->optional('fwd')->closed_redirect;

      my $user = $v->param('handle_or_email');
      my $fwd = $v->param('fwd');

      # Set flash for redirect
      $c->flash(handle_or_email => $user);

      if ($v->has_error || index($user, ':') >= 0) {
        if ($v->has_error('fwd')) {
          $c->notify(error => $c->loc('Auth_openRedirectFail'));
        }
        elsif ($v->has_error('csrf_token')) {
          $c->notify(error => $c->loc('Auth_csrfFail'));
        }
        else {
          $c->notify(error => $c->loc('Auth_loginFail'));
        };

        return $c->relative_redirect_to($fwd // 'index');
      }

      my $pwd = $v->param('pwd');

      $c->app->log->debug("Login from user $user:$pwd");

      my $url = Mojo::URL->new($c->korap->api)->path('auth/apiToken');

      # Korap request for login
      $c->korap_request('get', $url, {

        # Set authorization header
        Authorization => 'Basic ' . b("$user:$pwd")->b64_encode->trim,

      })->then(
        sub {
          my $tx = shift;

          # Get the java token
          my $jwt = $tx->result->json;

          # No java web token
          unless ($jwt) {
            $c->notify(error => 'Response is no valid JWT (remote)');
            return;
          };

          # There is an error here
          # Dealing with errors here
          if (my $error = $jwt->{error}) {
            if (ref $error eq 'ARRAY') {
              $c->notify(error => $c->dumper($_));
            }
            else {
              $c->notify(error => 'There is an unknown JWT error');
            };
            return;
          };

          # TODO: Deal with user return values.
          my $auth = $jwt->{token_type} . ' ' . $jwt->{token};

          $c->app->log->debug(qq!Login successful: "$user" with "$auth"!);

          $user = $jwt->{username} ? $jwt->{username} : $user;

          # Set session info
          $c->session(user => $user);
          $c->session(auth => $auth);

          # Set stash info
          $c->stash(user => $user);
          $c->stash(auth => $auth);

          # Set cache
          $c->chi('user')->set($auth => $user);
          $c->notify(success => $c->loc('Auth_loginSuccess'));
        }
      )->catch(
        sub {
          my $e = shift;

          # Notify the user
          $c->notify(
            error =>
              ($e->{code} ? $e->{code} . ': ' : '') .
              $e->{message} . ' for Login (remote)'
            );

          # Log failure
          $c->app->log->debug(
            ($e->{code} ? $e->{code} . ' - ' : '') .
              $e->{message}
            );

          $c->app->log->debug(qq!Login fail: "$user"!);
          $c->notify(error => $c->loc('Auth_loginFail'));
        }
      )->finally(
        sub {

          # Redirect to slash
          return $c->relative_redirect_to($fwd // 'index');
        }
      )

      # Start IOLoop
      ->wait;

      return 1;
    }
  )->name('login');


  # Log out of the session
  $r->get('/user/logout')->to(
    cb => sub {
      my $c = shift;

      # TODO: csrf-protection!

      # Log out of the system
      my $url = Mojo::URL->new($c->korap->api)->path('auth/logout');

      $c->korap_request(
        'get', $url
      )->then(
        # Logged out
        sub {
          my $tx = shift;
          # Clear cache
          $c->chi('user')->remove($c->auth->token);

          # Expire session
          $c->session(user => undef);
          $c->session(auth => undef);
          $c->notify(success => $c->loc('Auth_logoutSuccess'));
        }

      )->catch(
        # Something went wrong
        sub {
          # my $err_msg = shift;
          $c->notify('error', $c->loc('Auth_logoutFail'));
        }

      )->finally(
        # Redirect
        sub {
          return $c->redirect_to('index');
        }
      )

      # Start IOLoop
      ->wait;

      return 1;
    }
  )->name('logout');
};

1;
