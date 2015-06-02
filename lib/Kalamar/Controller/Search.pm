package Kalamar::Controller::Search;
use Mojo::Base 'Mojolicious::Controller';


# Query the KorAP backends and render a template
sub query {
  my $c = shift;

  my $query = $c->param('q');

  # No query
  unless ($query) {
    return $c->render(template => $c->loc('template_intro', 'intro'));
  };

  # Base parameters for remote access
  my %param = (
    query_language => scalar $c->param('ql'),
    query => $query,
  );

  # May be not relevant
  my $inspect = (scalar $c->param('action') // '') eq 'inspect' ? 1 : 0;

  # Just check the serialization non-blocking
  if ($inspect) {
    $c->search->trace(
      %param => sub {
	return $c->render(template => 'query_info');
      }
    );
    return;
  };

  # Choose the snippet based on the parameter
  my $template = scalar $c->param('snippet') ? 'snippet' : 'search';

  # Search non-blocking
  $c->delay(
    sub {
      my $delay = shift;

      # Search with a callback (async)
      $c->search(
	cutoff     => scalar $c->param('cutoff'),
	count      => scalar $c->param('count'),
	start_page => scalar $c->param('p'),
	cb         => $delay->begin,
	%param
      ) if $query;

      # Search resource (async)
      $c->search->resource(
	type => 'collection',
	$delay->begin
      );
    },

    # Collected search
    sub {

      # Render to the template
      return $c->render(template => $template);
    }
  );
};


# Get information about a match
# Note: This is called 'match_info' as 'match' is reserved
sub match_info {
  my $c = shift;

  # Old API foundry/layer usage
  my $foundry = '*';
  my %query = (foundry => '*');
  if ($c->param('foundry')) {
    $query{foundry} = scalar $c->param('foundry');
    if ($c->param('layer')) {
      $query{layer} = scalar $c->param('layer');
    };
    if ($c->param('spans')) {
      $query{spans} = 'true';
    };
  };

  # Async
  $c->render_later;

  # Use the API for fetching matching information non-blocking
  $c->search->match(
    corpus_id => $c->stash('corpus_id'),
    doc_id    => $c->stash('doc_id'),
    text_id   => $c->stash('text_id'),
    match_id  => $c->stash('match_id'),
    %query,

    # Callback for async search
    sub {
      my $index = shift;
      return $c->respond_to(

	# Render json if requested
	json => sub {
	  # Add notifications to the matching json
	  # TODO: There should be a special notification engine doing that!
	  my $notes = $c->notifications(json => $index->results->[0]);
	  $c->render(json => $notes);
	},

	# Render html if requested
	html => sub {
	  return $c->render(
	    layout   => 'default',
	    template => 'match_info'
	  )
	}
      );
    }
  );
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

=back


=head2 match

  /:corpus_id/:doc_id/:text_id/:match_id?foundry=*

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

In addition to the given parameters, the following path values are expected.

=over 2

=item B<corpus_id>

The corpus sigle as defined by DeReKo.


=item B<doc_id>

The document sigle as defined by DeReKo.


=item B<text_id>

The text sigle as defined by DeReKo.


=item B<match_id>

The ID of the match, normally generated by the search backend.
This contains the span of the match in the text and possibly further
information (like highlights).

=back


=head1 COPYRIGHT AND LICENSE

Copyright (C) 2015, L<IDS Mannheim|http://www.ids-mannheim.de/>
Author: L<Nils Diewald|http://nils-diewald.de/>

Kalamar is developed as part of the L<KorAP|http://korap.ids-mannheim.de/>
Corpus Analysis Platform at the
L<Institute for the German Language (IDS)|http://ids-mannheim.de/>,
member of the
L<Leibniz-Gemeinschaft|http://www.leibniz-gemeinschaft.de/en/about-us/leibniz-competition/projekte-2011/2011-funding-line-2/>
and supported by the L<KobRA|http://www.kobra.tu-dortmund.de> project,
funded by the
L<Federal Ministry of Education and Research (BMBF)|http://www.bmbf.de/en/>.

Kalamar is free software published under the
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE>.

=cut
