package Korap::Info;
use Mojo::Base 'Mojolicious::Controller';

sub about_match {
  my $c = shift;

  my $corpus_id = $c->stash('corpus_id');
  my $doc_id    = $c->stash('doc_id');
  my $match_id  = $c->stash('match_id');

  return $c->respond_to(
    json => sub {
      $c->render(json => $c->notifications(json => $c->match_info($corpus_id, $doc_id, $match_id)))
    },
    html => sub {
      $c->render(
	layout => 'default',
	template => 'match_info',
	match => $c->match_info($corpus_id, $doc_id, $match_id, foundry => '')
      )
    }
  );
};

1;

__END__
