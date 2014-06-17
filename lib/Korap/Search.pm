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





http://10.0.10.13:8070/api/v1/resource/matchInfo?id=match-WPD!WPD_NNN.02848-p1223-1224&f=mate&l=

{"author":"Filzstift,Alexander Sommer,TheK","textClass":"freizeit-unterhaltung reisen","corpusID":"WPD","title":"Neuseeland","foundries":"xip xip/morpho xip/constituency xip/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency connexor connexor/morpho connexor/syntax connexor/phrase treetagger treetagger/morpho base base/sentences base/paragraphs opennlp opennlp/morpho","tokenization":"opennlp#tokens","field":"tokens","startMore":false,"endMore":false,"docID":"WPD_NNN.02848","snippet":"<span class=\"context-left\"></span><span class=\"match\"><span title=\"mate/l:besonders\"><span title=\"mate/p:ADV\">Besonders</span></span> <span title=\"mate/l:auffällig\"><span title=\"mate/m:degree:pos\"><span title=\"mate/p:ADJD\">auffällig</span></span></span> <span title=\"mate/l:sein\"><span title=\"mate/m:mood:ind\"><span title=\"mate/m:number:pl\"><span title=\"mate/m:person:3\"><span title=\"mate/m:tense:pres\"><span title=\"mate/p:VAFIN\">sind</span></span></span></span></span></span> <span title=\"mate/l:schließlich\"><span title=\"mate/p:ADV\">schließlich</span></span> <span title=\"mate/l:noch\"><span title=\"mate/p:ADV\">noch</span></span> <span title=\"mate/l:der\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:ART\">der</span></span></span></span></span> <span title=\"mate/l:pohutukawa\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:NE\">Pohutukawa</span></span></span></span></span> <span title=\"mate/l:und\"><span title=\"mate/p:KON\">und</span></span> <span title=\"mate/l:der\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:ART\">der</span></span></span></span></span> <span title=\"mate/l:cabbage\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:NE\">Cabbage</span></span></span></span></span> <span title=\"mate/l:tree\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:NE\"><span title=\"mate/m:case:nom\">Tree</span></span></span></span></span></span><span class=\"context-right\"></span>","ID":"match-WPD!WPD_NNN.02848-p1213-1224","pubDate":"2005-03-28","context":{"left":["token",0],"right":["token",0]}}
