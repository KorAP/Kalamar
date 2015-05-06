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
sub match_info {
  my $c = shift;

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
search related endpoints in Kalamar.


=head1 METHODS

L<Kalamar::Controller::Search> inherits all methods from
L<Mojolicious::Controller> and implements the following new ones.

=head2 search

Action for all documentation pages.

=head3 q

Query parameter

=head3 ql

Query language

=head3 action

May be C<inspect>.

=head3 snippet

=head3 cutoff

=head3 count

=head3 p

Number of page


=head2 match

/:corpus_id/:doc_id/:text_id/:match_id

=head3 foundry

=head3 layer

=head3 spans

true or false

=head3 corpus_id


stash value

=head3 doc_id

=head3 text_id

=head3 match_id


=head1 COPYRIGHT AND LICENSE

Copyright (C) 2015, L<IDS Mannheim|http://www.ids-mannheim.de/>
Author: L<Nils Diewald|http://nils-diewald.de/>

Kalamar is developed as part of the L<KorAP|http://korap.ids-mannheim.de/>
Corpus Analysis Platform at the Institute for German Language
(L<IDS|http://ids-mannheim.de/>),
funded by the
L<Leibniz-Gemeinschaft|http://www.leibniz-gemeinschaft.de/en/about-us/leibniz-competition/projekte-2011/2011-funding-line-2/>
and supported by the L<KobRA|http://www.kobra.tu-dortmund.de> project,
funded by the Federal Ministry of Education and Research
(L<BMBF|http://www.bmbf.de/en/>).

Kalamar is free software published under the
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE).

=cut
