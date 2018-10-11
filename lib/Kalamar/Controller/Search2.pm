package Kalamar::Controller::Search2;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use Mojo::Collection 'c';
use Mojo::ByteStream 'b';

# This should be implemented as a helper
has api => '/api/';

has no_cache => 0;

has items_per_page => 25;


# Catch connection errors
sub _catch_http_errors {
  my $tx = shift;
  my $err = $tx->error;

  if ($err) {
    return Mojo::Promise->new->reject([
      [$err->{code}, $err->{message}]
    ]);
  };
  return $tx->result;
};


# Catch koral errors
sub _catch_koral_errors {
  my $res = shift;

  my $json = $res->json;

  unless ($json) {
    return Mojo::Promise->new->reject([
      [undef, 'JSON response is invalid']
    ]);
  };

  # Get errors
  my $err = $json->{errors};

  # Create error message
  if ($err) {
    return Mojo::Promise->new->reject($err);
  };

  if ($json->{status}) {
    return Mojo::Promise->new->reject([
      [undef, 'Middleware error ' . $json->{'status'}]
    ]);
  };

  return $json;
};


# Notify the user in case of warnings
sub _notify_on_warnings {
  my ($self, $warnings) = @_;

  # TODO: Check for ref!
  foreach my $w (@$warnings) {
    $self->notify(
      warn =>
        ($w->[0] ? $w->[0] . ': ' : '') .
        $w->[1]
      );
  };
};

sub _notify_on_errors {
  my ($self, $errors) = @_;
  foreach my $e (@$errors) {
    $self->notify(
      error =>
        ($e->[0] ? $e->[0] . ': ' : '') .
        ($e->[1] || 'Unknown')
      );
  };
};


# Notify the user in case of errors
#sub _notify_on_warnings {
#  my ($self, $json) = @_;
#
#  if ($json->{warnings}) {
#
#    # TODO: Check for ref!
#    foreach (@{$json->{warnings}}) {
#      $self->notify(
#        warn =>
#          ($_->[0] ? $_->[0] . ': ' : '') .
#          $_->[1]
#        );
#    };
#  };
#}


# Process response and set stash values
sub _process_matches {
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
  # Set benchmark
  # $index->benchmark($benchmark);

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

  # Set IDs based on the sigle
  (
    $match->{corpusID},
    $match->{docID},
    $match->{textID}
  ) = ($match->{textSigle} =~ /^([^_]+?)_+([^\.]+?)\.(.+?)$/);

  return $match;
};


# Query endpoint
sub query {
  my $c = shift;

  # Validate user input
  my $v = $c->validation;

  # In case the user is not known, it is assumed, the user is not logged in
  my $user = $c->stash('user') // 'not_logged_in';

  $v->optional('q', 'trim');
  $v->optional('ql')->in(qw/poliqarp cosmas2 annis cql fcsql/);
  $v->optional('collection'); # Legacy
  $v->optional('cq', 'trim');
  # $v->optional('action'); # action 'inspect' is no longer valid
  $v->optional('snippet');
  $v->optional('cutoff')->in(qw/true false/);
  $v->optional('count')->num(1, undef);
  $v->optional('p');
  $v->optional('context');

  # Get query
  my $query = $v->param('q');

  # No query
  unless ($query) {
    return $c->render($c->loc('Template_intro', 'intro'));
  };

  my %query = ();
  $query{q}       = $v->param('q');
  $query{ql}      = $v->param('ql');
  $query{page}    = $v->param('p') if $v->param('p');
  $query{count}   = $v->param('count') // $c->items_per_page;
  $query{cq}      = $v->param('cq') // $v->param('collection');
  $query{cutoff}  = $v->param('cutoff');
  $query{context} = $v->param('context') // '40-t,40-t'; # 'base/s:p'/'paragraph'


  # Create remote request URL
  my $url = Mojo::URL->new($c->api);
  $url->path('search');
  $url->query(\%query);

  # Check if total results is cached
  my $total_results;
  if (!$c->no_cache && 0) {
    $total_results = $c->chi->get('total-' . $user . '-' . $url->to_string);
    $c->stash(total_results => $total_results);
    $c->app->log->debug('Get total result from cache');

    # Set cutoff unless already set
    $url->query({cutoff => 'true'});
  };

  # Establish 'search_results' taghelper
  # This is based on Mojolicious::Plugin::Search
  $c->app->helper(
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

  # Check if the request is cached
  my $url_string = $url->to_string;

  # Set api request for debugging
  # $c->stash('api_request' => $url_string);

  # Debugging
  $c->app->log->debug('Search for ' . $url_string);

  # Check for cache
  my $json = $c->chi->get('matches-' . $user . '-' . $url_string);

  # Initialize promise object
  my $promise;

  # Result is cached
  if ($json) {
    $json->{cached} = 'true';

    # The promise is already satisfied by the cache
    $promise = Mojo::Promise->new->resolve($json);
  }

  # Retrieve from URL
  else {

    # Wrap a user agent method with a promise
    $promise = $c->user->auth_request_p(get => $url)
      ->then(\&_catch_http_errors)
      ->then(\&_catch_koral_errors)
      ;
  };

  $c->render_later;

  # Prepare warnings
  $promise->then(
    sub {
      my $json = shift;
      $c->_notify_on_warnings($json->{warnings}) if $json->{warnings};
      return $json
    }

  # Process response
  )->then(
    sub {
      my $json = shift;

      # Cache total results
      unless ($c->stash('total_results') && $json->{meta}->{totalResults}) {

        # Remove cutoff requirement again
        $url->query([cutoff => 'true']);

        # Set cache
        $c->chi->set(
          'total-' . $user . '-' . $url->to_string => $json->{meta}->{totalResults}
        )
      };

      # Cache result
      $c->chi->set('matches-' . $user . '-' . $url_string => $json);

      # Process match results
      return $c->_process_matches($json);
    }

  # Deal with errors
  )->catch(
    sub {
      $c->_notify_on_errors(shift);
    }

  # Render template
  )->finally(
    sub {
      # Choose the snippet based on the parameter
      my $template = scalar $v->param('snippet') ? 'snippet' : 'search2';

      $c->app->log->debug('Render template ...');

      return $c->render(
        template => $template,
        q => $query,
        ql => scalar $v->param('ql') // 'poliqarp',
        results => c(),
        start_page => 1,
        total_pages => 20,
        # total_results => 40,
        time_exceeded => 0,
        benchmark => 'Long ...',
        api_response => ''
      );
    }
  )->wait;


  return 1;
};


1;
