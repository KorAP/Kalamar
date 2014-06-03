package Korap::Search;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub remote {
  my $c = shift;

  if ($c->param('action') eq 'inspect') {
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
    return $c->render(template => 'query', layout => 'default', title => 'KorAP');
  };

  # Render template "example/welcome.html.ep" with message
  $c->render(template => 'search');
};

sub info {
  my $c = shift;
  my $api = $c->config('KorAP')->{api};
  my $src = $c->stash('resource');
  $src = 'VirtualCollection' if $src eq 'collection';
  $src = 'Corpus' if $src eq 'corpus';

  my $url = Mojo::URL->new($api)->path('resource/' . $src);
  if (my $response = $c->ua->get($url)->success) {
    $c->render(json => $c->notifications(json => $response->json));
  };
};

1;


__END__

[{"id":1,"name":"Wikipedia","description":"Die freie EnzyklopÃ¤die","owner":0,"created":1401193381119,"managed":true,"shared":false,"foundries":"base;corenlp;mate;mpt;opennlp;tt;xip","refCorpus":"","query":"[{\"@type\":\"korap:meta-filter\",\"@value\":{\"@type\":\"korap:term\",\"@field\":\"korap:field#corpusID\",\"@value\":\"WPD\"}}]","cache":false,"stats":"{\"documents\":196510,\"tokens\":51545081,\"sentences\":4116282,\"paragraphs\":2034752}"}]
