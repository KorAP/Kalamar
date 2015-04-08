package Kalamar::Controller::Search;
use Mojo::Base 'Mojolicious::Controller';

# Add X-Forwarded-For to user agent call everywhere


# Query the KorAP backends and render a template
sub query {
  my $c = shift;

  my $query = $c->param('q');

  # Base parameters for remote access
  my %param = (
    query_language => scalar $c->param('ql'),
    query => $query,
  );

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

  my $template = scalar $c->param('snippet') ? 'snippet' : 'search';

  # Search non-blocking
  $c->delay(
    sub {
      my $delay = shift;
      $c->search(
	cutoff => scalar $c->param('cutoff'),
	count => scalar $c->param('count'),
	start_page => scalar $c->param('p'),
	cb => $delay->begin,
	%param
      ) if $query;

      $c->search->resource(
	type => 'collection',
	$delay->begin
      );
    },
    sub {
      return $c->render(template => $template);
    }
  );
};


# Get informations about a match
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
