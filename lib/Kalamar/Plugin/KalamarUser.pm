package Kalamar::Plugin::KalamarUser;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::ByteStream 'b';

has 'api';
has 'ua';

# TODO: Merge with meta-button

sub register {
  my ($plugin, $mojo, $param) = @_;

  # Load parameter from config file
  if (my $config_param = $mojo->config('Kalamar')) {
    $param = { %$param, %$config_param };
  };

  # Load 'notifications' plugin
  unless (exists $mojo->renderer->helpers->{notify}) {
    $mojo->plugin(Notifications => {
      HTML => 1
    });
  };

  # Set API!
  $plugin->api($param->{api}) or return;
  $plugin->ua(Mojo::UserAgent->new(
    connect_timeout => 15,
    inactivity_timeout => 120,
    max_redirects => 3
  ));

  # Set app to server
  $plugin->ua->server->app($mojo);

  # Get the user token necessary for authorization
  $mojo->helper(
    'user_auth' => sub {
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

  $mojo->helper(
    'user.ua' => sub {
      my $c = shift;

      my $auth = $c->user_auth;

      return $plugin->ua unless $auth;

      my $ua = Mojo::UserAgent->new(
        connect_timeout => 15,
        inactivity_timeout => 120,
        max_redirects => 3
      );

      # Set app to server
      $ua->server->app($c->app);

      # Initiate client information
      my $client = $c->client_ip;

      $ua->on(
        start => sub {
          my ($ua, $tx) = @_;
          my $headers = $tx->req->headers;
          $headers->header('Authorization' => $auth);
          $headers->header('X-Forwarded-For' => $client) if $client;
        }
      );
      return $ua;
    }
  );

  # Request with authorization header
  $mojo->helper(
    'user.auth_request' => sub {
      my $c = shift;
      my $method = shift;
      my $path = shift;

      # Check for callback
      my $cb;
      if ($_[-1] && ref $_[-1] eq 'CODE') {
        $cb = pop;
      };

      my $ua = $plugin->ua;

      my $tx;
      if ($c->user_auth) {
        $tx = $plugin->build_authorized_tx(
          $c->user_auth, $c->client_ip, uc($method), $path, @_
        );
      }
      else {
        $tx = $ua->build_tx(
          uc($method), $path, @_
        );
      };
      return $ua->start($tx, $cb) if $cb;
      return $ua->start($tx);
    }
  );


  # Login
  $mojo->helper(
    'user.login' => sub {
      my $c = shift;
      my ($user, $pwd) = @_;

      return if (index($user, ':') >= 0);

      $c->app->log->debug("Login from user $user:$pwd");

      my $url = Mojo::URL->new($plugin->api)->path('auth/apiToken');

      # Find client ip
      my $client = $c->client_ip;
      my %add;
      %add = ('X-Forwarded-For' => $client) if $client;

      my $tx = $plugin->ua->get($url => {
        Authorization => 'Basic ' . b($user . ':' . $pwd)->b64_encode->trim,
        %add
      });

      # Login successful
      my $res = $tx->result;
      unless ($res->error) {

        # Get the java token
        my $jwt = $res->json;

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

        $mojo->log->debug(qq!Login successful: "$user" with "$auth"!);

        $user = $jwt->{username} ? $jwt->{username} : $user;

        # Set session info
        $c->session(user => $user);
        $c->session(auth => $auth);

        # Set stash info
        $c->stash(user => $user);
        $c->stash(auth => $auth);

        # Set cache
        $c->chi('user')->set($auth => $user);
        return 1;
      }

      elsif (my $e = $tx->error) {

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
      };

      $mojo->log->debug(qq!Login fail: "$user"!);

      return;
    }
  );

  # Get details, settings etc. with authorization
  $mojo->helper(
    'user.get' => sub {
      my $c = shift;
      my $param = shift;

      # 'info' is useless!
      return unless $param =~ m/^details|settings$/;

      # The user may be logged in
      my $auth = ($c->stash('auth') || $c->session('auth')) or return;

      # Get namespaced cache
      my $chi = $c->chi('user');

      # Get user and check, if the user is real
      my $user = $chi->get($auth);

      # Check if the user is really logged in
      my $value = $chi->get($user . '_' . $param);

      unless ($value) {

        my $tx = $plugin->build_authorized_tx(
          $auth,
          $c->client_ip,
          'GET',
          Mojo::URL->new($plugin->api)->path('user/' . $param)
          );
        $tx = $plugin->ua->start($tx);

        return if $tx->error;

        $value = $tx->result;
        #	else {
        #	  warn $c->dumper($value->json);
        #	};
        if ($value) {
          $value = $value->json;
        };

        $chi->set($user . '_' . $param => $value);
      };

      # Return value
      return $value;
    }
  );

  $mojo->helper(
    'user.set' => sub {
      my $c = shift;
      my $param = shift;

      # 'info' is useless!
      return unless $param =~ m/^details|settings$/;

      my $json_obj = shift;

      # The user may be logged in
      my $auth = ($c->stash('auth') || $c->session('auth')) or return;

      # Get namespaced cache
      my $chi = $c->chi('user');

      # Get user and check, if the user is real
      my $user = $chi->get($auth);

      # Build a JSON transaction object
      my $tx = $plugin->build_authorized_tx(
        $auth, $c->client_ip, 'POST', 'user/' . $param, json => $json_obj
      );

      # Start
      $tx = $plugin->ua->start($tx);

      return if $tx->error;
      my $res = $tx->result;

      # Kill all caches!!
      $chi->remove($user . '_' . $param);

      # Return value
      return $res->json;
    }
  );

  # Logout
  $mojo->helper(
    'user.logout' => sub {
      my $c = shift;

      # TODO: csrf-protection!

      my $url = Mojo::URL->new($plugin->api)->path('auth/logout');

      my $tx = $c->user->auth_request(
        'get', $url
      );

      unless ($tx->error) {
        # Clear cache
        $c->chi('user')->remove($c->user_auth);

        # Expire session
        $c->session(user => undef);
        $c->session(auth => undef);
        return 1;
      };
      return 0;
    }
  );
};


sub build_authorized_tx {
  my $plugin = shift;

  my $ua = $plugin->ua;
  my ($auth, $client_ip, $method, $path, @values) = @_;

  my $header;
  if (@values && ref $values[0] eq 'HASH') {
    $header = shift @values;
  }
  else {
    $header = {};
  };

  my $url = Mojo::URL->new($path);

  $header->{Authorization} = $auth;
  $header->{'X-Forwarded-For'} = $client_ip;

  return $ua->build_tx($method, $url => $header => @values);
};


1;


__END__

# Failure
entity {
  "errors":[
    [204,"authentication token is expired","eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0MSIsImlzcyI6Imh0dHA6IiwiZXhwIjoxNDUyOTY2NzAxOTYxfQ.W_rJjJ8i82Srw7MiSPRGeIBLE-rMPmSPK9BA7Dt_7Yc"]
  ]
}

