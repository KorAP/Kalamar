package Kalamar::Plugin::KalamarUser;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::ByteStream 'b';

has 'api';

sub register {
  my ($plugin, $mojo, $param) = @_;

  # Load parameter from config file
  if (my $config_param = $mojo->config('Kalamar')) {
    $param = { %$param, %$config_param };
  };

  # Set API!
  $plugin->api($param->{api}) or return;

  # Get the user token necessary for authorization
  $mojo->helper(
    'user_auth' => sub {
      my $c = shift;

      # Get token from stash
      my $token = $c->stash('auth');
      return $token if $token;

      # Set token to stash
      $c->stash(auth => $c->session('auth'));
      return $c->stash('auth');
    }
  );

  # Login
  $mojo->helper(
    'user.login' => sub {
      my $c = shift;
      my ($user, $pwd) = @_;

      return if index($user, ':') >= 0;

      my $url = Mojo::URL->new($plugin->api)->path('auth/apiToken');
      my $tx = $c->ua->get($url => {
	Authorization => 'Basic ' . b($user . ':' . $pwd)->b64_encode
      });

      # Login successful
      if (my $res = $tx->success) {
	my $jwt = $res->json;

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

      return unless $param =~ m/^details$/;

      # The user may be logged in
      my $auth = ($c->stash('auth') || $c->session('auth')) or return;

      # Get namespaced cache
      my $chi = $c->chi('user');

      # Get user and check, if the user is real
      my $user = $chi->get($auth);

      # Check if the user is really logged in
      my $value = $chi->get($user . '_' . $param);

      unless ($value) {
	$value = $plugin->get_authorized($auth, 'user/' . $param) or return;
	$chi->set($user . '_' . $param => $value);
      };

      # Return value
      return $value;
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


# Issue an authorized request
sub get_authorized {
  my $plugin = shift;

  my ($auth, $path) = @_;
  my $url = Mojo::URL->new($plugin->api)->path($path);

  # Get authorized
  # TODO: REUSE USERAGENT
  my $tx = Mojo::UserAgent->new->get($url => {
    Authorization => $auth
  });

  return $tx->success ? $tx->success->json : undef;
};


1;


__END__
