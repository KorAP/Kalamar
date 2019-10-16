package Kalamar::Plugin::KalamarHelpers;
use Mojo::ByteStream 'b';
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Util qw/deprecated/;


sub register {
  my ($plugin, $mojo) = @_;

  # Get config
  my $conf = $mojo->config('Kalamar');

  # Define API_URL
  my $api_url = Mojo::URL->new(
    $conf->{api_path} // '-'
  )->path('v' . ($conf->{api_version} // '-') . '/')->to_string;

  # Embed the korap architecture image
  $mojo->helper(
    korap_overview => sub {
      my $c = shift;
      my $scope = shift;

      my $url = $c->url_with('/img/korap-overview.svg');

      my $base = $c->url_for('index');
      if ($base->path->parts->[0]) {
        $base->path->trailing_slash(1);
      };

      # If there is a different base - append this as a base
      $url->query([base => $base // '/']);

      $url->fragment($scope);

      return $c->tag(
        'object',
        data => $url,
        type => 'image/svg+xml',
        alt  => $c->loc('korap_overview'),
        id   => 'overview'
      );
    }
  );


  # Establish 'search_results' taghelper
  # This is based on Mojolicious::Plugin::Search
  $mojo->helper(
    search_results => sub {
      my $c = shift;

      # This is a tag helper for templates
      my $cb = shift;
      if (!ref $cb || !(ref $cb eq 'CODE')) {
        $c->app->log->error('search_results expects a code block');
        return '';
      };

      my $coll = $c->stash('results');

      # Iterate over results
      my $string = $coll->map(
        sub {
          # Call hit callback
          # $c->stash('search.hit' => $_);
          local $_ = $_[0];
          return $cb->($_);
        })->join;

      # Remove hit from stash
      # delete $c->stash->{'search.hit'};
      return b($string);
    }
  );


  # Get the KorAP API endpoint
  $mojo->helper(
    'korap.api' => sub {
      my $c = shift;

      # TODO:
      #   May clone a Mojo::URL object instead
      return $api_url unless @_;

      my $apiv = shift;
      if (!$apiv || $apiv eq $conf->{api_version}) {
        return $api_url;
      };

      # Return newly created API URL
      return Mojo::URL->new($conf->{api_path})->path('v' . $apiv . '/')->to_string;
    }
  );


  # Get a cached request from the backend as a promise
  $mojo->helper(
    cached_koral_p => sub {
      my ($c, $method, $url) = @_;

      # In case the user is not known, it is assumed,
      # the user is not logged in
      # TODO:
      #   Make this more general
      my $user = $c->user_handle;

      # Set api request for debugging
      my $cache_str = "$method-$user-" . $url->to_string;
      $c->stash(api_request => $url->to_string);

      # No cache request
      if ($c->stash('no_cache')) {

        return $c->korap_request($method => $url)->then(
          sub {
            my $tx = shift;
            # Catch errors and warnings
            return ($c->catch_errors_and_warnings($tx) ||
              Mojo::Promise->reject);
          }
        );
      };

      # Get koral from cache
      my $koral = $c->chi->get($cache_str);

      my $promise;

      # TODO:
      #   emit_hook(after_koral_fetch => $c)

      # Cache was found
      if ($koral) {

        # Mark response as cache
        $c->res->headers->add('X-Kalamar-Cache' => 'true');

        # The promise is already satisfied by the cache
        return Mojo::Promise->new->resolve($koral)->then(
          sub {
            my $json = shift;
            $c->notify_on_warnings($json);
            $c->stash(api_response => $json);
            return $json;
          }
        );
      };

      # Resolve request
      # Before: user->auth_request_p
      return $c->korap_request($method => $url)->then(
        sub {
          my $tx = shift;
          return ($c->catch_errors_and_warnings($tx) ||
                    Mojo::Promise->new->reject);
        }
      )->then(
        # Cache on success
        sub {
          my $json = shift;

          $c->app->log->debug("Receiving promised results");

          $c->chi->set($cache_str => $json);
          return $json;
        }
      );
    }
  );
};


1;
