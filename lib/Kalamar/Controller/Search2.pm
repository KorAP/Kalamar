package Kalamar::Controller::Search2;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use Mojo::Collection 'c';
use Mojo::ByteStream 'b';
use POSIX 'ceil';

has no_cache => 0;

has items_per_page => 25;

# TODO:
#   Support server timing API

# TODO:
#   Add match_info template for HTML

# Query endpoint
sub query {
  my $c = shift;

  # Validate user input
  my $v = $c->validation;

  # In case the user is not known, it is assumed, the user is not logged in
  my $user = $c->stash('user') // 'not_logged_in';

  $v->optional('q', 'trim');
  $v->optional('ql')->in(qw/poliqarp cosmas2 annis cql fcsql/);
  $v->optional('collection', 'trim'); # Legacy
  $v->optional('cq', 'trim');
  # $v->optional('action'); # action 'inspect' is no longer valid
  # $v->optional('snippet');
  $v->optional('cutoff')->in(qw/true false/);
  $v->optional('count')->num(1, undef);
  $v->optional('p', 'trim')->num(1, undef); # Start page
  $v->optional('o', 'trim')->num(1, undef); # Offset
  $v->optional('context');

  # Get query
  my $query = $v->param('q');

  # TODO:
  #   Check for validation errors!

  # No query
  unless ($query) {
    return $c->render($c->loc('Template_intro', 'intro'));
  };

  my %query = ();
  $query{q}       = $v->param('q');
  $query{ql}      = $v->param('ql') // 'poliqarp';
  $query{p}       = $v->param('p') // 1; # Start page
  $query{count}   = $v->param('count') // $c->items_per_page;
  $query{cq}      = $v->param('cq') // $v->param('collection');
  $query{cutoff}  = $v->param('cutoff');

  # Before: 'base/s:p'/'paragraph'
  $query{context} = $v->param('context') // '40-t,40-t';

  my $items_per_page = $c->items_per_page;

  # Set count
  if ($query{count} && $query{count} <= $c->items_per_page ) {
    $items_per_page = delete $query{count};
  };

  $c->stash(items_per_page => $items_per_page);

  # Set offset
  # From Mojolicious::Plugin::Search::Index
  $query{o} = $v->param('o') || ((($query{p} // 1) - 1) * ($items_per_page || 1));


  # already set by stash - or use plugin param
  # else {
  #   $items_per_page = $c->stash('search.count') // $plugin->items_per_page
  # };

  # Set start page based on param
  #if ($query{p}) {
  #  $index->start_page(delete $param{start_page});
  #}
  ## already set by stash
  #elsif ($c->stash('search.start_page')) {
  #  $index->start_page($c->stash('search.start_page'));
  #};


  # Create remote request URL
  my $url = Mojo::URL->new($c->korap->api);
  $url->path('search');
  $url->query(\%query);

  # Check if total results is cached
  my $total_results = -1;
  unless ($c->no_cache) {

    # Get total results value
    $total_results = $c->chi->get('total-' . $user . '-' . $url->to_string);

    # Set stash if cache exists
    $c->stash(total_results => $total_results) if $total_results;
    $c->app->log->debug('Get total result from cache');

    # Set cutoff unless already set
    $url->query({cutoff => 'true'});
  };

  # Check if the request is cached
  my $url_string = $url->to_string;

  # Set api request for debugging
  $c->stash(api_request => $url_string);

  # Debugging
  $c->app->log->debug("Search for $url_string");

  # Check for cache
  my $json = $c->chi->get("matches-$user-$url_string");

  # Initialize promise object
  my $promise;

  # Result is cached
  if ($json) {
    $json->{cached} = 'true';

    # The promise is already satisfied by the cache
    $promise = Mojo::Promise->new->resolve($json)->then(
      sub {
        my $json = shift;
        $c->notify_on_warnings($json);
        return $json;
      }
    );
  }

  # Retrieve from URL
  else {

    # Wrap a user agent method with a promise
    $promise = $c->user->auth_request_p(get => $url)->then(
      sub {

        # Catch errors and warnings
        return $c->catch_errors_and_warnings(shift)
      }
    );
  };

  # Wait for rendering
  $c->render_later;

  # Choose the snippet based on the parameter
  # scalar $v->param('snippet') ? 'snippet' : 'search2';
  my $template = 'search2';
  $c->stash(template => $template);

  # Process response
  $promise->then(
    sub {
      my $json = shift;

      #######################
      # Cache total results #
      #######################
      # The stash is set in case the total results value is from the cache,
      # so in that case, it does not need to be cached again
      my $total_results = $c->stash('total_results');
      if (!$total_results) {

        # There are results to remember
        if ($json->{meta}->{totalResults} >= 0) {

          # Remove cutoff requirement again
          $url->query([cutoff => 'true']);

          $total_results = $json->{meta}->{totalResults};
          $c->stash(total_results => $total_results);

          # Set cache
          $c->chi->set(
            'total-' . $user . '-' . $url->to_string => $total_results
          );
        };
      }
      else {
        $c->stash(total_results => -1);
      }

      $c->stash(total_pages => 0);

      # Set total pages
      # From Mojolicious::Plugin::Search::Index
      if ($total_results > 0) {
        $c->stash(
          total_pages => ceil($total_results / ($c->stash('items_per_page') || 1))
        );
      };

      # Cache result
      $c->chi->set('matches-' . $user . '-' . $url_string => $json);

      # Process match results
      $c->_process_query_response($json);

      # Render result
      return $c->render(
        q => $query,
        ql => $query{ql},
        start_page => $query{p},
      );

    }

      # Deal with errors
  )->catch(
    sub {

      # $c->_notify_on_errors(shift);
      return $c->render(
        results => c(),
        q => $query,
        ql => $query{ql},
        start_page => 1
      );
    }
  )

  # Start IOLoop
  ->wait;

  return 1;
};


# Match info endpoint
sub match_info {
  my $c = shift;

  # Validate user input
  my $v = $c->validation;
  $v->optional('foundry');
  $v->optional('layer');
  $v->optional('spans')->in(qw/true false/);

  # Old API foundry/layer usage
  my $foundry = '*';
  my %query = (foundry => '*');
  if ($v->param('foundry')) {
    $query{foundry} = $v->param('foundry');
    $query{layer} = $v->param('layer') if $v->param('layer');
    $query{spans} = $v->param('spans') if $v->param('spans');
  };

  # Create new request API
  my $url = Mojo::URL->new($c->korap->api);

  # Use stash information to create url path
  $url->path(
    join('/', (
      'corpus',
      $c->stash('corpus_id'),
      $c->stash('doc_id'),
      $c->stash('text_id'),
      $c->stash('match_id'),
      'matchInfo'
    ))
  );

  # Set query parameters
  $url->query(\%query);

  $c->render_later;

  # TODO: Add caching!
  $c->user->auth_request_p(get => $url)->then(
    sub {
      return $c->catch_errors_and_warnings(shift);
    }
  )->then(
    sub {
      my $json = shift;

      # Process results
      $json = _map_match($json);
      $c->stash(results => $json);

      return $c->render(
        json => $c->notifications(json => $json),
        status => 200
      );

      return $json;
    }
  )

  # Deal with errors
  ->catch(
    sub {
      return $c->render(
        json => $c->notifications('json')
      )
    }
  )

  # Start IOLoop
  ->wait;

  return 1;
};


# Get information about
# This replaces the collections endpoint
sub corpus_info {
  my $c = shift;

  # Input validation
  my $v = $c->validation;
  $v->optional('cq');

  # Async
  $c->render_later;

  my $url = Mojo::URL->new($c->korap->api);

  # Use hash slice to create path
  $url->path('statistics');

  # Add query
  $url->query(corpusQuery => $v->param('cq'));

  # Set stash
  $c->stash('search._resource_cache' => $url->to_string);

  $c->app->log->debug("Statistics info: $url");

  # non-blocking
  $c->user->auth_request_p(get => $url)->then(
    sub {
      return $c->catch_errors_and_warnings(shift);
    }
  )->then(
    sub {
      my $json = shift;

      # TODO: CACHING!!!
      # my $user = $c->stash('user') // 'not_logged_in';
      # $c->stash('search.resource' => $json);
      # $c->chi->set($user . $c->stash('search._resource_cache') => $json, '24 hours');

      # $self->_process_response('resource', $index, $tx);

      return $json;
    }
  )

  # Process response
  ->then(
    sub {
      my $json = shift;
      return $c->render(
        json => $c->notifications(json => $json),
        status => 200
      );
    }
  )

  # Deal with errors
  ->catch(
    sub {
      return $c->render(
        json => $c->notifications('json')
      )
    }
  )

  # Start IOLoop
  ->wait;

  return 1;
};


# Cleanup array of matches
sub _map_matches {
  return c() unless $_[0];
  c(map { _map_match($_) } @{ shift() });
};


# Cleanup single match
sub _map_match {
  my $match = shift or return;

  # Legacy match id
  if ($match->{matchID}) {
    $match->{matchID} =~ s/^match\-(?:[^!]+!|[^_]+_)[^\.]+?\.[^-]+?-// or
      $match->{matchID} =~ s!^match\-(?:[^\/]+\/){2}[^-]+?-!!;
  };

  return unless $match->{textSigle};

  # Set IDs based on the sigle
  (
    $match->{corpusID},
    $match->{docID},
    $match->{textID}
  ) = ($match->{textSigle} =~ /^([^_]+?)_+([^\.]+?)\.(.+?)$/);

  return $match;
};


# Process response and set stash values
sub _process_query_response {
  my ($self, $json) = @_;

    # Process meta
  my $meta = $json->{meta};

  # TODO:
  #   Set benchmark in case of development mode only.
  #   Use server timing API
  #
  # Reformat benchmark counter
  # my $benchmark = $meta->{benchmark};
  # if ($benchmark && $benchmark =~ s/\s+(m)?s$//) {
  #   $benchmark = sprintf("%.2f", $benchmark) . ($1 ? $1 : '') . 's';
  # };
  #
  # # Set benchmark
  # $self->stash(benchmark => $benchmark);

  # Set time exceeded
  if ($meta->{timeExceeded} && $meta->{timeExceeded} eq Mojo::JSON::true) {
    $self->stash(time_exceeded => 1);
  };

  # Set result values
  $self->stash(items_per_page => $meta->{itemsPerPage});

  # Set authorization
  # $index->authorized($meta->{authorized}) if $meta->{authorized};

  # Bouncing query
  #  if ($json->{query}) {
  #    $index->query_jsonld($json->{query});
  #  };

  # Legacy
  # elsif ($json->{request}->{query}) {
  #   $index->query_jsonld($json->{request}->{query});
  # };


  if ($meta->{totalResults}) {
    $self->stash(total_results => $meta->{totalResults});
  };

  # Bouncing collection query
  if ($json->{corpus} || $json->{collection}) {
    $self->stash(corpus_jsonld => ($json->{corpus} || $json->{collection}));
  };

  # Set results to stash
  $self->stash(
    results => _map_matches($json->{matches})
  );

  return;
};


1;


__END__
