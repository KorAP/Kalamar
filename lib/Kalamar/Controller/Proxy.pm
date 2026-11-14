package Kalamar::Controller::Proxy;
use Mojo::Base 'Mojolicious::Controller';

sub api_pass {
  my $c = shift;

  my $apiv = $c->stash('apiv');

  # Get API request for proxying
  # External URL!
  my $base_url = Mojo::URL->new($c->korap->api($apiv));
  $c->stash('root_path', $base_url->to_string);

  $c->stash(service => 'proxy');

  return $c->pass($base_url);
};

# Pass proxy command to API
sub pass {
  my $c = shift;

  # Pass the authorization of the session to trusted mounts
  my $auth;
  if ($c->stash('pass_auth') && $c->app->renderer->get_helper('auth')) {
    $auth = $c->auth->token;
    my $exp = $c->session('auth_exp');

    # Token is expired
    if ($auth && defined $exp && $exp < time) {
      $auth = undef;
      my $refresh_token = $c->session('auth_r');

      # Refresh once and restart
      if ($refresh_token && !$c->stash('auth_refreshed')) {
        my @args = @_;
        $c->stash(auth_refreshed => 1);
        $c->render_later;
        $c->auth->refresh_p($refresh_token)->catch(sub {})->finally(
          sub { $c->pass(@args) }
        );
        return 1;
      };
    };
  };
  my $base_url = shift // Mojo::URL->new($c->stash('mount'));

  my $base_path = $base_url->path->trailing_slash(1);

  my $proxy_path = Mojo::Path->new(
    $c->stash('proxy_path') ? $c->stash('proxy_path') : ''
  )->leading_slash(0);

  $base_path = $base_path->merge($proxy_path);
  $base_url = $base_url->path($base_path);

  # Get the original request
  my $req = $c->req;

  # Clone and clean request headers
  my $headers = $req->headers->clone->dehop;

  # Set Proxy information
  $headers->header('X-Proxy' => 'Kalamar');

  # Set clean X-Forwarded-For header
  $headers->header(
    'X-Forwarded-For' => $c->client_ip
  );

  # Respect an authorization sent by the client
  $headers->authorization($auth) if $auth && !$headers->authorization;

  # The mount gets the authorization instead of the session,
  # that also contains the refresh token
  $headers->remove('Cookie') if $c->stash('pass_auth');

  # Get parameters of the request
  my $params = $req->query_params->clone;

  my $url = $base_url->query($params);

  # Resend headers
  my $tx = $c->kalamar_ua->build_tx(
    $req->method => $url => $headers->to_hash => $req->body
  );

  # Pipe through system (which means
  # an authorization header may be set)
  $c->app->plugins->emit_hook(
    before_korap_request => ($c, $tx)
  );

  my $origin = $c->req->headers->origin;

  # Retrieve CORS header
  if ($c->req->method eq 'OPTIONS') {

    my $h = $c->res->headers;
    # Remember this option for a day
    $h->header('Access-Control-Max-Age' => '86400');
    $h->header('Access-Control-Allow-Headers' => '*');
    $h->header('Access-Control-Allow-Origin', $origin || '*');
    $h->header('Access-Control-Allow-Methods' => 'GET, OPTIONS');
    return $c->render(
      status => 204,
      text => ''
    );
  };

  # Start proxy transaction and catch failure
  $c->proxy->start_p($tx)->catch(
    sub {
      my $err = shift;
      $c->render(
        text => "Proxy error: $err",
        status => 400
      );
    }
  )->finally(
    sub {
      $c->rendered;
    }
  )->wait;

  $tx->res->content->once(
    body => sub {
      my $h = $c->res->headers;
      $h->header('X-Proxy' => 'Kalamar');
      $h->header('X-Robots' => 'noindex');
      $h->header('Access-Control-Allow-Origin', $origin || '*');
      $h->header('Access-Control-Allow-Methods' => 'GET, OPTIONS');

      # The proxy replaced the response headers, so the
      # session cookie with the refreshed tokens is set here
      $c->app->sessions->store($c) if $c->stash('auth_refreshed');

      # Response is a redirect
      if ($c->res->is_redirect) {

        # Rewrite redirect location to surface URL
        my $location_url = $h->location;
        my $root_path = $c->stash('root_path');

        # Remove the api part
        # ".*?" is just required for non-absolute base_urls
        $location_url =~ s/^.*?${root_path}//;

        # Turn the rewritten location into a URL object
        $location_url = Mojo::URL->new($location_url);

        my $proxy_url = $c->url_for($c->stash('service') || 'proxy');
        $proxy_url->path->trailing_slash(1);

        # Rebase to proxy path
        my $loc_based = $location_url->base($proxy_url->to_abs);

        # Reset location
        $h->location($loc_based->to_abs);
      };

      # Workaround for a proxy problem when
      # another proxy, e.g. Apache, manages multiple
      # connections
      $h->connection('close');

      $c->app->plugins->emit_hook(after_render => $c);
    }
  );

  return 1;
};

1;
