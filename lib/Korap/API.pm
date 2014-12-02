package Korap::API;
use Mojo::Base 'Mojolicious::Plugin';
use Scalar::Util 'blessed';
use strict;
use warnings;

# KorAP Search engine for Mojolicious::Plugin::Search

# Todo: Add fixtures
# Todo: Support search in corpus and virtualcollection


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

  my $c = $index->controller;

  # No query defined
  return unless $index->query;

  # If there is a callback, do async
  my $cb = pop if ref $_[-1] && ref $_[-1] eq 'CODE';

  my %param = @_;

  # Set cutoff from param
  $index->cutoff(delete $param{cutoff});

  # Set query language
  $index->query_language(delete $param{query_language} // 'poliqarp');

  # TODO: This should also be a query parameter
  $index->no_cache(1) if $param{no_cache} or $c->param('no_cache');

  my %query;
  $query{q}      = $index->query;
  $query{ql}     = $index->query_language;
  $query{page}   = $index->start_page;
  $query{count}  = $index->items_per_page;
  $query{cutoff} = 'true' if $index->cutoff;

  # Todo: support corpus and collection
  # Create query url
  my $url = Mojo::URL->new($index->api);
  $url->path('search');
  $url->query(\%query);

  # Cache based on URL
  $index->_api_cache('total-' . $url->to_string);

  # Set context based on parameter
  $url->query({ context => $c->param('context') // 'paragraph' });

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
  my $ua = Mojo::UserAgent->new;
  $ua->inactivity_timeout(120);

  # Denugging
  $c->app->log->debug('Search for ' . $index->api_request);

  # Search non-blocking
  if ($cb) {

    # Non-blocking request
    $ua->get(
      $url->to_string => sub {
	my ($ua, $tx) = @_;
	unless ($tx->success) {
	  if (my $e = $tx->error) {
	    warn 'Problem: ' . $e->{message};
	    return $cb->($index);
	  };
	};

	$self->_process_response($index, pop);
	return $cb->($index);
      });

    Mojo::IOLoop->wait unless Mojo::IOLoop->is_running;
  }

  # Search blocking
  else {
    my $tx = $ua->get($url);
    return $self->_process_response($index, $tx);
  };
};


sub _process_response {
  my ($self, $index, $tx) = @_;
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
    $index->api_response($res->body) if $c->korap_test_port;

    # Json failure
    my $json;
    unless ($json = $res->json) {
      $c->notify(error => 'JSON response is invalid');
      return;
    };

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
	$c->app->log->debug('Cache total result');
	$c->chi->set($index->_api_cache => $json->{totalResults}, '120min');
	$index->total_results($json->{totalResults});
      };
    };

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



sub _notify_on_error {
  my ($self, $c, $failure, $res) = @_;
  my $json = $res;

  my $log = $c->app->log;

  if (blessed $res) {
    if (blessed $res ne 'Mojo::JSON') {
      $json = $res->json;
    };
  };

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

  if ($failure) {
    $c->notify(error => (
      ($res->{code}    ? $res->{code} . ': ' : '') .
      ($res->{message} ? $res->{message}     : 'Unknown error') .
      ' (remote)'
    ));
  };
};


sub _map_matches {
  return () unless $_[0];
  map {
    $_->{ID} =~ s/^match\-[^!]+![^-]+-//;
    $_->{docID} =~ s/^[^_]+_//;
    $_;
  } @{ shift() };
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
