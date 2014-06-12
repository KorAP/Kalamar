package Korap::Search;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub remote {
  my $c = shift;
  $c->layout('default');
  $c->title('KorAP');

  if ((scalar $c->param('action') // '') eq 'inspect') {
    my $api = $c->config('KorAP')->{api};
    my $url = Mojo::URL->new($api)->path('resource/query');
    $url->query({
      q => scalar $c->param('q') // '',
      ql => scalar $c->param('ql') // 'poliqarp'
    });
    if (my $response = $c->ua->get($url)->success) {
      $c->stash('search.query' => $response->json);
    }
    else {
      $c->notify(error => 'Unable to retrieve serialized query');
    };

    $c->param(cutoff => 1);
    return $c->render(template => 'query');
  }

  elsif ($c->param('snippet')) {
    $c->layout('snippet');
  };

  $c->render(template => 'search');
};



sub info {
  my $c = shift;
  my $api = $c->config('KorAP')->{api};
  my $src = $c->stash('resource');
  $c->render(json => $c->notifications(json => $c->info_on($src)));
};


1;


__END__

[{"shared":false,"id":1,"managed":true,"created":1401193381119,"stats":{"documents":196510,"tokens":51545081,"sentences":4116282,"paragraphs":2034752},"query":[{"@type":"korap:meta-filter","@value":{"@type":"korap:term","@field":"korap:field#corpusID","@value":"WPD"}}],"description":"Die freie Enzyklopädie","name":"Wikipedia","foundries":"base;corenlp;mate;mpt;opennlp;tt;xip"}]
