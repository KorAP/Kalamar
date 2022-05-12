package Kalamar::Plugin::Auth;
use Mojo::Base 'Mojolicious::Plugin';
use File::Basename 'dirname';
use File::Spec::Functions qw/catdir/;
use Mojo::ByteStream 'b';
use Mojo::Util qw!deprecated b64_encode encode!;
use Mojo::JSON 'encode_json';
use Encode 'is_utf8';

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
      de => {
        abort => 'Abbrechen'
      },
      -en => {
        abort => 'Abort'
      },
      Auth => {
        _ => sub { $_->locale },
        de => {
          loginPlease => 'Bitte melden Sie sich an!',
          loginSuccess => 'Anmeldung erfolgreich',
          loginFail => 'Anmeldung fehlgeschlagen',
          logoutSuccess => 'Abmeldung erfolgreich',
          logoutFail => 'Abmeldung fehlgeschlagen',
          authenticationFail => 'Nicht authentifiziert',
          csrfFail => 'Fehlerhafter CSRF Token',
          invalidChar => 'Ungültiges Zeichen in Anfrage',
          openRedirectFail => 'Weiterleitungsfehler',
          tokenExpired => 'Zugriffstoken abgelaufen',
          tokenInvalid => 'Zugriffstoken ungültig',
          refreshFail => 'Fehlerhafter Refresh-Token',
          responseError => 'Unbekannter Autorisierungsfehler',
          serverError => 'Unbekannter Serverfehler',
          revokeFail => 'Der Token kann nicht widerrufen werden',
          revokeSuccess => 'Der Token wurde erfolgreich widerrufen',
          paramError => 'Einige Eingaben sind fehlerhaft',
          redirectUri => 'Weiterleitungs-Adresse',
          homepage => 'Webseite',
          desc => 'Kurzbeschreibung',
          revoke => 'Widerrufen',
          clientCredentials => 'Client Daten',
          clientType => 'Art der Client-Applikation',
          clientName => 'Name der Client-Applikation',
          clientID => 'ID der Client-Applikation',
          clientSecret => 'Client-Secret',
          clientRegister => 'Neue Client-Applikation registrieren',
          registerSuccess => 'Registrierung erfolgreich',
          registerFail => 'Registrierung fehlgeschlagen',
          oauthSettings => 'OAuth',
          oauthUnregister => {
            -long => 'Möchten sie <span class="client-name"><%= $client_name %></span> wirklich löschen?',
            short => 'Löschen'
          },
          loginHint => 'Möglicherweise müssen sie sich zunächst einloggen.',
          oauthIssueToken => {
            -long => 'Stelle einen neuen Token für <span class="client-name"><%= $client_name %></span> aus',
            short => 'Neuen Token ausstellen'
          },
          accessToken => 'Access Token',
          oauthRevokeToken => {
            -long => 'Widerrufe einen Token für <span class="client-name"><%= $client_name %></span>',
            short => 'Widerrufe'
          },
          oauthGrantScope => {
            -long => '<span class="client-name"><%= $client_name %></span> möchte Zugriffsrechte',
            short => 'Zugriffsrechte erteilen'
          },
          createdAt => 'Erstellt am <time datetime="<%= stash("date") %>"><%= stash("date") %></date>.',
          expiresIn => 'Läuft in <%= stash("seconds") %> Sekunden ab.'
        },
        -en => {
          loginPlease => 'Please log in!',
          loginSuccess => 'Login successful',
          loginFail => 'Access denied',
          logoutSuccess => 'Logout successful',
          logoutFail => 'Logout failed',
          authenticationFail => 'Not authenticated',
          csrfFail => 'Bad CSRF token',
          invalidChar => 'Invalid character in request',
          openRedirectFail => 'Redirect failure',
          tokenExpired => 'Access token expired',
          tokenInvalid => 'Access token invalid',
          refreshFail => 'Bad refresh token',
          responseError => 'Unknown authorization error',
          serverError => 'Unknown server error',
          revokeFail => 'Token can\'t be revoked',
          revokeSuccess => 'Token was revoked successfully',
          paramError => 'Some fields are invalid',
          redirectUri => 'Redirect URI',
          homepage => 'Homepage',
          desc => 'Short description',
          revoke => 'Revoke',
          clientCredentials => 'Client Credentials',
          clientType => 'Type of the client application',
          clientName => 'Name of the client application',
          clientID => 'ID of the client application',
          clientSecret => 'Client secret',
          clientRegister => 'Register new client application',
          registerSuccess => 'Registration successful',
          registerFail => 'Registration denied',
          oauthSettings => 'OAuth',
          oauthUnregister => {
            -long => 'Do you really want to unregister <span class="client-name"><%= $client_name %></span>?',
            short => 'Unregister'
          },
          loginHint => 'Maybe you need to log in first?',
          oauthIssueToken => {
            -long => 'Issue a new token for <span class="client-name"><%= $client_name %></span>',
            short => 'Issue new token'
          },
          accessToken => 'Access Token',
          oauthRevokeToken => {
            -long => 'Revoke a token for <span class="client-name"><%= $client_name %></span>',
            short => 'Revoke'
          },
          oauthGrantScope => {
            -long => '<span class="client-name"><%= $client_name %></span> wants to have access',
            short => 'Grant access'
          },
          createdAt => 'Created at <time datetime="<%= stash("date") %>"><%= stash("date") %></date>.',
          expiresIn => 'Expires in <%= stash("seconds") %> seconds.'
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


  # Add hook after search
  $app->hook(
    after_search => sub {
      my $c = shift;

      # User is not logged in
      if ($c->stash('results')->size == 0 && !$c->auth->token) {
        $c->content_for(
          'after_search_results' =>
            $c->render_to_string(
              inline => '<p class="hint"><%= loc "Auth_loginHint" %></p>'
            )
          );
      };
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
        my $token_type    = $json->{token_type};
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

            if ($tx->res->is_server_error) {
              return Mojo::Promise->reject(
                '600'
              )
            };

            $c->notify(error => $c->loc('Auth_responseError'));
            return Mojo::Promise->reject;
          }
        )
      }
    );

    # Get a list of registered clients
    $app->helper(
      'auth.client_list_p' => sub {
        my $c = shift;

        # Get list of registered clients
        state $r_url = Mojo::URL->new($c->korap->api)->path('oauth2/client/list');

        # Get the list of all clients
        return $c->korap_request(post => $r_url, {} => form => {
          super_client_id => $client_id,
          super_client_secret => $client_secret,
          authorized_only => 'no'
        })->then(
          sub {
            my $tx = shift;
            my $json = $tx->result->json;

            # Response is fine
            if ($tx->res->is_success) {
              return Mojo::Promise->resolve($json);
            };

            $c->log->error($c->dumper($tx->res->to_string));

            # Failure
            $c->notify(error => $c->loc('Auth_responseError'));
            return Mojo::Promise->reject($json // 'No response');
          }
        );
      }
    );


    # Get a list of registered clients
    $app->helper(
      'auth.token_list_p' => sub {
        my $c = shift;
        my $user_client_id = shift;

        # Revoke the token
        state $r_url = Mojo::URL->new($c->korap->api)->path('oauth2/token/list');

        my $form = {
          super_client_id => $client_id,
          super_client_secret => $client_secret,
          token_type => 'access_token',
        };

        if ($user_client_id) {
          $form->{client_id} = $user_client_id;
        };

        # Get the list of all clients
        return $c->korap_request(post => $r_url, {} => form => $form)->then(
          sub {
            my $tx = shift;
            my $json = $tx->result->json;

            # Response is fine
            if ($tx->res->is_success) {
              return Mojo::Promise->resolve($json);
            };

            $c->log->error($c->dumper($tx->res->to_string));

            # Failure
            $c->notify(error => $c->loc('Auth_responseError'));
            return Mojo::Promise->reject($json // 'No response');
          }
        );
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
            }

            # There is a server error - just report
            elsif ($tx->res->is_server_error) {
              my $err = $tx->res->error;
              if ($err) {
                return Mojo::Promise->reject($err->{code} . ': ' . $err->{message});
              }
              else {
                $c->notify(error => $c->loc('Auth_serverError'));
                return Mojo::Promise->reject;
              };
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
        $v->required('handle', 'trim');
        $v->required('pwd', 'trim');
        $v->csrf_protect;
        $v->optional('fwd')->closed_redirect;

        my $user = check_decode($v->param('handle'));
        unless ($user) {
          $c->notify(error => $c->loc('Auth_invalidChar'));
          $c->param(handle_or_email => '');
          return $c->relative_redirect_to('index');
        };

        my $fwd = $v->param('fwd');

        # Set flash for redirect
        $c->flash(handle => $user);

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
        )->then(
          sub {
            # Set user info
            $c->session(user => $user);
            $c->stash(user => $user);

            # Notify on success
            $c->app->log->debug(qq!Login successful: "$user"!);
            $c->notify(success => $c->loc('Auth_loginSuccess'));
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
              $c->flash(handle => delete $c->session->{user});
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


    # If "experimental_registration" is set, open
    # OAuth registration dialogues.
    if ($param->{experimental_client_registration}) {

      # Add settings
      $app->navi->add(settings => (
        $app->loc('Auth_oauthSettings'), 'oauth'
      ));

      # Route to oauth settings
      $r->get('/settings/oauth')->to(
        cb => sub {
          my $c = shift;

          _set_no_cache($c->res->headers);

          unless ($c->auth->token) {
            return $c->render(
              template => 'exception',
              msg => $c->loc('Auth_authenticationFail'),
              status => 401
            );
          };

          # Wait for async result
          $c->render_later;

          $c->auth->client_list_p->then(
            sub {
              $c->stash('client_list' => shift);
            }
          )->catch(
            sub {
              return;
            }
          )->finally(
            sub {
              return $c->render(template => 'auth/clients')
            }
          );
        }
      )->name('oauth-settings');

      # Route to oauth client registration
      $r->post('/settings/oauth/register')->to(
        cb => sub {
          my $c = shift;

          _set_no_cache($c->res->headers);

          my $v = $c->validation;

          unless ($c->auth->token) {
            return $c->render(
              content => 'Unauthorized',
              status => 401
            );
          };

          $v->csrf_protect;
          $v->required('name', 'trim')->size(3, 255);
          $v->required('type')->in('PUBLIC', 'CONFIDENTIAL');
          $v->required('desc', 'trim')->size(3, 255);
          $v->optional('url', 'trim')->like(qr/^(http|$)/i);
          $v->optional('redirect_uri', 'trim')->like(qr/^(http|$)/i);

          # Render with error
          if ($v->has_error) {
            if ($v->has_error('csrf_token')) {
              $c->notify(error => $c->loc('Auth_csrfFail'));
            }
            else {
              $c->notify(error => $c->loc('Auth_paramError'));
            };
            # return $c->redirect_to('oauth-settings');
            return $c->render(template => 'auth/clients');
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
            redirect_uri => $v->param('redirect_uri')
          })->then(
            sub {
              my $tx = shift;
              my $result = $tx->result;

              if ($result->is_error) {
                my $json = $result->json;
                if ($json && $json->{error}) {
                  $c->notify(
                    error => $json->{error} .
                      ($json->{error_description} ? ': ' . $json->{error_description} : '')
                  )
                };

                return Mojo::Promise->reject;
              };

              my $json = $result->json;

              my $client_id = $json->{client_id};
              my $client_secret = $json->{client_secret};

              $c->stash('client_name' => $v->param('name'));
              $c->stash('client_desc' => $v->param('desc'));
              $c->stash('client_type' => $v->param('type'));
              $c->stash('client_url'  => $v->param('url'));
              $c->stash('client_src'  => $v->param('source'));
              $c->stash('client_redirect_uri' => $v->param('redirect_uri'));
              $c->stash('client_id' => $client_id);

              if ($client_secret) {
                $c->stash('client_secret' => $client_secret);
              };

              $c->notify(success => $c->loc('Auth_en_registerSuccess'));

              return $c->render(template => 'auth/client');
            }
          )->catch(
            sub {
              $c->notify('error' => $c->loc('Auth_en_registerFail'));
            }
          )->finally(
            sub {
              return $c->redirect_to('settings' => { scope => 'oauth' });
            }
          );
        }
      )->name('oauth-register');


      # Unregister client page
      $r->get('/settings/oauth/:client_id/unregister')->to(
        cb => sub {
          my $c = shift;
          _set_no_cache($c->res->headers);
          $c->render(template => 'auth/unregister');
        }
      )->name('oauth-unregister');


      # Unregister client
      $r->post('/settings/oauth/:client_id/unregister')->to(
        cb => sub {
          my $c = shift;
          _set_no_cache($c->res->headers);

          my $v = $c->validation;

          unless ($c->auth->token) {
            return $c->render(
              content => 'Unauthorized',
              status => 401
            );
          };

          $v->csrf_protect;
          $v->required('client-name', 'trim')->size(3, 255);

          # Render with error
          if ($v->has_error) {
            if ($v->has_error('csrf_token')) {
              $c->notify(error => $c->loc('Auth_csrfFail'));
            }
            else {
              $c->notify(error => $c->loc('Auth_paramError'));
            };
            return $c->redirect_to('oauth-settings');
          };

          my $client_id =     $c->stash('client_id');
          my $client_name =   $v->param('client-name');
          my $client_secret = $v->param('client-secret');

          # Get list of registered clients
          my $r_url = Mojo::URL->new($c->korap->api)->path('oauth2/client/deregister/')->path(
            $client_id
          );

          my $send = {};

          if ($client_secret) {
            $send->{client_secret} = $client_secret;
          };

          # Get the list of all clients
          return $c->korap_request(delete => $r_url, {} => form => $send)->then(
            sub {
              my $tx = shift;

              # Response is fine
              if ($tx->res->is_success) {
                # Okay
                $c->notify(success => 'Successfully deleted ' . $client_name);
              }
              else {

                # Failure
                my $json = $tx->result->json;
                if ($json && $json->{error_description}) {
                  $c->notify(error => $json->{error_description});
                } else {
                  $c->notify(error => $c->loc('Auth_responseError'));
                };
              };

              return $c->redirect_to('oauth-settings');
            }
          );
        }
      )->name('oauth-unregister-post');


      # OAuth Client authorization
      $r->get('/settings/oauth/authorize')->to(
        cb => sub {
          my $c = shift;

          _set_no_cache($c->res->headers);

          my $v = $c->validation;
          $v->required('client_id');
          $v->optional('scope');
          $v->optional('state');
          $v->optional('redirect_uri');

          # Redirect with error
          if ($v->has_error) {
            $c->notify(error => $c->loc('Auth_paramError'));
            return $c->redirect_to;
          };

          foreach (qw!scope client_id state redirect_uri!) {
            $c->stash($_, $v->param($_));
          };

          # Get auth token
          my $auth_token = $c->auth->token;

          # TODO: Fetch client information from Server
          $c->stash(name => $v->param('client_id'));
          # my $redirect_uri_server = $c->url_for('index')->to_abs;
          $c->stash(type => 'CONFIDENTIAL');

          $c->stash(redirect_uri_server => $c->stash('redirect_uri'));

          # User is not logged in - log in before!
          unless ($auth_token) {
            return $c->render(template => 'auth/login');
          };

          # Grant authorization
          return $c->render(template => 'auth/grant_scope');
        }
      )->name('oauth-grant-scope');


      # OAuth Client authorization
      # This will return a location information including some info
      $r->post('/settings/oauth/authorize')->to(
        cb => sub {
          my $c = shift;

          _set_no_cache($c->res->headers);

          # It's necessary that it's clear this was triggered by
          # KorAP and not by the client!
          my $v = $c->validation;
          $v->csrf_protect;
          $v->required('client_id');
          $v->optional('scope');
          $v->optional('state');
          $v->optional('redirect_uri');

          # WARN! SIGN THIS TO PREVENT OPEN REDIRECT ATTACKS!
          $v->required('redirect_uri_server');

          # Render with error
          if ($v->has_error) {
            my $url = Mojo::URL->new($v->param('redirect_uri_server') // $c->url_for('index'));

            if ($v->has_error('csrf_token')) {
              $url->query([error_description => $c->loc('Auth_csrfFail')]);
            }
            else {
              $url->query([error_description => $c->loc('Auth_paramError')]);
            };

            return $c->redirect_to($url);
          };

          state $r_url = Mojo::URL->new($c->korap->api)->path('oauth2/authorize');
          $c->stash(redirect_uri_server => Mojo::URL->new($v->param('redirect_uri_server')));

          return $c->korap_request(post => $r_url, {} => form => {
            response_type => 'code',
            client_id => $v->param('client_id'),
            redirect_uri => $v->param('redirect_uri'),
            state => $v->param('state'),
            scope => $v->param('scope'),
          })->then(
            sub {
              my $tx = shift;

              # Check for location header with code in redirects
              my $loc;
              foreach (@{$tx->redirects}) {
                $loc = $_->res->headers->header('Location');

                my $url = Mojo::URL->new($loc);

                if ($url->query->param('code')) {
                  last;
                } elsif (my $err = $url->query->param('error_description')) {
                  return Mojo::Promise->reject($err);
                }
              };

              return Mojo::Promise->resolve($loc) if $loc;

              # Failed redirect, but location set
              if ($tx->res->headers->location) {
                my $url = Mojo::URL->new($tx->res->headers->location);
                if (my $err = $url->query->param('error_description'))  {
                  return Mojo::Promise->reject($err);
                };
              };

              # No location code
              return Mojo::Promise->reject('no location response');
            }
          )->catch(
            sub {
              my $err_msg = shift;
              my $url = $c->stash('redirect_uri_server');
              if ($err_msg) {
                $url = $url->query([error_description => $err_msg]);
              };
              return Mojo::Promise->resolve($url);
            }
          )->then(
            sub {
              my $loc = shift;
              return $c->redirect_to($loc);
            }
          )->wait;
          return $c->rendered;
        }
      )->name('oauth-grant-scope-post');


      # Show information of a client
      $r->get('/settings/oauth/:client_id')->to(
        cb => sub {
          my $c = shift;

          _set_no_cache($c->res->headers);

          $c->render_later;

          $c->auth->client_list_p->then(
            sub {
              my $json = shift;

              my ($item) = grep {
                $c->stash('client_id') eq $_->{client_id}
              } @$json;

              unless ($item) {
                return Mojo::Promise->reject;
              };

              $c->stash(client_name => $item->{client_name});
              $c->stash(client_desc => $item->{client_description});
              $c->stash(client_url  => $item->{client_url});
              $c->stash(client_type => ($item->{client_type} // 'PUBLIC'));
              $c->stash(client_src  => encode_json($item->{source})) if $item->{source};

              $c->auth->token_list_p($c->stash('client_id'));
            }
          )->then(
            sub {
              my $json = shift;

              $c->stash(tokens => $json);

              return Mojo::Promise->resolve;
            }
          )->catch(
            sub {
              return $c->reply->not_found;
            }
          )->finally(
            sub {
              return $c->render(template => 'auth/client')
            }
          );

          return;
        }
      )->name('oauth-tokens');
    };


    # Ask if new token should be issued
    $r->get('/settings/oauth/:client_id/token')->to(
      cb => sub {
        my $c = shift;
        _set_no_cache($c->res->headers);
        $c->render(template => 'auth/issue-token');
      }
    )->name('oauth-issue-token');


    # Ask if a token should be revoked
    $r->post('/settings/oauth/:client_id/token/revoke')->to(
      cb => sub {
        shift->render(template => 'auth/revoke-token');
      }
    )->name('oauth-revoke-token');


    # Issue new token
    $r->post('/settings/oauth/:client_id/token')->to(
      cb => sub {
        my $c = shift;
        _set_no_cache($c->res->headers);

        my $v = $c->validation;

        unless ($c->auth->token) {
          return $c->render(
            content => 'Unauthorized',
            status => 401
          );
        };

        $v->csrf_protect;
        $v->optional('client-secret');
        $v->required('name', 'trim');

        # Render with error
        if ($v->has_error) {
          if ($v->has_error('csrf_token')) {
            $c->notify(error => $c->loc('Auth_csrfFail'));
          }
          else {
            $c->notify(error => $c->loc('Auth_paramError'));
          };
          return $c->redirect_to('oauth-settings')
        };

        # Get authorization token
        state $r_url = Mojo::URL->new($c->korap->api)->path('oauth2/authorize');
        my $client_id = $c->stash('client_id');
        my $name = $v->param('name');
        my $redirect_url = $c->url_for->query({name => $name});

        return $c->korap_request(post => $r_url, {} => form => {
          response_type => 'code',
          client_id => $client_id,
          redirect_uri => $redirect_url,
          # TODO: State
        })->then(
          sub {
            my $tx = shift;

            # Strip the token from the location header of the fake redirect
            # TODO: Alternatively redirect!
            my ($code, $scope, $loc, $name);
            foreach (@{$tx->redirects}) {
              $loc = $_->res->headers->header('Location');
              if (index($loc, 'code') > 0) {
                my $q = Mojo::URL->new($loc)->query;
                $code  = $q->param('code');
                $scope = $q->param('scope');
                $name  = $q->param('name');
                last;
              };
            };

            # Fine!
            if ($code) {
              return Mojo::Promise->resolve(
                $client_id,
                $redirect_url,
                $code,
                $scope,
                $name
              );
            };
            return Mojo::Promise->reject;
          }
        )->then(
          sub {
            my ($client_id, $redirect_url, $code, $scope, $name) = @_;

            # Get OAuth access token
            state $r_url = Mojo::URL->new($c->korap->api)->path('oauth2/token');
            return $c->kalamar_ua->post_p($r_url, {} => form => {
              client_id => $client_id,
              # NO CLIENT_SECRET YET SUPPORTED
              grant_type => 'authorization_code',
              code => $code,
              redirect_uri => $redirect_url
            })->then(
              sub {
                my $tx = shift;
                my $json = $tx->res->json;

                if ($tx->res->is_error) {
                  $c->notify(error => 'Unable to fetch new token');
                  return Mojo::Promise->reject;
                };

                $c->notify(success => 'New access token created');

                $c->redirect_to('oauth-tokens' => { client_id => $client_id })
              }
            )->catch(
              sub {
                my $err_msg = shift;

                # Only raised in case of connection errors
                if ($err_msg) {
                  $c->notify(error => { src => 'Backend' } => $err_msg)
                };

                $c->render(
                  status => 400,
                  template => 'failure'
                );
              }
            )

            # Start IOLoop
            ->wait;

          }
        )->catch(
          sub {
            my $err_msg = shift;

            # Only raised in case of connection errors
            if ($err_msg) {
              $c->notify(error => { src => 'Backend' } => $err_msg)
            };

            return $c->render(
              status => 400,
              template => 'failure'
            );
          }
        )

        # Start IOLoop
        ->wait;

        return 1;
      }
    )->name('oauth-issue-token-post');


    # Revoke token
    $r->delete('/settings/oauth/:client_id/token')->to(
      cb => sub {
        my $c = shift;

        my $v = $c->validation;

        unless ($c->auth->token) {
          return $c->render(
            content => 'Unauthorized',
            status => 401
          );
        };

        $v->csrf_protect;
        $v->required('token', 'trim');
        $v->optional('name', 'trim');
        my $private_client_id = $c->stash('client_id');

        # Render with error
        if ($v->has_error) {
          if ($v->has_error('csrf_token')) {
            $c->notify(error => $c->loc('Auth_csrfFail'));
          }
          else {
            $c->notify(error => $c->loc('Auth_paramError'));
          };
          return $c->redirect_to('oauth-tokens', client_id => $private_client_id);
        };

        # Revoke token using super client privileges
        state $r_url = Mojo::URL->new($c->korap->api)->path('oauth2/revoke/super');

        my $token = $v->param('token');

        return $c->korap_request(post => $r_url, {} => form => {
          super_client_id => $client_id,
          super_client_secret => $client_secret,
          token => $token
        })->then(
          sub {
            my $tx = shift;

            # Response is fine
            if ($tx->res->is_success) {
              $c->notify(success => $c->loc('Auth_revokeSuccess'));
              return Mojo::Promise->resolve;
            };

            return Mojo::Promise->reject;
          }
        )->catch(
          sub {
            my $err_msg = shift;
            if ($err_msg) {
              $c->notify(error => { src => 'Backend' } => $err_msg );
            }
            else {
              $c->notify(error => $c->loc('Auth_revokeFail'));
            };
          }
        )->finally(
          sub {
            return $c->redirect_to('oauth-tokens', client_id => $private_client_id);
          }
        )

        # Start IOLoop
        ->wait;
      }
    )->name('oauth-revoke-token-delete');
  }

  # Use JWT login
  else {

    deprecated 'JWT flow is deprecated in favor of OAuth2 flow';

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
        $v->required('handle', 'trim');
        $v->required('pwd', 'trim');
        $v->csrf_protect;
        $v->optional('fwd')->closed_redirect;

        my $user = check_decode($v->param('handle'));
        unless ($user) {
          $c->notify(error => $c->loc('Auth_invalidChar'));
          $c->param(handle_or_email => '');
          return $c->relative_redirect_to('index');
        };

        my $fwd = $v->param('fwd');

        # Set flash for redirect
        $c->flash(handle => $user);

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


# Set 'no caching' headers
sub _set_no_cache {
  my $h = shift;
  $h->cache_control('max-age=0, no-cache, no-store, must-revalidate');
  $h->expires('Thu, 01 Jan 1970 00:00:00 GMT');
  $h->header('Pragma','no-cache');
};


sub check_decode {
  no warnings 'uninitialized';
  my $str = shift;
  my $str2 = is_utf8($str) ? b($str)->decode : $str;
  if (defined($str2) && $str2 && length($str2) > 1) {
    return $str2
  };
  return;
};


1;


__END__

=pod

=encoding utf8

=head1 NAME

Kalamar::Plugin::Auth - OAuth-2.0-based authorization plugin

=head1 DESCRIPTION

L<Kalamar::Plugin::Auth> is an OAuth-2.0-based authorization
plugin for L<Kalamar>. It requires a C<Kustvakt> full server
with OAuth 2.0 capabilities.
It is activated by loading C<Auth> as a plugin in the C<Kalamar.plugins>
parameter in the Kalamar configuration.

=head1 CONFIGURATION

L<Kalamar::Plugin::Auth> supports the following parameter for the
C<Kalamar-Auth> configuration section in the Kalamar configuration:

=over 2

=item B<client_id>

The client identifier of Kalamar to be send with every OAuth 2.0
management request.

=item B<client_secret>

The client secret of Kalamar to be send with every OAuth 2.0
management request.

=item B<oauth2>

Initially L<Kalamar-Plugin-Auth> was based on JWT. This parameter
is historically used to switch between oauth2 and jwt. It is expected
to be deprecated in the future, but for the moment it is required
to be set to a true value.

=item B<experimental_client_registration>

Activates the oauth client registration flow.

=back

=head2 COPYRIGHT AND LICENSE

Copyright (C) 2015-2020, L<IDS Mannheim|http://www.ids-mannheim.de/>
Author: L<Nils Diewald|http://nils-diewald.de/>

Kalamar is developed as part of the L<KorAP|http://korap.ids-mannheim.de/>
Corpus Analysis Platform at the
L<Leibniz Institute for the German Language (IDS)|http://ids-mannheim.de/>,
member of the
L<Leibniz-Gemeinschaft|http://www.leibniz-gemeinschaft.de>
and supported by the L<KobRA|http://www.kobra.tu-dortmund.de> project,
funded by the
L<Federal Ministry of Education and Research (BMBF)|http://www.bmbf.de/en/>.

Kalamar is free software published under the
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE>.

=cut
