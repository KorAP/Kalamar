package Kalamar::Plugin::Auth;
use Mojo::Base 'Mojolicious::Plugin';
use File::Basename 'dirname';
use File::Spec::Functions qw/catdir/;
use Mojo::ByteStream 'b';

# This is a plugin to deal with the Kustvakt OAuth server.
# It establishes both the JWT as well as the OAuth password
# flow for login.
# All tokens are stored in the session. Access tokens are short-lived,
# which limits the effects of misuse.
# Refresh tokens are bound to client id and client secret,
# which again limits the effects of misuse.

# TODO:
#   Establish a plugin 'OAuth' that works independent of 'Auth'.

# TODO:
#   CSRF-protect logout!

# TODO:
#   Remove the Bearer prefix from auth.

# In case no expiration time is returned by the server,
# take this time.
our $EXPECTED_EXPIRATION_IN = 259200;

# Register the plugin
sub register {
  my ($plugin, $app, $param) = @_;

  # Allow data section as template resources
  push @{$app->renderer->classes}, __PACKAGE__;

  # Load parameter from config file
  if (my $config_param = $app->config('Kalamar-Auth')) {
    $param = { %$param, %$config_param };
  };

  # Load 'notifications' plugin
  unless (exists $app->renderer->helpers->{notify}) {
    $app->plugin(Notifications => {
      HTML => 1
    });
  };

  # Get the client id and the client_secret as a requirement
  unless ($param->{client_id} && $param->{client_secret}) {
    $app->log->error('client_id or client_secret not defined');
  };

  # Load localize
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
          openRedirectFail => 'Weiterleitungsfehler',
          tokenExpired => 'Zugriffstoken abgelaufen',
          tokenInvalid => 'Zugriffstoken ungültig',
          refreshFail => 'Fehlerhafter Refresh-Token',
          responseError => 'Unbekannter Autorisierungsfehler',
          paramError => 'Einige Eingaben sind fehlerhaft',
          redirectUri => 'Weiterleitungs-Adresse',
          homepage => 'Webseite',
          desc => 'Kurzbeschreibung',
          clientCredentials => 'Client Daten',
          clientType => 'Art der Client-Applikation',
          clientName => 'Name der Client-Applikation',
          clientID => 'ID der Client-Applikation',
          clientSecret => 'Client-Secret',
          clientRegister => 'Neue Client-Applikation registrieren',
          registerSuccess => 'Registrierung erfolgreich',
          registerFail => 'Registrierung fehlgeschlagen',
          oauthSettings => 'OAuth',
        },
        -en => {
          loginSuccess => 'Login successful',
          loginFail => 'Access denied',
          logoutSuccess => 'Logout successful',
          logoutFail => 'Logout failed',
          csrfFail => 'Bad CSRF token',
          openRedirectFail => 'Redirect failure',
          tokenExpired => 'Access token expired',
          tokenInvalid => 'Access token invalid',
          refreshFail => 'Bad refresh token',
          responseError => 'Unknown authorization error',
          paramError => 'Some fields are invalid',
          redirectUri => 'Redirect URI',
          homepage => 'Homepage',
          desc => 'Short description',
          clientCredentials => 'Client Credentials',
          clientType => 'Type of the client application',
          clientName => 'Name of the client application',
          clientID => 'ID of the client application',
          clientSecret => 'Client secret',
          clientRegister => 'Register new client application',
          registerSuccess => 'Registration successful',
          registerFail => 'Registration denied',
          oauthSettings => 'OAuth',
        }
      }
    }
  });


  # Add login frame to sidebar
  $app->content_block(
    sidebar => {
      template => 'partial/auth/login'
    }
  );


  # Add logout button to header button list
  $app->content_block(
    headerButtonGroup => {
      template => 'partial/auth/logout'
    }
  );

  # The plugin path
  my $path = catdir(dirname(__FILE__), 'Auth');

  # Append "templates"
  push @{$app->renderer->paths}, catdir($path, 'templates');

  # Get or set the user token necessary for authorization
  $app->helper(
    'auth.token' => sub {
      my ($c, $token, $expires_in) = @_;

      if ($token) {
        # Set auth token
        $c->stash(auth => $token);
        $c->session(auth => $token);
        $c->session(auth_exp => time + $expires_in);
        return 1;
      };

      # Get token from stash
      $token = $c->stash('auth');

      return $token if $token;

      # Get auth from session
      $token = $c->session('auth') or return;
      $c->stash(auth => $token);

      # Return stashed value
      return $token;
    }
  );


  # Log in to the system
  my $r = $app->routes;

  if ($param->{oauth2}) {

    # Add settings
    $app->navi->add(settings => (
      $app->loc('Auth_oauthSettings'), 'oauth'
    ));

    my $client_id = $param->{client_id};
    my $client_secret = $param->{client_secret};


    # Sets a requested token and returns
    # an error, if it didn't work
    $app->helper(
      'auth.set_tokens_p' => sub {
        my ($c, $json) = @_;
        my $promise = Mojo::Promise->new;

        # No json object
        unless ($json) {
          return $promise->reject({
            message => 'Response is no valid JSON object (remote)'
          });
        };

        # There is an error here
        # Dealing with errors here
        if ($json->{error} && ref $json->{error} ne 'ARRAY') {
          return $promise->reject(
            {
              message => $json->{error} . ($json->{error_description} ? ': ' . $json->{error_description} : '')
            }
          );
        }

        # There is an array of errors
        elsif (my $error = $json->{errors} // $json->{error}) {
          if (ref $error eq 'ARRAY') {
            my @errors = ();
            foreach (@{$error}) {
              if ($_->[1]) {
                push @errors, { code => $_->[0], message => $_->[1]}
              }
            }
            return $promise->reject(@errors);
          }

          return $promise->reject({message => $error});
        };

        # Everything is fine
        my $access_token  = $json->{access_token};
        my $token_type    =  $json->{token_type};
        my $refresh_token = $json->{refresh_token};
        my $expires_in    = $json->{"expires_in"} // $EXPECTED_EXPIRATION_IN;
        my $auth          = $token_type . ' ' . $access_token;
        # my $scope       = $json->{scope};

        # Set session info
        $c->session(auth => $auth);

        # Expiration of the token minus tolerance
        $c->session(auth_exp => time + $expires_in - 60);

        # Set session info for refresh token
        # This can be stored in the session, as it is useless
        # unless the client secret is stolen
        $c->session(auth_r => $refresh_token) if $refresh_token;

        # Set stash info
        $c->stash(auth => $auth);

        return $promise->resolve;
      }
    );


    # Refresh tokens and return a promise
    $app->helper(
      'auth.refresh_p' => sub {
        my $c = shift;
        my $refresh_token = shift;

        # Get OAuth access token
        state $r_url = Mojo::URL->new($c->korap->api)->path('oauth2/token');

        $c->app->log->debug("Refresh at $r_url");

        return $c->kalamar_ua->post_p($r_url, {} => form => {
          grant_type => 'refresh_token',
          client_id => $client_id,
          client_secret => $client_secret,
          refresh_token => $refresh_token
        })->then(
          sub {
            my $tx = shift;
            my $json = $tx->result->json;

            # Response is fine
            if ($tx->res->is_success) {

              $c->app->log->info("Refresh was successful");

              # Set the tokens and return a promise
              return $c->auth->set_tokens_p($json);
            };

            # There is a client error - refresh fails
            if ($tx->res->is_client_error && $json) {

              $c->stash(auth => undef);
              $c->stash(auth_exp => undef);
              delete $c->session->{user};
              delete $c->session->{auth};
              delete $c->session->{auth_r};
              delete $c->session->{auth_exp};

              # Response is 400
              return Mojo::Promise->reject(
                $json->{error_description} // $c->loc('Auth_refreshFail')
              );
            };

            $c->notify(error => $c->loc('Auth_responseError'));
            return Mojo::Promise->reject;
          }
        )
      }
    );


    # Issue a korap request with "oauth"orization
    # This will override the core request helper
    $app->helper(
      korap_request => sub {
        my $c      = shift;
        my $method = shift;
        my $path   = shift;
        my @param = @_;

        # TODO:
        #   Check if $tx is not leaked!

        # Get plugin user agent
        my $ua = $c->kalamar_ua;

        my $url = Mojo::URL->new($path);
        my $tx = $ua->build_tx(uc($method), $url->clone, @param);

        # Set X-Forwarded for
        $tx->req->headers->header(
          'X-Forwarded-For' => $c->client_ip
        );

        # Emit Hook to alter request
        $c->app->plugins->emit_hook(
          before_korap_request => ($c, $tx)
        );

        my $h = $tx->req->headers;

        # If the request already has an Authorization
        # header, respect it!
        if ($h->authorization) {
          return $ua->start_p($tx);
        };

        # Get auth token
        if (my $auth_token = $c->auth->token) {

          # The token is already expired!
          my $exp = $c->session('auth_exp');
          if (defined $exp && $exp < time) {

            # Remove auth ...
            $c->stash(auth => undef);

            # And get refresh token from session
            if (my $refresh_token = $c->session('auth_r')) {

              $c->app->log->debug("Refresh is required");

              # Refresh
              return $c->auth->refresh_p($refresh_token)->then(
                sub {
                  $c->app->log->debug("Search with refreshed tokens");

                  # Tokens were set - now send the request the first time!
                  $tx->req->headers->authorization($c->stash('auth'));
                  return $ua->start_p($tx);
                }
              );
            }

            # The token is expired and no refresh token is
            # available - issue an unauthorized request!
            else {
              $c->stash(auth => undef);
              $c->stash(auth_exp => undef);
              delete $c->session->{user};
              delete $c->session->{auth};
              delete $c->session->{auth_r};
              delete $c->session->{auth_exp};

              # Warn on Error!
              $c->notify(warn => $c->loc('Auth_tokenExpired'));
              return $ua->start_p($tx);
            };
          }

          # Auth token is fine
          else {

            # Set auth
            $h->authorization($auth_token);
          }
        }

        # No token set
        else {

          # Return unauthorized request
          return $ua->start_p($tx);
        };

        # Issue an authorized request and automatically
        # refresh the token on expiration!
        return $ua->start_p($tx)->then(
          sub {
            my $tx = shift;

            # Response is fine
            if ($tx->res->is_success) {
              return Mojo::Promise->resolve($tx);
            }

            # There is a client error - maybe refresh!
            elsif ($tx->res->is_client_error) {

              # Check the error
              my $json = $tx->res->json('/errors/0/1');
              if ($json && ($json =~ /expired|invalid/)) {
                $c->stash(auth => undef);
                $c->stash(auth_exp => undef);
                delete $c->session->{user};
                delete $c->session->{auth};

                # And get refresh token from session
                if (my $refresh_token = $c->session('auth_r')) {

                  # Refresh
                  return $c->auth->refresh_p($refresh_token)->then(
                    sub {
                      $c->app->log->debug("Search with refreshed tokens");

                      my $tx = $ua->build_tx(uc($method), $url->clone, @param);

                      # Set X-Forwarded for
                      $tx->req->headers->header(
                        'X-Forwarded-For' => $c->client_ip
                      );

                      # Tokens were set - now send the request the first time!
                      $tx->req->headers->authorization($c->stash('auth'));
                      return $ua->start_p($tx);
                    }
                  )
                };

                # Reject the invalid token
                $c->notify(error => $c->loc('Auth_tokenInvalid'));
                return Mojo::Promise->reject;
              };

              return Mojo::Promise->resolve($tx);
            };

            $c->notify(error => $c->loc('Auth_responseError'));
            return Mojo::Promise->reject;
          }
        );
      }
    );

    # Password flow for OAuth
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

        $c->app->log->debug("Login from user $user");

        # <specific>

        # Get OAuth access token
        my $url = Mojo::URL->new($c->korap->api)->path('oauth2/token');

        # Korap request for login
        $c->korap_request('post', $url, {}, form => {
          grant_type => 'password',
          username => $user,
          password => $pwd,
          client_id => $client_id,
          client_secret => $client_secret
        })->then(
          sub {
            # Set the tokens and return a promise
            return $c->auth->set_tokens_p(shift->result->json)
          }
        )->catch(
          sub {

            # Notify the user on login failure
            unless (@_) {
              $c->notify(error => $c->loc('Auth_loginFail'));
            }

            # There are known errors
            foreach (@_) {
              if (ref $_ eq 'HASH') {
                my $err = ($_->{code} ? $_->{code} . ': ' : '') .
                  $_->{message};
                $c->notify(error => $err);
                # Log failure
                $c->app->log->debug($err);
              }
              else {
                $c->notify(error => $_);
                $c->app->log->debug($_);
              };
            };

            $c->app->log->debug(qq!Login fail: "$user"!);
          }
        )->then(
          sub {
            # Set user info
            $c->session(user => $user);
            $c->stash(user => $user);

            # Notify on success
            $c->app->log->debug(qq!Login successful: "$user"!);
            $c->notify(success => $c->loc('Auth_loginSuccess'));
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

        my $refresh_token = $c->session('auth_r');

        # Revoke the token
        state $url = Mojo::URL->new($c->korap->api)->path('oauth2/revoke');

        $c->kalamar_ua->post_p($url => {} => form => {
          client_id => $client_id,
          client_secret => $client_secret,
          token => $refresh_token,
          token_type => 'refresh_token'
        })->then(
          sub {
            my $tx = shift;
            my $json = $tx->result->json;

            my $promise;

            # Response is fine
            if ($tx->res->is_success) {
              $c->app->log->info("Revocation was successful");
              $c->notify(success => $c->loc('Auth_logoutSuccess'));

              $c->stash(auth => undef);
              $c->stash(auth_exp => undef);
              $c->flash(handle_or_email => delete $c->session->{user});
              delete $c->session->{auth};
              delete $c->session->{auth_r};
              delete $c->session->{auth_exp};
              return Mojo::Promise->resolve;
            }

            # Token may be invalid
            $c->notify('error', $c->loc('Auth_logoutFail'));

            # There is a client error - refresh fails
            if ($tx->res->is_client_error && $json) {

              return Mojo::Promise->reject(
                $json->{error_description}
              );
            };

            # Resource may not be found (404)
            return Mojo::Promise->reject

          }
        )->catch(
          sub {
            my $err = shift;

            # Server may be irresponsible
            $c->notify('error', $c->loc('Auth_logoutFail'));
            return Mojo::Promise->reject($err);
          }
        )->finally(
          sub {
            return $c->redirect_to('index');
          }
        )->wait;
      }
    )->name('logout');


    # Route to oauth settings
    $r->get('/settings/oauth')->to(
      cb => sub {
        return shift->render(template => 'auth/tokens')
      }
    );

    # Route to oauth client registration
    $r->post('/settings/oauth/register')->to(
      cb => sub {
        my $c = shift;
        my $v = $c->validation;

        unless ($c->auth->token) {

          # TODO: not allowed
          return $c->reply->not_found;
        };

        $v->csrf_protect;
        $v->required('name', 'trim')->size(3, 255);
        $v->required('type')->in('PUBLIC', 'CONFIDENTIAL');
        $v->required('desc', 'trim')->size(3, 255);
        $v->optional('url', 'trim')->like(qr/^(http|$)/i);
        $v->optional('redirectUri', 'trim')->like(qr/^(http|$)/i);

        # Render with error
        if ($v->has_error) {
          if ($v->has_error('csrf_token')) {
            $c->notify(error => $c->loc('Auth_csrfFail'));
          }
          else {
            $c->notify(warn => $c->loc('Auth_paramError'));
          };
          return $c->render(template => 'auth/tokens')
        };

        # Wait for async result
        $c->render_later;

        # Register on server
        state $url = Mojo::URL->new($c->korap->api)->path('oauth2/client/register');
        $c->korap_request('POST', $url => {} => json => {
          name        => $v->param('name'),
          type        => $v->param('type'),
          description => $v->param('desc'),
          url         => $v->param('url'),
          redirectURI => $v->param('redirectURI')
        })->then(
          sub {
            my $tx = shift;
            my $result = $tx->result;

            if ($result->is_error) {
              return Mojo::Promise->reject;
            };


            my $json = $result->json;

            # TODO:
            #   Respond in template
            my $client_id = $json->{client_id};
            my $client_secret = $json->{client_secret};

            $c->stash('client_name' => $v->param('name'));
            $c->stash('client_desc' => $v->param('desc'));
            $c->stash('client_type' => $v->param('type'));
            $c->stash('client_url'  => $v->param('url'));
            $c->stash('client_redirect_uri' => $v->param('redirectURI'));
            $c->stash('client_id' => $client_id);

            if ($client_secret) {
              $c->stash('client_secret' => $client_secret);
            };

            # TODO: Localize
            $c->notify(success => $c->loc('Auth_en_registerSuccess'));

            return $c->render(template => 'auth/register-success');
          }
        )->catch(
          sub {
            # Server may be irresponsible
            my $err = shift;
            # TODO: Localize
            $c->notify('error' => $c->loc('Auth_en_registerFail'));
            return Mojo::Promise->reject($err);
          }
        )->finally(
          sub {
            return $c->redirect_to('settings' => { scope => 'oauth' });
          }
        );
      }
    )->name('oauth-register')
  }

  # Use JWT login
  # (should be deprecated)
  else {

    # Inject authorization to all korap requests
    $app->hook(
      before_korap_request => sub {
        my ($c, $tx) = @_;
        my $h = $tx->req->headers;

        # If the request already has an Authorization
        # header, respect it
        unless ($h->authorization) {

          # Get valid auth token and set as header
          if (my $auth_token = $c->auth->token) {
            $h->authorization($auth_token);
          };
        };
      }
    );

    # Password flow with JWT
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

        $c->app->log->debug("Login from user $user");

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
            if (my $error = $jwt->{error} // $jwt->{errors}) {
              if (ref $error eq 'ARRAY') {
                foreach (@$error) {
                  unless ($_->[1]) {
                    $c->notify(error => $c->loc('Auth_loginFail'));
                  }
                  else {
                    $c->notify(error => $_->[0] . ($_->[1] ? ': ' . $_->[1] : ''));
                  };
                };
              }
              else {
                $c->notify(error => 'There is an unknown JWT error');
              };
              return;
            };

            # TODO: Deal with user return values.
            my $auth = $jwt->{token_type} . ' ' . $jwt->{token};

            $c->app->log->debug(qq!Login successful: "$user"!);

            $user = $jwt->{username} ? $jwt->{username} : $user;

            # Set session info
            $c->session(user => $user);
            $c->session(auth => $auth);

            # Set stash info
            $c->stash(user => $user);
            $c->stash(auth => $auth);

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
            # ?? Necesseary
            # $c->chi('user')->remove($c->auth->token);

            # TODO:
            #   Revoke refresh token!
            #   based on auth token!
            # my $refresh_token = $c->chi('user')->get('refr_' . $c->auth->token);
            # $c->auth->revoke_token($refresh_token)

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

  $app->log->info('Successfully registered Auth plugin');
};

1;

__DATA__
@@ partial/auth/login.html.ep
%# # user not logged in
% if (!stash('documentation') && !$embedded && !$c->auth->token) {
%   if (flash('handle_or_email') && !param('handle_or_email')) {
%     param(handle_or_email => flash('handle_or_email'));
%   };
    <fieldset>
    %= form_for 'login', class => 'login', begin
      <legend><span><%= loc 'login' %></span></legend>
      %= csrf_field
      %= text_field 'handle_or_email', placeholder => loc('userormail')
      %= hidden_field fwd => $c->url_with
      <div>
        %= password_field 'pwd', placeholder => loc('pwd')
        <button type="submit"><span><%= loc 'go' %></span></button>
      </div>
    % end

    %= content_block 'loginInfo', separator => '<hr />'

    </fieldset>
% }

@@ partial/auth/logout.html.ep
% if ($c->auth->token) {
   %# TODO: CSRF protection
   <a href="<%= url_for 'logout' %>"
      class="logout"
      title="<%= loc 'logout' %>: <%= user_handle %>"><span><%= loc 'logout' %></span></a>
% };


__END__
