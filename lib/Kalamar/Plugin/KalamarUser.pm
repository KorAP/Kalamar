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
    inactivity_timeout => 60
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
      my $client = $c->req->headers->header('X-Forwarded-For');

      return $plugin->ua unless $auth;

      my $ua = Mojo::UserAgent->new;

      # Set app to server
      $ua->server->app($mojo);

      $ua->on(
        start => sub {
          my ($ua, $tx) = @_;
          my $headers = $tx->req->headers;
          $headers->header('Authorization' => $auth);
          $headers->header('X-Forwarded-For' => $client);
        }
      );
      return $ua;
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
      my $tx = $plugin->ua->get($url => {
        Authorization => 'Basic ' . b($user . ':' . $pwd)->b64_encode->trim
      });

      # Login successful
      if (my $res = $tx->success) {

        $c->app->log->debug("Transaction: " . $res->to_string);

        my $jwt = $res->json;

        unless ($jwt) {
          $c->notify(error => 'Response is no valid JWT (remote)');
          return;
        };

        # TODO: Deal with user return values.

        my $auth = $jwt->{token_type} . ' ' . $jwt->{token};

        $mojo->log->debug(qq!Login successful: "$user" with "$auth"!);

        # Set session info
        $c->session(user => $user);
        $c->session(auth => $auth);

        $c->stash(user => $user);
        $c->stash(auth => $auth);

        # Set cache
        $c->chi('user')->set($auth => $user);
        return 1;
      }

      elsif (my $e = $tx->error) {
        $c->notify(
          error =>
            ($e->{code} ? $e->{code} . ': ' : '') .
            $e->{message} . ' for Login (remote)'
          );
        $c->app->log->debug($e->{code} . ($e->{message} ? ' - ' . $e->{message} : ''));
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

        my $tx = $plugin->build_authorized_tx($auth, 'GET', 'user/' . $param);
        $tx = $plugin->ua->start($tx);

        unless ($value = $tx->success) {
          return;
        }
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
        $auth, 'POST', 'user/' . $param, json => $json_obj
      );

      # Start
      $tx = $plugin->ua->start($tx);

      my $res = $tx->success or return;

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
      # TODO: REVOKE ON THE SERVER ONCE SUPPORTED!

      # Clear cache
      $c->chi('user')->remove($c->user_auth);

      # Expire session
      $c->session(expires => 1);
      return $c->redirect_to('index');
    }
  );
};


sub build_authorized_tx {
  my $plugin = shift;

  my $ua = $plugin->ua;
  my ($auth, $method, $path, @values) = @_;

  my $header;
  if (@values && ref $values[0] eq 'HASH') {
    $header = shift @values;
  }
  else {
    $header = {};
  };

  my $url = Mojo::URL->new($plugin->api)->path($path);

  $header->{Authorization} = $auth;

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

