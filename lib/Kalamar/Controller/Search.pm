package Kalamar::Controller::Search;
use Mojo::Base 'Mojolicious::Controller';
use Mojo::Collection 'c';
use Mojo::ByteStream 'b';
use Mojo::Util qw/quote/;
use Mojo::JSON;
use POSIX 'ceil';

our @search_fields = qw!ID UID textSigle layerInfos title subTitle pubDate author availability snippet!;
our $query_placeholder = 'NOQUERY';

# TODO:
#   Support server timing API
#
# TODO:
#   use "token" instead of "user"
#
# TODO:
#   Add match_info template for HTML
#
# TODO:
#   Support search in corpus and virtualcollection
#
# TODO:
#   set caches with timing like '120min'
#
# TODO:
#  Use nested fields

# Query endpoint
sub query {
  my $c = shift;

  # Validate user input
  my $v = $c->validation;

  $v->optional('q', 'trim')->size(1,4096);
  $v->optional('ql')->in(qw/poliqarp cosmas2 annis cqp cql fcsql/);
  $v->optional('collection', 'trim'); # Legacy
  $v->optional('cq', 'trim');         # New
  $v->optional('cutoff', 'trim')->in(qw/1 0 true false/);
  $v->optional('count', 'trim')->num(1, undef);
  $v->optional('p', 'trim')->num(1, undef); # Start page
  $v->optional('o', 'trim')->num(1, undef); # Offset
  $v->optional('context');
  $v->optional('pipe', 'trim');
  # $v->optional('action'); # action 'inspect' is no longer valid
  # $v->optional('snippet');

  my $cutoff;
  if ($v->param('cutoff') && $v->param('cutoff') =~ /^1|true$/i) {
    $cutoff = 'true';
  };

  # Deal with legacy collection
  my $cq = $v->param('cq');
  if ($v->param('collection') && !defined $cq) {
    $c->param(cq => $v->param('collection'));
    $cq = $v->param('collection');
  };

  my %query = ();
  $query{q}  = $v->param('q')  // '';
  $query{ql} = $v->param('ql') // 'poliqarp';

  # No query (Check ignoring validation)
  unless ($c->param('q')) {

    # No corpus query
    unless ($v->param('cq')) {
      return $c->render(
        $c->loc('Template_intro', 'intro'),
        robots => 'index,follow'
      );
    };

    # Corpus query exists
    $query{q} = $query_placeholder;
    $query{count} = 0;
    $query{cutoff}  = 'true';
  }

  else {
    $c->stash(title => $c->loc(
      'searchtitle',
      q => $query{'q'},
      ql => $query{'ql'}
    ));
  };

  $c->res->headers->header('X-Robots', 'noindex');

  $c->stash(q  => $query{q});
  $c->stash(ql => $query{ql});

  # Check validation
  if ($v->has_error) {

    # Create error notifications
    foreach my $failed_field (@{$v->failed}) {
      $c->notify(error => 'Parameter ' . quote($failed_field) . ' invalid');
    };
    return $c->render(
      status => 400,
      template => 'failure'
    );
  };

  my $items_per_page = $c->stash('items_per_page');

  $query{count}   = $v->param('count') // $items_per_page;
  $query{cq}      = $cq;
  $query{cutoff}  = $cutoff;
  $query{context} = $v->param('context') // $c->stash('context');

  # Start page
  my $page = $v->param('p') // 1;

  # Set count
  if ($query{count} && $query{count} <= $items_per_page ) {
    $items_per_page = delete $query{count};
    $query{count} = $items_per_page;
  };

  # Forward pipe
  if ($v->param('pipe')) {

    # Temporary, as this is not agreed among the services yet
    $query{pipes} = $v->param('pipe');
  };

  $c->stash(items_per_page => $items_per_page);

  # TODO:
  #   if ($v->param('action') eq 'inspect') use trace!

  # Set offset
  # From Mojolicious::Plugin::Search::Index
  $query{offset} = $v->param('o') || ((($page // 1) - 1) * ($items_per_page || 1));


  # Add requested fields
  $query{fields} = join ',', @search_fields;

  # Create remote request URL
  my $url = Mojo::URL->new($c->korap->api);
  $url->path('search');
  $url->query(map { $_ => $query{$_}} sort keys %query);

  # In case the user is not known, it is assumed, the user is not logged in
  my $total_cache_str;

  # Check if total results information is cached
  my $total_results = -1;

  if (!$cutoff && !$c->stash('no_cache')) {

    # Create cache string
    my $user = $c->user_handle;
    my $cache_url = $url->clone;
    $cache_url->query->remove('context')->remove('count')->remove('cutoff')->remove('offset');
    $total_cache_str = "total-$user-" . $cache_url->to_string;

    $c->app->log->debug('Check for total results: ' . $total_cache_str);

    # Get total results value
    $total_results = $c->chi->get($total_cache_str);

    # Set stash if cache exists
    if (defined $total_results) {

      if ($total_results =~ s/^!//) {
        $c->stash(time_exceeded => 1);
      };

      $c->stash(total_results => $total_results);

      $c->app->log->debug('Get total result from cache: ' . $total_results);

      # Set cutoff unless already set
      $url->query({cutoff => 'true'});
    };
  };

  # Wait for rendering
  $c->render_later;

  # Fetch resource
  $c->cached_koral_p('get', $url)->then(

    # Process response
    sub {
      my $json = shift;

      $c->app->log->debug("Receiving cached promised results");

      #######################
      # Cache total results #
      #######################
      # The stash is set in case the total results value is from the cache,
      # so in that case, it does not need to be cached again
      my $total_results = $c->stash('total_results');

      unless (defined $total_results) {

        # There are results to remember
        if (!$cutoff &&
              !$c->stash('no_cache') &&
              $json->{meta}->{totalResults} >= 0) {

          # Remove cutoff requirement again
          # $url->query([cutoff => 'true']);

          $total_results = $json->{meta}->{totalResults};
          $c->stash(total_results => $total_results);

          $c->app->log->debug('Set for total results: ' . $total_cache_str);

          # Set cache
          $c->chi->set(
            $total_cache_str => ($json->{meta}->{timeExceeded} ? '!' : '') . $total_results
            );
        }

        # Undefined total results
        else {
          $c->stash(total_results => -1);
          $total_results = -1;
        };
      };


      $c->stash(total_pages => 0);

      # Set total pages
      # From Mojolicious::Plugin::Search::Index
      if ($total_results > 0) {
        $c->stash(
          total_pages => ceil($total_results / ($c->stash('items_per_page') || 1))
        );
      };

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
      if ($meta->{timeExceeded} &&
            $meta->{timeExceeded} eq Mojo::JSON::true) {
        $c->stash(time_exceeded => 1);
      };

      # Set result values
      $c->stash(items_per_page => $meta->{itemsPerPage});

      # Bouncing collection query
      if ($json->{corpus} || $json->{collection}) {
        $c->stash(corpus_jsonld => ($json->{corpus} || $json->{collection}));
      };

      # TODO:
      #   scalar $v->param('snippet') ? 'snippet' : 'search';

      # Set search results in stash
      $c->stash(results => _map_matches($json->{matches}));
      $c->stash(start_page => $page);
      $c->stash(start_index => $json->{meta}->{startIndex});

      # Emit after search hook
      $c->app->plugins->emit_hook(after_search => $c);

      # Only corpus query is set
      if ($c->stash('q') eq $query_placeholder) {
        $c->stash(q => '');
        $c->req->query_params->remove('q');
        $c->req->query_params->remove('count');
        return $c->render(
          $c->loc('Template_intro', 'intro'),
          robots => 'index,follow'
        );
      };

      # Render result
      return $c->render(template => 'search');
    }

      # Deal with errors
  )->catch(
    sub {
      my $err_msg = shift;

      # Only raised in case of connection errors
      if ($err_msg) {
        $c->notify(error => { src => 'Backend' } => $err_msg)
      };

      $c->app->log->debug("Receiving cached promised failure");

      # $c->_notify_on_errors(shift);
      return $c->render(
        status => 400,
        template => 'failure'
      );
    }
  )

  # Start IOLoop
  ->wait;

  return 1;
};


# Corpus info endpoint
# This replaces the collections endpoint
sub corpus_info {
  my $c = shift;

  # Input validation
  my $v = $c->validation;
  $v->optional('cq');

  my $url = Mojo::URL->new($c->korap->api);

  # Use hash slice to create path
  $url->path('statistics');

  # Add query
  my $cq = $v->param('cq');
  $url->query({cq => $cq}) if $cq;

  $c->app->log->debug("Statistics info: $url");

  # Async
  $c->render_later;

  $c->res->headers->header('X-Robots', 'noindex');

  # Request koral, maybe cached
  $c->cached_koral_p('get', $url)

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


# Text info endpoint
sub text_info {
  my $c = shift;

  # Input validation
  my $v = $c->validation;
  $v->optional('fields');

  my %query = (fields => '@all');
  $query{fields} = $v->param('fields') if $v->param('fields');

  my $url = Mojo::URL->new($c->korap->api);

  # Use hash slice to create path
  $url->path(
    join('/', (
      'corpus',
      $c->stash('corpus_id'),
      $c->stash('doc_id'),
      $c->stash('text_id')
    ))
  );
  $url->query(%query);

  # Async
  $c->render_later;

  # Request koral, maybe cached
  $c->cached_koral_p('get', $url)

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


# Match info endpoint
sub match_info {
  my $c = shift;

  $c->res->headers->header('X-Robots', 'noindex');

  # Validate user input
  my $v = $c->validation;
  $v->optional('foundry');
  $v->optional('layer');
  $v->optional('spans')->in(qw/true false/);

  # Check validation
  if ($v->has_error) {

    # Create error notifications
    foreach my $failed_field (@{$v->failed}) {
      $c->notify(error => 'Parameter ' . quote($failed_field) . ' invalid');
    };

    return $c->respond_to(
      html => sub {
        shift->render(
          status => 400,
          template => 'failure'
        );
      },
      any => sub {
        my $c = shift;
        $c->render(
          status => 400,
          json => $c->notifications('json')
        );
      }
    );
  };

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
      $c->stash('match_id')
    ))
  );

  # Set query parameters in order
  $url->query(map { $_ => $query{$_}} sort keys %query);

  $c->render_later;

  $c->cached_koral_p('get', $url)->then(
    sub {
      my $json = shift;

      # Process results
      $json = _map_match($json);
      $c->stash(results => $json);

      return $c->respond_to(
        html => sub {
          my $c = shift;
          return $c->render(
            status => 200,
            template => 'match_info'
          );
        },
        any => sub {
          my $c = shift;
          return $c->render(
            json => $c->notifications(json => $json),
            status => 200
          );
        }
      );
    }
  )

  # Deal with errors
  ->catch(
    sub {
      my $err_msg = shift;

      # Only raised in case of connection errors
      if ($err_msg) {
        $c->notify(error => { src => 'Backend' } => $err_msg)
      };

      unless ($c->stash('status')) {
        $c->stash(status => 400);
      };

      $c->app->log->debug("Receiving cached promised failure");

      return $c->respond_to(
        html => sub {
          shift->render(
            template => 'failure'
          );
        },
        any => sub {
          my $c = shift;
          $c->render(
            json => $c->notifications('json')
          );
        }
      );
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

  if ($match->{fields}) {
    _flatten_fields($match->{fields}, $match);
  };

  # Legacy match id
  if ($match->{matchID}) {
    $match->{matchID} =~ s/^match\-(?:[^!]+!|[^_]+_)[^\.]+?\..+?-([pc]\d)/$1/ or
      $match->{matchID} =~ s!^match\-(?:[^\/]+\/){2}.+?-([pc]\d)!$1!;
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


# Flatten requested field objects
sub _flatten_fields {
  my $fields_obj = shift;
  my $flat_fields = shift // {};

  return $flat_fields if ref $fields_obj ne 'ARRAY';

  foreach (@{$fields_obj}) {
    next unless ref $_ ne 'HASH' || $_->{'key'};
    $flat_fields->{$_->{'key'}} //= $_->{value};
  };
  return $flat_fields;
};

1;


__END__

=pod

=encoding utf8

=head1 NAME

Kalamar::Controller::Search


=head1 DESCRIPTION

L<Kalamar::Controller::Search> is the controller class for
search related endpoints in Kalamar. Actions are released when routes
match.


=head1 METHODS

L<Kalamar::Controller::Search> inherits all methods from
L<Mojolicious::Controller> and implements the following new ones.

=head2 query

  GET /?q=Baum&ql=poliqarp

Action for all queries to the system. Returns C<HTML> only for the moment.

The following parameters are supported.


=over 2

=item B<q>

The query string. This may any query written in a supported query language.


=item B<ql>

The query language. This may be any query language supported by the system,
written as the API expects the string.


=item B<action>

May be C<inspect>. In that case, the serialized request is mirrored instead of
processed.

B<This switch is experimental and may change without warnings!>


=item B<snippet>

If set, the query is returned in the snippet view template.

B<This parameter is experimental and may change without warnings!>


=item B<cutoff>

If set, the query will be cut off after the matches.

B<This parameter is directly forwarded to the API and may not be supported in the future.>


=item B<count>

If set, the query will be only return the given number of matches,
in case the API supports it. Will fallback to the default number of matches defined
by the API or the backend.

B<This parameter is directly forwarded to the API and may not be supported in the future.>


=item B<p>

If set, the query will page to the given number of pages in the result set.
Will default to 1.

B<This parameter is directly forwarded to the API and may not be supported in the future.>

=item B<o>

If set, the matches will offset to the given match in the result set.
Will default to 0.

B<This parameter is directly forwarded to the API and may not be supported in the future.>

=item B<context>

The context of the snippets to retrieve. Defaults to C<40-t,40-t>.

B<This parameter is directly forwarded to the API and may not be supported in the future.>

=item B<cq>

The corpus query to limit the search to.

=back


=head2 corpus

  /corpus?cq=corpusSigle+%3D+%22GOE%22

Returns statistics information for a virtual corpus.

=head2 text

  /corpus/:corpus_id/:doc_id/:text_id

Returns meta data information for a specific text.


=head2 match

  /corpus/:corpus_id/:doc_id/:text_id/:match_id?foundry=*

Returns information to a match either as a C<JSON> or an C<HTML> document.
The path defines the concrete match, by corpus identifier, document identifier,
text identifier (all information as given by DeReKo), and match identifier
(essentially the position of the match in the document, including highlight information).

The following parameters are supported.


=over 2

=item B<foundry>

Expects a foundry definition for retrieved information.
If not given, returns all annotations for the match.
If given, returns only given layer information for the defined foundry.

B<This parameter is experimental and may change without warnings!>


=item B<layer>

Expects a layer definition for retrieved information.
If not given, returns all annotations for the foundry.
If given, returns only given layer information for the defined foundry.

B<This parameter is experimental and may change without warnings!>


=item B<spans>

Boolean value - either C<true> or C<false> - indicating, whether span information
(i.e. for tree structures) should be retrieved.

=back


=head1 COPYRIGHT AND LICENSE

Copyright (C) 2015-2018, L<IDS Mannheim|http://www.ids-mannheim.de/>
Author: L<Nils Diewald|http://nils-diewald.de/>

Kalamar is developed as part of the L<KorAP|http://korap.ids-mannheim.de/>
Corpus Analysis Platform at the
L<Leibniz Institute for the German Language (IDS)|http://ids-mannheim.de/>,
member of the
L<Leibniz-Gemeinschaft|http://www.leibniz-gemeinschaft.de>
and supported by the L<KobRA|http://www.kobra.tu-dortmund.de> project,
funded by the
L<Federal Ministry of Education and Research (BMBF)|http://www.bmbf.de/en/>.

Kalamar is free software published under the
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE>.

=cut
