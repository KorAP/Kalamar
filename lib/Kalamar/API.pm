package Kalamar::API;
use Mojo::Base 'Mojolicious::Plugin';
use Scalar::Util qw/blessed weaken/;
use strict;
use warnings;

# KorAP Search engine for Mojolicious::Plugin::Search

# TODO: Add fixtures
# TODO: Support search in corpus and virtualcollection
# TODO: Support caching everywhere!
# TODO: Correct use of stash info everywhere!

# Register the plugin
sub register {
  my ($plugin, $mojo, $index_class, $param) = @_;
  $param ||= {};

  # Add attributes to the index class
  $index_class->attr(api => $param->{api});
  $index_class->attr([qw/cutoff
			 query_language
			 time_exceeded
			 api_request
			 _api_cache
			 api_response
			 benchmark
			 query_jsonld/]);
  $index_class->attr(no_cache => 0);
};


# Search the index
sub search {
  my $self = shift;
  my $index = shift;

  # Get controller
  my $c = $index->controller;

  # If there is a callback, do async
  my $cb = pop if ref $_[-1] && ref $_[-1] eq 'CODE';

  # No query defined
  unless ($index->query) {
    return $cb->($index) if $cb;
    return;
  };

  # Get query url
  my $url = _query_url($index, @_);

  # Cache based on URL
  $index->_api_cache('total-' . $url->to_string);
  my %param = @_;

  # Set context based on parameter
  $url->query({ context => $param{'context'} // 'paragraph' });

  # Set path to search
  $url->path('search');

  # Check cache for total results
  my $total_results;

  if (!$index->no_cache &&
	defined ($total_results = $c->chi->get($index->_api_cache))) {

    # Set total results from cache
    $index->total_results($total_results);
    $c->app->log->debug('Get total result from cache');

    # Set cutoff unless already set
    $url->query({cutoff => 'true'}) unless defined $index->cutoff;
  };

  # Set api request for debugging
  $index->api_request($url->to_string);

  # Create new user agent and set timeout to 2 minutes
  my $ua = $c->ua;
  $ua->inactivity_timeout(120);

  # Debugging
  $c->app->log->debug('Search for ' . $index->api_request);

  # Search non-blocking
  if ($cb) {

    $ua->get(
      $url => sub {
	my $tx = pop;
	$self->_process_response('matches', $index, $tx);
	weaken $index;
	return $cb->($index);
      });
  }

  # Search blocking
  else {
    my $tx = $ua->get($url);
    $self->_process_response('matches', $index, $tx);
    return $index;
  };
};


# Trace query serialization
sub trace {
  my $self = shift;
  my $index = shift;

  # Get controller
  my $c = $index->controller;

  # If there is a callback, do async
  my $cb = pop if ref $_[-1] && ref $_[-1] eq 'CODE';

  my %param = @_;

  # No query defined
  unless ($index->query(delete $param{query})) {
    return $cb->($index) if $cb;
    return;
  };

  # Get query url
  my $url = _query_url($index, @_);

  $url->path('search');

  # Create new user agent and set timeout to 30 seconds
  my $ua = $c->ua; # Mojo::UserAgent->new;
  $ua->inactivity_timeout(30);

  # Build transaction
  my $tx = $ua->build_tx(TRACE => $url);

  # non-blocking
  if ($cb) {
    weaken $index;

    # Trace non-blocking
    $ua->start(
      $tx => sub {
	$self->_process_response('trace', $index, pop);
	return $cb->($index);
      });
  }
  # Trace blocking
  else {
    my $tx = $ua->start($url);
    return $self->_process_response('trace', $index, $tx);
  };
};


# Get match info
sub match {
  my $self = shift;
  my $index = shift;

  # Get controller
  my $c = $index->controller;

  # If there is a callback, do async
  my $cb = pop if ref $_[-1] && ref $_[-1] eq 'CODE';

  my %param = @_;

  my $url = Mojo::URL->new($index->api);

  # Legacy: In old versions, doc_id contained text_id
  $param{doc_id} .= '.' . $param{text_id} if $param{text_id};

  # Use hash slice to create path
  $url->path(join('/', 'corpus', @param{qw/corpus_id doc_id match_id/}, 'matchInfo'));

  # Build match id
  # $match = 'match-' . $corpus . '!' . $corpus . '_' . $doc . '-' . $match;

  my %query;
  $query{foundry} = $param{foundry};
  $query{layer}   = $param{layer}   if defined $param{layer};
  $query{spans}   = $param{spans} ? 'true' : 'false';

  # Add query
  $url->query(\%query);

  $c->app->log->debug('Match info: ' . $url);

  # Create new user agent and set timeout to 30 seconds
  my $ua = $c->ua; # Mojo::UserAgent->new;
  $ua->inactivity_timeout(30);

  # non-blocking
  if ($cb) {
    weaken $index;
    $ua->get(
      $url => sub {
	my $tx = pop;
	$self->_process_response('match', $index, $tx);
	return $cb->($index);
      });
  }

  # Match info blocking
  else {
    my $tx = $ua->get($url);
    return $self->_process_response('match', $index, $tx);
  };
};


# Get resource information
sub resource {
  my $self = shift;
  my $index = shift;

  # Get controller
  my $c = $index->controller;

  # If there is a callback, do async
  my $cb = pop if ref $_[-1] && ref $_[-1] eq 'CODE';

  my %param = @_;

  # Rename info endpoints regarding resource
  my $type = $param{type} // 'collection';
  $type = 'virtualcollection' if $type eq 'collection';

  # Create resource URL
  my $url = Mojo::URL->new($index->api)->path($type);

  # Debugging
  $c->app->log->debug('Get resource info on '. $url);

  # Check for cached information
  if (my $json = $c->chi->get($url->to_string)) {

    # TODO: That's unfortunate, as it prohibits caching of multiple resources
    $c->app->log->debug('Get resource info from cache');
    $c->stash('search.resource' => $json);
    return $cb->($index) if $cb;
    return $json;
  };

  $c->stash('search._resource_cache' => $url->to_string);

  # Create new user agent and set timeout to 30 seconds
  my $ua = $c->ua; # Mojo::UserAgent->new;
  $ua->inactivity_timeout(30);

  # Get resource information async
  if ($cb) {
    weaken $index;
    $ua->get(
      $url => sub {
	$self->_process_response('resource', $index, pop);
	return $cb->($index);
      })
  }

  # Get resource information blocking
  else {
    my $tx = $ua->get($url);
    $self->_process_response('resource', $index, $tx);
  };
};


# Process response - especially error messages etc.
sub _process_response {
  my ($self, $type, $index, $tx) = @_;
  my $c = $index->controller;

  # An error has occurded
  if (my $e = $tx->error) {
    $c->notify(
      error =>
	($e->{code} ? $e->{code} . ': ' : '') .
	  $e->{message} . ' (remote)'
	);
    return;
  };

  # Response was fine
  if (my $res = $tx->success) {

    # Set api response for debugging
    $index->api_response($res->body) if $c->kalamar_test_port;

    # Json failure
    my $json;
    unless ($json = $res->json) {
      $c->notify(error => 'JSON response is invalid');
      return;
    };

    # expected response for matches
    if ($type eq 'matches') {
      $self->_process_response_matches($index, $json);
    }
    elsif ($type eq 'trace') {
      $self->_process_response_trace($index, $json);
    }
    elsif ($type eq 'match') {
      $self->_process_response_match($index, $json);
    }
    elsif ($type eq 'resource') {
      $self->_process_response_resource($index, $json);
    };

    return 1 if ref $json ne 'HASH';

    # Add warnings (Legacy)
    if ($json->{warning}) {
      $json->{warning} =~ s/;\s+null$//;
      $c->notify(warn => $json->{warning});
    };

    $self->_notify_on_error($c, 0, $json);
  }

  # Request failed
  else {
    $self->_notify_on_error($c, 1, $tx->res);
  };
  return 1;
};


# Handle match results
sub _process_response_matches {
  my ($self, $index, $json) = @_;

  # Reformat benchmark counter
  my $benchmark = $json->{benchmark};
  if ($benchmark && $benchmark =~ s/\s+(m)?s$//) {
    $benchmark = sprintf("%.2f", $benchmark) . ($1 ? $1 : '') . 's';
  };

  # Set benchmark
  $index->benchmark($benchmark);

  # Set time exceeded
  if ($json->{timeExceeded} && $json->{timeExceeded} eq Mojo::JSON::true) {
    $index->time_exceeded(1);
  };

  # Set result values
  $index->items_per_page($json->{itemsPerPage});
  $index->query_jsonld($json->{request}->{query});
  $index->results(_map_matches($json->{matches}));

  # Total results not set by stash
  if ($index->total_results == -1) {

    if ($json->{totalResults} && $json->{totalResults} > -1) {
      my $c = $index->controller;

      $c->app->log->debug('Cache total result');
      $c->chi->set($index->_api_cache => $json->{totalResults}, '120min');
      $index->total_results($json->{totalResults});
    };
  };
};


# Process query serialization response
sub _process_response_match {
  my ($self, $index, $json) = @_;
  $index->results(_map_match($json));
};


# Process trace response
sub _process_response_trace {
  my ($self, $index, $json) = @_;
  $index->query_jsonld($json);
};


# Process resource response
sub _process_response_resource {
  my ($self, $index, $json) = @_;
  my $c = $index->controller;

  # TODO: That's unfortunate, as it prohibits multiple resources
  $c->stash('search.resource' => $json);
  $c->app->log->debug('Cache resource info');
  $c->chi->set($c->stash('search._resource_cache') => $json, '24 hours');
};


# Parse error messages and forward them to the user
sub _notify_on_error {
  my ($self, $c, $failure, $res) = @_;
  my $json = $res;

  my $log = $c->app->log;

  # Check if the response is already json
  if (blessed $res) {
    $json = $res->json if blessed $res ne 'Mojo::JSON';
  };

  # Chec json response error message
  if ($json) {
    if ($json->{error}) {
      # Temp
      $json->{error} =~ s/;\s+null$//;
      $c->notify(error => $json->{error});
      return;
    }

    # New error messages
    elsif ($json->{errstr}) {
      # Temp
      $json->{errstr} =~ s/;\s+null$//;
      $c->notify(error => $json->{errstr});
      return;
    }

    # policy service error messages
    elsif ($json->{status}) {
      $c->notify(error => 'Middleware error ' . $json->{status});
      return;
    };
  };

  # Doesn't matter what - there is a failure!
  if ($failure) {
    $c->notify(error => (
      ($res->{code}    ? $res->{code} . ': ' : '') .
      ($res->{message} ? $res->{message}     : 'Unknown error') .
      ' (remote)'
    ));
  };
};


# Cleanup array of matches
sub _map_matches {
  return () unless $_[0];
  map { _map_match($_) } @{ shift() };
};


# Cleanup single match
sub _map_match {
  my $x = shift or return;
  $x->{ID} =~ s/^match\-[^!]+![^-]+-//;
  $x->{docID} =~ s/^[^_]+_//;

  # Legacy: In old versions the text_id was part of the doc_id
  unless ($x->{textID}) {
    ($x->{docID}, $x->{textID}) = split '\.', $x->{docID};
  };
  $x;
};


# Build query url
sub _query_url {
  my ($index, %param) = @_;

  # Set cutoff from param
  $index->cutoff(delete $param{cutoff});

  # Set query language
  $index->query_language(delete $param{query_language} // 'poliqarp');

  # Should results be cached? Defaults to "yes"
  $index->no_cache(1) if $param{no_cache};

  # Init the query with stuff coming from the index
  my %query;
  $query{q}      = $index->query;
  $query{ql}     = $index->query_language;
  $query{page}   = $index->start_page if $index->start_page;
  $query{count}  = $index->items_per_page if $index->items_per_page;
  $query{cutoff} = 'true' if $index->cutoff;

  # Todo: support corpus and collection
  # Create query url
  my $url = Mojo::URL->new($index->api);
  $url->query(\%query);
  return $url;
};


1;


__END__

=pod

Additionally supported query parameters:
- query_language
- cutoff
- no_cache

Additional index attributes:
- api
- time_exceeded
- api_request
- api_response
- benchmark
- query_jsonld
