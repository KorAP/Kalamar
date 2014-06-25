package Korap::Plugin::KorapInfo;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::JSON qw/decode_json/;
use Mojo::ByteStream 'b';

# Todo: Make the requests non-blocking

sub map_match {
  my $x = shift or return;
  $x->{ID} =~ s/^match\-[^!]+![^-]+-// if $x->{ID};
  $x->{docID} =~ s/^[^_]+_// if $x->{docID};
  $x;
};

# Register plugin
sub register {
  my ($plugin, $mojo, $param) = @_;
  $param ||= {};

  # Load parameter from Config file
  if (my $config_param = $mojo->config('KorAP')) {
    $param = { %$param, %$config_param };
  };

  # Temporary info data
  state $json = decode_json(b(join('', <DATA>))->encode);

  # Get the API endpoint
  my $api = $param->{api};

  # Todo: Make this recognize the user!
  $mojo->helper(
    resource_info => sub {
      my $c = shift;
      my $src = shift;

      # Dispatch for test mode
      if ($c->app->mode eq 'test') {
	if ($src eq 'collection') {
	  return $json->{collections};
	};
      };

      # Rename info endpoints and build URL
      $src = 'VirtualCollection' if $src eq 'collection';
      $src = 'Corpus' if $src eq 'corpus';
      my $url = Mojo::URL->new($api)->path('resource/' . $src);

      # Check for cached information
      if (my $json = $c->chi->get($url->to_string)) {
	return $json;
      }

      # Retrieve and set the cache
      elsif (my $response = $c->ua->get($url)->success) {
	my $json = $response->json;
	$c->chi->set($url->to_string => $json, '24 hours');
	return $json;
      };

      # Something went wrong
      $c->notify(error => 'Unable to retrieve resource');
      return [];
    }
  );

  $mojo->helper(
    match_info => sub {
      my $c = shift;

      return map_match($json->{matchInfo2}) if $c->app->mode eq 'test';

      my $corpus = shift;
      my $doc = shift;
      my $match = shift;

      # Build url
      my $temp_api = 'http://10.0.10.13:8070/api/v0.1/';
      my $url = Mojo::URL->new($temp_api)->path('matchInfo');

      # Build match id
      $match = 'match-' . $corpus . '!' . $corpus . '_' . $doc . '-' . $match;

      my %param = @_;
      my %query = ( id => $match );
      $query{foundry} = $param{foundry} // '*';
      $query{layer} = $param{layer} if defined $param{layer};

      # Add query
      $url->query(\%query);

      $c->app->log->debug($url);

      if (my $response = $c->ua->get($url)->success) {
	return map_match($response->json);
      };
      $c->notify(error => 'Unable to retrieve resource');
      return {};
    }
  );
};


1;

