package Korap::Info;
use Mojo::Base 'Mojolicious::Controller';

sub about_match {
  my $c = shift;

  my $corpus_id = $c->stash('corpus_id');
  my $doc_id    = $c->stash('doc_id');
  my $match_id  = $c->stash('match_id');

  my $foundry = '*';
  my %query = (foundry => '*');
  if ($c->stash('foundry')) {
    $query{foundry} = $c->stash('foundry');
    if ($c->stash('layer')) {
      $query{layer} = $c->stash('layer');
    };
  };

  return $c->respond_to(
    json => sub {
      $c->render(json => $c->notifications(
	json => $c->match_info($corpus_id, $doc_id, $match_id, %query))
      )
    },
    html => sub {
      my $match = $c->match_info($corpus_id, $doc_id, $match_id);
      if ($match->{error}) {
	$c->notify(error => $match->{error});
	return $c->render_exception('error');
      };

      $c->render(
	layout => 'default',
	template => 'match_info',
	match => $match
      )
    }
  );
};

# Todo: Return info for all collections
sub about_collection {
  my $c = shift;
  my $src = $c->stash('collection_id');
  if ($src) {
    $c->render(
      json => $c->notifications(
	json => $c->info_on($src)
      )
    );
  };
};

1;

__END__
