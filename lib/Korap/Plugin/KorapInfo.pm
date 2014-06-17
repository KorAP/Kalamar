package Korap::Plugin::KorapInfo;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::JSON qw/decode_json/;
use Mojo::ByteStream 'b';

sub register {
  my ($plugin, $mojo, $param) = @_;
  $param ||= {};

  # Load parameter from Config file
  if (my $config_param = $mojo->config('KorAP')) {
    $param = { %$param, %$config_param };
  };

  state $json = decode_json(b(join('', <DATA>))->encode);

  my $api = $param->{api};

  # Todo: Make this recognize the user!
  $mojo->helper(
    resource_info => sub {
      my $c = shift;

      my $src = shift;

      if ($c->app->mode eq 'test') {
	if ($src eq 'collection') {
	  return $json->{collections};
	};
      };

      $src = 'VirtualCollection' if $src eq 'collection';
      $src = 'Corpus' if $src eq 'corpus';

      my $url = Mojo::URL->new($api)->path('resource/' . $src);

      my $chi = $c->chi;
      if (my $json = $chi->get($url->to_string)) {
	return $json;
      }
      elsif (my $response = $c->ua->get($url)->success) {
	my $json = $response->json;
	$c->chi->set($url->to_string => $json);
	return $json;
      };
      $c->notify(error => 'Unable to retrieve resource');
      return [];
    }
  );

  $mojo->helper(
    match_info => sub {
      my $c = shift;
      my ($corpus, $doc, $match) = @_;

      return $json->{matchInfo} if $c->app->mode eq 'test';

      my $url = Mojo::URL->new($api)->path('resource/matchInfo');
      $match = 'match-' . $corpus . '!' . $corpus . '_' . $doc . '-' . $match;
      $url->query({
	id => $match,
	f => 'mate',
	l => ''
      });

      if (my $response = $c->ua->get($url)->success) {
	return $response->json;
      };
      $c->notify(error => 'Unable to retrieve resource');
      return {};
    }
  );
};


1;

__DATA__

{
"matchInfo":

{"author":"Filzstift,Alexander Sommer,TheK","textClass":"freizeit-unterhaltung reisen","corpusID":"WPD","title":"Neuseeland","foundries":"xip xip/morpho xip/constituency xip/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency connexor connexor/morpho connexor/syntax connexor/phrase treetagger treetagger/morpho base base/sentences base/paragraphs opennlp opennlp/morpho","tokenization":"opennlp#tokens","field":"tokens","startMore":false,"endMore":false,"docID":"WPD_NNN.02848","snippet":"<span class=\"context-left\"></span><span class=\"match\"><span title=\"mate/l:besonders\"><span title=\"mate/p:ADV\">Besonders</span></span> <span title=\"mate/l:auffällig\"><span title=\"mate/m:degree:pos\"><span title=\"mate/p:ADJD\">auffällig</span></span></span> <span title=\"mate/l:sein\"><span title=\"mate/m:mood:ind\"><span title=\"mate/m:number:pl\"><span title=\"mate/m:person:3\"><span title=\"mate/m:tense:pres\"><span title=\"mate/p:VAFIN\">sind</span></span></span></span></span></span> <span title=\"mate/l:schließlich\"><span title=\"mate/p:ADV\">schließlich</span></span> <span title=\"mate/l:noch\"><span title=\"mate/p:ADV\">noch</span></span> <span title=\"mate/l:der\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:ART\">der</span></span></span></span></span> <span title=\"mate/l:pohutukawa\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:NE\">Pohutukawa</span></span></span></span></span> <span title=\"mate/l:und\"><span title=\"mate/p:KON\">und</span></span> <span title=\"mate/l:der\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:ART\">der</span></span></span></span></span> <span title=\"mate/l:cabbage\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:NE\">Cabbage</span></span></span></span></span> <span title=\"mate/l:tree\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:NE\"><span title=\"mate/m:case:nom\">Tree</span></span></span></span></span></span><span class=\"context-right\"></span>","ID":"match-WPD!WPD_NNN.02848-p1213-1224","pubDate":"2005-03-28","context":{"left":["token",0],"right":["token",0]}},


"collections" :
[{"shared":false,"id":1,"managed":true,"created":1401193381119,"stats":{"documents":196510,"tokens":51545081,"sentences":4116282,"paragraphs":2034752},"query":[{"@type":"korap:meta-filter","@value":{"@type":"korap:term","@field":"korap:field#corpusID","@value":"WPD"}}],"description":"Die freie Enzyklopädie","name":"Wikipedia","foundries":"base;corenlp;mate;mpt;opennlp;tt;xip"}]



}
