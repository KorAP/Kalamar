package Kalamar::Plugin::KalamarUser;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Util qw/deprecated/;
use Mojo::Promise;
use Mojo::ByteStream 'b';
use Kalamar::Request;

has 'api';
has 'ua';

sub register {
  my ($plugin, $mojo, $param) = @_;


  # Load parameter from config file
  if (my $config_param = $mojo->config('Kalamar')) {
    $param = { %$param, %$config_param };
  };

  # Set API!
  $plugin->api($param->{api}) or return;
  $plugin->ua(Mojo::UserAgent->new(
    connect_timeout => 90,
    inactivity_timeout => 120,
    max_redirects => 3
  ));

  # Set app to server
  $plugin->ua->server->app($mojo);


  # Get a user agent object for Kalamar
  $mojo->helper(
    'kalamar_ua' => sub {
      return $plugin->ua;
    }
  );


  # Get user handle
  $mojo->helper(
    'user_handle' => sub {
      my $c = shift;

      # Get from stash
      my $user = $c->stash('user');
      return $user if $user;

      # Get from session
      $user = $c->session('user');

      # Set in stash
      if ($user) {
        $c->stash(user => $user);
        return $user;
      };

      return 'not_logged_in';
    }
  );


  # This is a new general korap_request helper,
  # that can trigger some hooks for, e.g., authentication
  # or analysis. It returns a promise.
  $mojo->helper(
    'korap_request' => sub {
      my $c      = shift;
      my $method = shift;
      my $path   = shift;

      # Get plugin user agent
      my $ua = $plugin->ua;

      my $url = Mojo::URL->new($path);
      my $tx = $ua->build_tx(uc($method), $url, @_);

      # Set X-Forwarded for
      $tx->req->headers->header(
        'X-Forwarded-For' => $c->client_ip
      );

      # Emit Hook to alter request
      $c->app->plugins->emit_hook(
        before_korap_request => ($c, $tx)
      );

      return $ua->start_p($tx);
    }
  );


  # Return KorAP-Request object helper
  $mojo->helper(
    'kalamar.request' => sub {
      return Kalamar::Request->new(
        controller => shift,
        method => shift,
        url => shift,
        ua => $plugin->ua
      )->param(@_);
    }
  );
};


1;


__END__

