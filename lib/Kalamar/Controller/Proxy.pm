package Kalamar::Controller::Proxy;
use Mojo::Base 'Mojolicious::Controller';

# Pass proxy command to API
sub pass {
  my $c = shift;

  my $apiv = $c->stash('apiv');
  my $path = $c->stash('path') // '';

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

  # Get parameters of the request
  my $params = $req->query_params->clone;
  my $api_url;

  # Get API request for proxying
  my $url = Mojo::URL->new($c->korap->api($apiv))->path($path)->query($params);

  # Resend headers
  my $tx = $c->kalamar_ua->build_tx(
    $req->method => $url => $headers->to_hash => $req->body
  );

  # Pipe through system (which means
  # an authorization header may be set)
  $c->app->plugins->emit_hook(
    before_korap_request => ($c, $tx)
  );

  # return $c->render(text => 'okay ' . $url);

  $c->proxy->start_p($tx)->wait;
  # $tx->res->content->once(
  #   body => sub {
  #     $c->res->headers->header('X-Proxy' => 'Kalamar');
  #   }
  # );
};

1;