__DATA__
{
  "matchInfo": {
    "author":"Filzstift,Alexander Sommer,TheK",
    "textClass":"freizeit-unterhaltung reisen",
    "corpusID":"WPD",
    "title":"Neuseeland",
    "foundries":"xip xip/morpho xip/constituency xip/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency connexor connexor/morpho connexor/syntax connexor/phrase treetagger treetagger/morpho base base/sentences base/paragraphs opennlp opennlp/morpho",
    "tokenization":"opennlp#tokens",
    "field":"tokens",
    "startMore":false,
    "endMore":false,
    "docID":"WPD_NNN.02848",
    "snippet":"<span class=\"context-left\"></span><span class=\"match\"><span title=\"mate/l:besonders\"><span title=\"mate/p:ADV\">Besonders</span></span> <span title=\"mate/l:auffällig\"><span title=\"mate/m:degree:pos\"><span title=\"mate/p:ADJD\">auffällig</span></span></span> <span title=\"mate/l:sein\"><span title=\"mate/m:mood:ind\"><span title=\"mate/m:number:pl\"><span title=\"mate/m:person:3\"><span title=\"mate/m:tense:pres\"><span title=\"mate/p:VAFIN\">sind</span></span></span></span></span></span> <span title=\"mate/l:schließlich\"><span title=\"mate/p:ADV\">schließlich</span></span> <span title=\"mate/l:noch\"><span title=\"mate/p:ADV\">noch</span></span> <span title=\"mate/l:der\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:ART\">der</span></span></span></span></span> <span title=\"mate/l:pohutukawa\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:NE\">Pohutukawa</span></span></span></span></span> <span title=\"mate/l:und\"><span title=\"mate/p:KON\">und</span></span> <span title=\"mate/l:der\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:ART\">der</span></span></span></span></span> <span title=\"mate/l:cabbage\"><span title=\"mate/m:case:nom\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:NE\">Cabbage</span></span></span></span></span> <span title=\"mate/l:tree\"><span title=\"mate/m:gender:masc\"><span title=\"mate/m:number:sg\"><span title=\"mate/p:NE\"><span title=\"mate/m:case:nom\">Tree</span></span></span></span></span></span><span class=\"context-right\"></span>",
    "ID":"match-WPD!WPD_NNN.02848-p1213-1224",
    "pubDate":"2005-03-28",
    "context":{
      "left":["token",0],
      "right":["token",0]
    }
  },
  "collections" : [
    {
      "shared":false,
      "id":1,
      "managed":true,
      "created":1401193381119,
      "stats":{
        "documents":196510,
        "tokens":51545081,
        "sentences":4116282,
        "paragraphs":2034752
      },
      "query":[
        {
          "@type":"korap:meta-filter",
          "@value":{
            "@type":"korap:term",
            "@field":"korap:field#corpusID",
            "@value":"WPD"
          }
        }
      ],
      "description":"Die freie Enzyklopädie",
      "name":"Wikipedia",
      "foundries":"base;corenlp;mate;mpt;opennlp;tt;xip"
    }
  ],
  "matchInfo2" : {
    "author":"AHZ,AkaBot,Zwobot",
    "textClass":"freizeit-unterhaltung reisen",
    "corpusID":"WPD",
    "title":"Okres Hodonín",
    "foundries":"opennlp opennlp/morpho base base/sentences base/paragraphs mate mate/morpho mate/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 treetagger treetagger/morpho connexor connexor/morpho connexor/syntax connexor/phrase xip xip/morpho xip/constituency xip/dependency",
    "tokenization":"opennlp#tokens",
    "field":"tokens",
    "startMore":false,
    "endMore":false,
    "docID":"WPD_OOO.01534",
    "snippet":"<span class=\"context-left\"></span><span class=\"match\"><span title=\"mate/l:archlebov\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Archlebov</span></span></span></span> - <span title=\"mate/l:blatnice\"><span title=\"mate/p:FM\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Blatnice</span></span></span></span> <span title=\"mate/l:pod\"><span title=\"mate/p:FM\"><span title=\"tt/l:pod\"><span title=\"tt/p:NE\">pod</span></span></span></span> <span title=\"mate/l:svatým\"><span title=\"mate/p:FM\"><span title=\"tt/p:NE\">Svatým</span></span></span> <span title=\"mate/l:antonínkem\"><span title=\"mate/p:FM\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Antonínkem</span></span></span></span> - <span title=\"mate/l:blatni\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Blatni</span></span></span></span><span title=\"mate/l:?ka\"><span title=\"mate/p:NE\">čka</span></span> - <span title=\"mate/l:bukovany\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Bukovany</span></span></span></span> - <span title=\"mate/l:bzenec\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Bzenec</span></span></span></span> - <span title=\"mate/l:?ej\"><span title=\"mate/p:NE\">Čej</span></span>č - <span title=\"mate/l:?ejkovice\"><span title=\"mate/p:NE\">Čejkovice</span></span> - <span title=\"mate/l:?elo\"><span title=\"mate/p:NE\">Čelo</span></span><span title=\"mate/l:?nice\"><span title=\"mate/p:NE\">žnice</span></span> - <span title=\"mate/l:dambo\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Dambo</span></span></span></span><span title=\"mate/l:?ice\"><span title=\"mate/p:NE\">řice</span></span> - <span title=\"mate/l:doln\"><span title=\"mate/p:NE\">Doln</span></span><span title=\"mate/l:í\"><span title=\"mate/p:NE\">í</span></span> <span title=\"mate/l:bojanovice\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Bojanovice</span></span></span></span> - <span title=\"mate/l:domanín\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Domanín</span></span></span></span> - <span title=\"mate/l:dra\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Dra</span></span></span><span title=\"mate/p:NE\">ž</span><span title=\"mate/l:?vky\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">ůvky</span></span></span></span> - <span title=\"mate/l:dub\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Dub</span></span></span><span title=\"mate/l:?any\"><span title=\"mate/p:NE\">ňany</span></span> - <span title=\"mate/l:hodonín\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Hodonín</span></span></span> - <span title=\"mate/l:hovorany\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Hovorany</span></span></span></span> - <span title=\"mate/l:hroznová\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Hroznová</span></span></span> <span title=\"mate/l:lhota\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Lhota</span></span></span> - <span title=\"mate/l:hrubá\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Hrubá</span></span></span> <span title=\"mate/l:vrbka\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Vrbka</span></span></span> - <span title=\"mate/l:hýsly\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Hýsly</span></span></span></span> - <span title=\"mate/l:javorník\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Javorník</span></span></span></span> - <span title=\"mate/l:je\"><span title=\"mate/p:NE\"><span title=\"tt/l:Je\"><span title=\"tt/p:KOUS\">Je</span></span></span></span><span title=\"mate/l:?ov\"><span title=\"mate/p:NE\">žov</span></span> - <span title=\"mate/l:josefov\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Josefov</span></span></span> - <span title=\"mate/l:karlín\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Karlín</span></span></span></span> - <span title=\"mate/l:kel\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Kel</span></span></span><span title=\"mate/l:?any\"><span title=\"mate/p:NE\">čany</span></span> - <span title=\"mate/l:kn\"><span title=\"mate/p:NN\"><span title=\"tt/p:NE\">Kn</span></span></span>ě<span title=\"mate/l:?dub\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">ždub</span></span></span></span> - <span title=\"mate/l:kostelec\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Kostelec</span></span></span> - <span title=\"mate/l:kozojídky\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Kozojídky</span></span></span></span> - <span title=\"mate/l:ku\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Ku</span></span></span><span title=\"mate/l:?elov\"><span title=\"mate/p:NE\">želov</span></span> - <span title=\"mate/l:kyjov\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Kyjov</span></span></span> - <span title=\"mate/l:labuty\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Labuty</span></span></span></span> - <span title=\"mate/l:lipov\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Lipov</span></span></span> - <span title=\"mate/l:louka\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Louka</span></span></span> - <span title=\"mate/l:lov\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Lov</span></span></span><span title=\"mate/l:?ice\"><span title=\"mate/p:NE\">čice</span></span> - <span title=\"mate/l:lu\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/l:Lu\">Lu</span></span></span></span><span title=\"mate/l:?ice\"><span title=\"mate/p:NE\">žice</span></span> - <span title=\"mate/l:malá\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Malá</span></span></span> <span title=\"mate/l:vrbka\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Vrbka</span></span></span> - <span title=\"mate/l:mikul\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Mikul</span></span></span><span title=\"mate/l:?ice\"><span title=\"mate/p:NE\">čice</span></span> - <span title=\"mate/l:milotice\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Milotice</span></span></span></span> - <span title=\"mate/l:moravany\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Moravany</span></span></span></span> - <span title=\"mate/l:moravský\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Moravský</span></span></span> <span title=\"mate/l:písek\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Písek</span></span></span> - <span title=\"mate/l:mut\"><span title=\"mate/p:NN\"><span title=\"tt/l:Mut\"><span title=\"tt/p:NN\">Mut</span></span></span></span><span title=\"mate/l:?nice\"><span title=\"mate/p:NE\">ěnice</span></span> - <span title=\"mate/l:násedlovice\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Násedlovice</span></span></span></span> - <span title=\"mate/l:nechvalín\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Nechvalín</span></span></span></span> - <span title=\"mate/l:nenkovice\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Nenkovice</span></span></span></span> - <span title=\"mate/l:nová\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Nová</span></span></span> <span title=\"mate/l:lhota\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Lhota</span></span></span> - <span title=\"mate/l:nový\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Nový</span></span></span> <span title=\"mate/l:poddvorov\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Poddvorov</span></span></span> - <span title=\"mate/l:ostrovánky\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Ostrovánky</span></span></span></span> - <span title=\"mate/l:petrov\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Petrov</span></span></span> - <span title=\"mate/l:pru\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Pru</span></span></span><span title=\"mate/l:?ánky\"><span title=\"mate/p:NE\">šánky</span></span> - <span title=\"mate/l:rad\"><span title=\"mate/p:NE\"><span title=\"tt/l:Rad\"><span title=\"tt/p:NN\">Rad</span></span></span></span><span title=\"mate/l:?jov\"><span title=\"mate/p:NE\">ějov</span></span> - <span title=\"mate/l:ratí\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Ratí</span></span></span></span><span title=\"mate/l:?kovice\"><span title=\"mate/p:NE\">škovice</span></span> - <span title=\"mate/l:rohatec\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Rohatec</span></span></span></span> - <span title=\"mate/l:skalka\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Skalka</span></span></span> - <span title=\"mate/l:skoronice\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Skoronice</span></span></span></span> - <span title=\"mate/l:sob\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Sob</span></span></span><span title=\"mate/l:?lky\"><span title=\"mate/p:NE\">ůlky</span></span> - <span title=\"mate/l:starý\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Starý</span></span></span></span> <span title=\"mate/l:poddvorov\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Poddvorov</span></span></span> - <span title=\"mate/l:stav\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Stav</span></span></span><span title=\"mate/p:NE\">ě</span><span title=\"mate/l:?ice\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">šice</span></span></span></span> - <span title=\"mate/l:strá\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Strá</span></span></span><span title=\"mate/l:?nice\"><span title=\"mate/p:NE\">žnice</span></span> - <span title=\"mate/l:strá\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Strá</span></span></span><span title=\"mate/l:?ovice\"><span title=\"mate/p:NE\">žovice</span></span> - <span title=\"mate/l:sudom\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Sudom</span></span></span></span><span title=\"mate/p:NE\">ě</span><span title=\"mate/l:?ice\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">řice</span></span></span></span> - <span title=\"mate/l:suchov\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Suchov</span></span></span> - <span title=\"mate/l:svatobo\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Svatobo</span></span></span></span><span title=\"mate/l:?ice-mist\"><span title=\"mate/p:NE\">řice-Mist</span></span><span title=\"mate/l:?ín\"><span title=\"mate/p:NE\">řín</span></span> - <span title=\"mate/l:syrovín\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Syrovín</span></span></span></span> - <span title=\"mate/l:?ardice\"><span title=\"mate/p:NE\">Šardice</span></span> - <span title=\"mate/l:tasov\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Tasov</span></span></span></span> - <span title=\"mate/l:t?mice\"><span title=\"mate/p:NE\">Těmice</span></span> - <span title=\"mate/l:terezín\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Terezín</span></span></span> - <span title=\"mate/l:tvaro\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Tvaro</span></span></span></span><span title=\"mate/l:?ná\"><span title=\"mate/p:NE\">žná</span></span> <span title=\"mate/l:lhota\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Lhota</span></span></span> - <span title=\"mate/l:uh\"><span title=\"mate/p:NE\"><span title=\"tt/l:uh\"><span title=\"tt/p:ITJ\">Uh</span></span></span></span><span title=\"mate/l:?ice\"><span title=\"mate/p:NE\">řice</span></span> - <span title=\"mate/l:vacenovice\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Vacenovice</span></span></span></span> - <span title=\"mate/l:velká\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Velká</span></span></span> <span title=\"mate/l:nad\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/l:nad\">nad</span></span></span></span> <span title=\"mate/l:veli\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Veli</span></span></span><span title=\"mate/l:?kou\"><span title=\"mate/p:NE\">čkou</span></span> - <span title=\"mate/l:veselí\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Veselí</span></span></span> <span title=\"mate/l:nad\"><span title=\"mate/p:NE\"><span title=\"tt/l:nad\"><span title=\"tt/p:NE\">nad</span></span></span></span> <span title=\"mate/l:moravou\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\">Moravou</span></span></span> - <span title=\"mate/l:v\"><span title=\"mate/p:CARD\"><span title=\"tt/l:V\"><span title=\"tt/p:NN\">V</span></span></span></span><span title=\"mate/l:?t\"><span title=\"mate/p:XY\">ěte</span></span><span title=\"mate/l:?ov\"><span title=\"mate/p:XY\">řov</span></span> - <span title=\"mate/p:FM\"><span title=\"mate/l:vlko\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Vlko</span></span></span></span>š - <span title=\"mate/l:vnorovy\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Vnorovy</span></span></span></span> - <span title=\"mate/l:vracov\"><span title=\"mate/p:NE\"><span title=\"tt/p:NE\"><span title=\"tt/p:NN\">Vracov</span></span></span></span> - <span title=\"mate/l:v\"><span title=\"mate/p:NE\"><span title=\"tt/l:V\"><span title=\"tt/p:NN\">V</span></span></span></span><span title=\"mate/l:?esovice\"><span title=\"mate/p:NE\">řesovice</span></span> - <span title=\"mate/l:?ádovice\"><span title=\"mate/p:NE\">Žádovice</span></span> - <span title=\"mate/l:?aro\"><span title=\"mate/p:NE\">Žaro</span></span><span title=\"mate/l:?ice\"><span title=\"mate/p:NE\">šice</span></span> - <span title=\"mate/l:?dánice\"><span title=\"mate/p:NE\">Ždánice</span></span> - <span title=\"mate/l:?eletice\"><span title=\"mate/p:NE\">Želetice</span></span> - <span title=\"mate/l:?eravice\"><span title=\"mate/p:NE\">Žeravice</span></span> - <span title=\"mate/p:NE\"><span title=\"mate/l:?eraviny\">Žeraviny</span></span></span><span class=\"context-right\"></span>","ID":"match-WPD!WPD_OOO.01534-p328-462","pubDate":"2005-03-28","context":{"left":["token",0],"right":["token",0]}}
}
