package Korap::Plugin::KorapSearch;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::JSON qw/decode_json/;
use Mojo::ByteStream 'b';

# TODO: This will probably be an engine for M::P::Search
# cutoff has to be true or false

sub register {
  my ($plugin, $mojo, $param) = @_;
  $param ||= {};

  # Load parameter from Config file
  if (my $config_param = $mojo->config('KorAP')) {
    $param = { %$param, %$config_param };
  };

  my $api = $param->{api};

  $mojo->helper(
    search => sub {
      my $c = shift;

      # Todo: If there is no callback, return the hits object!
      my $cb = pop if ref $_[-1] && ref $_[-1] eq 'CODE';

      my %param = @_;

      # Test envronment
#      if ($c->app->mode eq 'test') {
#	my $json = b(join(' ', <DATA>))->encode;
#	$json = decode_json($json);
#
#	$c->stash('search.count' => 10);
#	$c->stash('search.startPage' => 1);
#	$c->stash('search.totalResults' => 666);
#	$c->stash('search.itemsPerPage' => 10);
#	$_->{'search.bm.hit'} = 20;
#	$_->{'search.bm.result'} = 10;
#	$_->{'search.query'} = $json->{request}->{query};
#	$_->{'search.hits'} = $json->{matches};
#	return $cb->();
#      };


      $c->stash(
	'search.count' =>
	  delete($param{count}) //
	    scalar($c->param('count')) //
	      $param->{count}
	    );

      $c->stash('search.startPage' =>
		  (delete($param{startPage}) //
		     scalar $c->param('p') //
		       1
		     ));

      my $query = $param{query} // scalar $c->param('q');

      return '' unless $query;

      # Get stash information
      my $count = $c->stash('search.count');
      my $start_page = $c->stash('search.startPage');

      foreach ($start_page, $count) {
	$_ = undef if (!$_ || $_ !~ /^\d+$/);
      };

      my $url = Mojo::URL->new($api);
      $url->path('resource/search');
      #if ($c->stash('resource')) {
      #$url->path($c->stash('resource'));
      #if ($c->stash('cid')) {
      #$url->path($c->stash('cid'));
      #};
      #};

      my %query = (q => $query);
      $query{ql} = scalar $c->param('ql') // 'poliqarp';
      $query{count} = $count if $count;

      $url->query(\%query);
      my $cache_url = $url->to_string;

      $url->query({ctx => 'paragraph'});

      # Check cache for total results
      my $total_results = $c->chi->get('total-' . $cache_url);
      if (defined $total_results) {
	$c->stash('search.totalResults' => $total_results);
	$c->app->log->warn('Get total result from cache');
	$url->query({cutoff => 'true'});
	$url->query({cutOff => 'true'});
      }
      else {
	$c->stash('search.totalResults' => 0);
      };

      $url->query({page => $start_page});

      $c->stash('search.itemsPerPage' => $count);

      my $ua = Mojo::UserAgent->new($url);
      $c->app->log->debug($url->to_string);

      $c->app->log->debug("Start tx");

      # Blocking request
      # TODO: Make non-blocking
      my $tx = $ua->get($url);

      if (my $e = $tx->error) {
	$c->notify(error => $e->{code} . ': ' . $e->{message} . ' (remote)');
	return;
      };

      # Request successful
      if (my $res = $tx->success) {
	my $json = $res->json;

	# Reformat benchmark counter
	my $b_hit    = $json->{benchmarkHitCounter};
	my $b_search = $json->{benchmarkSearchResults};
	if ($b_hit =~ s/\s+(m)?s$//) {
	  $b_hit = sprintf("%.2f", $b_hit) . ($1 ? $1 : '') . 's';
	};
	if ($b_search =~ s/\s+(m)?s$//) {
	  $b_search = sprintf("%.2f", $b_search) . ($1 ? $1 : '') . 's';
	};

	for ($c->stash) {
	  $_->{'search.bm.hit'}       = $b_hit;
	  $_->{'search.bm.result'}    = $b_search;
	  $_->{'search.itemsPerPage'} = $json->{itemsPerPage};
	  $_->{'search.query'}        = $json->{request}->{query};
	  $_->{'search.hits'}         = $json->{matches};
	};

	if ($json->{totalResults} > -1) {
	  $c->app->log->warn('Set total result from cache');
	  $c->stash('search.totalResults' => $json->{totalResults});
	  $c->chi->set('total-' . $cache_url => $json->{totalResults}, '30min');
	};

	if ($json->{error}) {
	  $c->notify('error' => $json->{error});
	};
      }

      # Request failed
      else {
	my $res = $tx->res;
	$c->notify('error' =>  $res->{code} . ': ' . $res->{message} . ' (remote)');
      };

      # Run embedded template
      my $v = $cb->();

      # Delete useless stash keys
      foreach (qw/hits totalResults bm.hit bm.result itemsPerPage error query/) {
	delete $c->stash->{'search.' . $_};
      };
      return $v;
    }
  );


  # Establish 'search_hits' helper
  $mojo->helper(
    search_hits => sub {
      my $c = shift;
      my $cb = pop;

      if (!ref $cb || !(ref $cb eq 'CODE')) {
	$mojo->log->error("search_hits expects a code block");
	return '';
      };

      my $hits = delete $c->stash->{'search.hits'};
      my $string;

      # Iterate over all hits
      foreach (@$hits) {
	local $_ = $_;
	$c->stash('search.hit' => $_);
	$string .= $cb->($_);
      };

      # Delete unnecessary stash values
      delete $c->stash->{'search.hit'};
      return b($string || '');
    }
  );
};


1;

__DATA__
{
  "query" : "tokens:mate/l:baum",
  "matches" : [ {
    "author" : "Peter200,Srittau,AHoerstemeier",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Palm Beach Gardens",
    "foundries" : "corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 xip xip/morpho xip/constituency xip/dependency treetagger treetagger/morpho connexor connexor/morpho connexor/syntax connexor/phrase mate mate/morpho mate/dependency opennlp opennlp/morpho base base/sentences base/paragraphs",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_PPP.00430",
    "snippet" : "<span class=\"context-left\">MacArtur stellte sich die StraÃŸen der Stadt links und rechts gesÃ¤Ã¼mt mit Blumen und </span><span class=\"match\">BÃ¤umen</span><span class=\"context-right\"> vor. Millionen von USD wurden dafÃ¼r verwendet um dies zu ermÃ¶glichen. Letztlich wurde an allen StraÃŸen und WasserstraÃŸen mÃ¤chtige Kiefern und andere schattenspendende LaubbÃ¤ume gepflanzt. Da er ein Naturliebhaber war, mussten alle Ã¤lteren BÃ¤ume stehen bleiben und StraÃŸen darum herum gefÃ¼hrt werden. FÃ¼r die damalige Zeit fÃ¼r Amerika eine total neue Erfahrung. Dies verteuerte das Bauvorhaben erheblich, aber MacArthur lieÃŸ sich nicht beirren. Ebenso waren die ersten GebÃ¤ude, die gebaut wurden, Kirchen der verschiedensten Konfessionen, um sicher zu stellen, dass jeder Mensch nach seinem Glauben leben konnte.</span>",
    "ID" : "match-WPD!WPD_PPP.00430-p189-190",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Peter200,Srittau,AHoerstemeier",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Palm Beach Gardens",
    "foundries" : "corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 xip xip/morpho xip/constituency xip/dependency treetagger treetagger/morpho connexor connexor/morpho connexor/syntax connexor/phrase mate mate/morpho mate/dependency opennlp opennlp/morpho base base/sentences base/paragraphs",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_PPP.00430",
    "snippet" : "<span class=\"context-left\">MacArtur stellte sich die StraÃŸen der Stadt links und rechts gesÃ¤Ã¼mt mit Blumen und BÃ¤umen vor. Millionen von USD wurden dafÃ¼r verwendet um dies zu ermÃ¶glichen. Letztlich wurde an allen StraÃŸen und WasserstraÃŸen mÃ¤chtige Kiefern und andere schattenspendende LaubbÃ¤ume gepflanzt. Da er ein Naturliebhaber war, mussten alle Ã¤lteren </span><span class=\"match\">BÃ¤ume</span><span class=\"context-right\"> stehen bleiben und StraÃŸen darum herum gefÃ¼hrt werden. FÃ¼r die damalige Zeit fÃ¼r Amerika eine total neue Erfahrung. Dies verteuerte das Bauvorhaben erheblich, aber MacArthur lieÃŸ sich nicht beirren. Ebenso waren die ersten GebÃ¤ude, die gebaut wurden, Kirchen der verschiedensten Konfessionen, um sicher zu stellen, dass jeder Mensch nach seinem Glauben leben konnte.</span>",
    "ID" : "match-WPD!WPD_PPP.00430-p223-224",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Kdwnv,Doc Sleeve,Ninjamask",
    "textClass" : "kultur film",
    "corpusID" : "WPD",
    "title" : "Mein Nachbar Totoro",
    "foundries" : "opennlp opennlp/morpho treetagger treetagger/morpho xip xip/morpho xip/constituency xip/dependency connexor connexor/morpho connexor/syntax connexor/phrase corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 base base/sentences base/paragraphs mate mate/morpho mate/dependency",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_MMM.04644",
    "snippet" : "<span class=\"context-left\">Ein Vater zieht mit seinen zwei TÃ¶chtern aufs Land, um in der NÃ¤he seiner Frau sein zu kÃ¶nnen, die sich in einem Hospital von einer schweren Krankheit erholt. Nachdem sich die drei in dem anfangs etwas gruseligen Haus eingewÃ¶hnt haben, begegnet das jÃ¼ngere MÃ¤dchen dem </span><span class=\"match\">Baum-</span><span class=\"context-right\"> und Naturgeist Totoro, und beide MÃ¤dchen schlieÃŸen mit dem seltsamen Wesen schnell Freundschaft. Als sich das kleine MÃ¤dchen schlieÃŸlich alleine aufmacht, um seine Mutter zu besuchen, hilft Totoro der Ã¤lteren Schwester, die AusreiÃŸerin wieder zu finden...</span>",
    "ID" : "match-WPD!WPD_MMM.04644-p94-95",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Nordelch,0",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Norra Kvill Nationalpark",
    "foundries" : "mate mate/morpho mate/dependency base base/sentences base/paragraphs opennlp opennlp/morpho treetagger treetagger/morpho xip xip/morpho xip/constituency xip/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 connexor connexor/morpho connexor/syntax connexor/phrase",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_NNN.05211",
    "snippet" : "<span class=\"context-left\">Norra Kvill ist ein schwedischer Nationalpark der aus einem urwaldartigen Nadelwald im Hochland von SmÃ¥land besteht. Seit Ã¼ber 150 Jahren wurde hier kein </span><span class=\"match\">Baum</span><span class=\"context-right\"> gefÃ¤llt und manche Kiefern sind 350 Jahre alt, 35 m hoch und haben einen Umfang von 250 cm. Der wildnisartige Charakter entsteht durch umgefallene BÃ¤ume und gigantische SteinblÃ¶cke. Am Waldboden existiert eine reichhaltige Flora. 1986 wurde die FlÃ¤che des Nationalparks erweitert.</span>",
    "ID" : "match-WPD!WPD_NNN.05211-p23-24",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Nordelch,0",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Norra Kvill Nationalpark",
    "foundries" : "mate mate/morpho mate/dependency base base/sentences base/paragraphs opennlp opennlp/morpho treetagger treetagger/morpho xip xip/morpho xip/constituency xip/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 connexor connexor/morpho connexor/syntax connexor/phrase",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_NNN.05211",
    "snippet" : "<span class=\"context-left\">Norra Kvill ist ein schwedischer Nationalpark der aus einem urwaldartigen Nadelwald im Hochland von SmÃ¥land besteht. Seit Ã¼ber 150 Jahren wurde hier kein Baum gefÃ¤llt und manche Kiefern sind 350 Jahre alt, 35 m hoch und haben einen Umfang von 250 cm. Der wildnisartige Charakter entsteht durch umgefallene </span><span class=\"match\">BÃ¤ume</span><span class=\"context-right\"> und gigantische SteinblÃ¶cke. Am Waldboden existiert eine reichhaltige Flora. 1986 wurde die FlÃ¤che des Nationalparks erweitert.</span>",
    "ID" : "match-WPD!WPD_NNN.05211-p48-49",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Vith-gilles,Head,Srbauer",
    "textClass" : "wissenschaft populaerwissenschaft freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Rheindahlen",
    "foundries" : "opennlp opennlp/morpho base base/sentences base/paragraphs xip xip/morpho xip/constituency xip/dependency treetagger treetagger/morpho mate mate/morpho mate/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 connexor connexor/morpho connexor/syntax connexor/phrase",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_RRR.04289",
    "snippet" : "<span class=\"context-left\">Der Stadtteil Rheindahlen besteht aus folgenden Honschaften: Bau, </span><span class=\"match\">Baum</span><span class=\"context-right\">, Broich, Dorthausen, Eickelnberg, Gatzweiler, Genhausen, Genhodder, Genholland, GenhÃ¼lsen, Gerkerath, GerkerathmÃ¼hle, Gerkerathwinkel, Griesbarth, Grotherath, GÃ¼nhoven, Herdt, Hilderath, Knoor, Koch, Kothausen, Mennrath, Mennrathheide, Mennrathschmidt, Merreter, Peel, Saas, Schriefers, SchriefersmÃ¼hle, Sittard, Sittardheide, Viehstrasse, Voosen, Wolfsittard, Woof, WyenhÃ¼tte und Rheindahlen.</span>",
    "ID" : "match-WPD!WPD_RRR.04289-p99-100",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "OTTO.R.M.,Factumquintus,Necrophorus",
    "textClass" : "wissenschaft populaerwissenschaft",
    "corpusID" : "WPD",
    "title" : "ChamÃ¤leons",
    "foundries" : "base base/sentences base/paragraphs opennlp opennlp/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency treetagger treetagger/morpho connexor connexor/morpho connexor/syntax connexor/phrase xip xip/morpho xip/constituency xip/dependency",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_CCC.02337",
    "snippet" : "<span class=\"context-left\">Sie sind </span><span class=\"match\">baum-</span><span class=\"context-right\"> oder strauchbewohnende, und zum Teil auch Erdbewohnende Echsen mit einem seitlich abgeflachten Rumpf. Ein charakteristisches Merkmal dieser Tiere ist die herausschleuderbare Zunge, der Schwanz, der eingerollt werden kann und die Augen, die sich unabhÃ¤ngig voneinander bewegen und gemeinsam ein Blickfeld von 342Â° ermÃ¶glichen.</span>",
    "ID" : "match-WPD!WPD_CCC.02337-p37-38",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "ErikDunsing,Raymond,NiKo",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Moerser Schloss",
    "foundries" : "treetagger treetagger/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 connexor connexor/morpho connexor/syntax connexor/phrase xip xip/morpho xip/constituency xip/dependency mate mate/morpho mate/dependency opennlp opennlp/morpho base base/sentences base/paragraphs",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_MMM.08381",
    "snippet" : "<span class=\"context-left\">Der Ã¶stliche Teil des Schlosses wurde abgerissen und eine WindmÃ¼hle sowie ein Wohnhaus sollten dort gebaut werden. Durch Probleme der BesitzverhÃ¤ltnisse der zum Schlosskauf gehÃ¶renden GrundstÃ¼cke wurde es 1810 wieder weiterverkauft. Der Textilunternehmer Witgens, welcher der bedeutendste Unternehmer in Moers war, kaufte es fÃ¼r 2000 Franc. Er hatte schon zuvor in die Ã¶stlich des Schlosses gelegenen GebÃ¤ude Wohnhaus und Fabrik gebaut. Die inneren Festungsanlagen wurden abgerissen und mit </span><span class=\"match\">BÃ¤umen</span><span class=\"context-right\"> bepflanzt. Teile des SchlossgrundstÃ¼ckes wurden verkauft und von den neuen Besitzern in GÃ¤rten und Parkanlagen umgewandelt. Witgens lieÃŸ die mit GrÃ¤ben durchzogene Wildnis 1838 in den heutigen Schlosspark umbauen. Das Schloss und der Park gingen 1905 in die Hand der Stadt Ã¼ber, die sie heute noch besitzt.</span>",
    "ID" : "match-WPD!WPD_MMM.08381-p1449-1450",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "ErikDunsing,Raymond,NiKo",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Moerser Schloss",
    "foundries" : "treetagger treetagger/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 connexor connexor/morpho connexor/syntax connexor/phrase xip xip/morpho xip/constituency xip/dependency mate mate/morpho mate/dependency opennlp opennlp/morpho base base/sentences base/paragraphs",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_MMM.08381",
    "snippet" : "<span class=\"context-left\">Seit der Schleifung der Festungsanlagen durch Friedrich den GroÃŸen im Jahre 1762 waren die Festungsinsel und die einstigen SteinwÃ¤lle und GrÃ¤ben immer mehr verkommen. DorngestrÃ¼pp wucherte Ã¼ber der verfallenen Insel und der Moerser BÃ¼rger mied es, dort entlang zu wandern. Nur vereinzelte Ziegenherden, die anspruchslos genug waren, wurden zum Grasen in die Wildnis geschickt. Wintgens, der den grÃ¶ÃŸten Teil der Anlage bereits gekauft hatte, lieÃŸ die Wildnis in einen Schlosspark, den heutigen Stadtpark, umbauen. Eigens zu diesem Zwecke lieÃŸ er den Hofarchitekten Maximilian Weyhe aus DÃ¼sseldorf kommen. Dieser hatte schon einige bedeutende Parkanlagen gestaltet, sein Abbild ist heute auf einer Bronzeplatte im Stadtpark verewigt. Weyhe wollte aber keinen Park in barocken geometrischen Formen bauen. Der Geschmack der Zeit war viel mehr hin zum Naturpark gewandert. Man legte Wert auf runde Formen, wilde freie </span><span class=\"match\">BÃ¤ume</span><span class=\"context-right\"> und groÃŸe Steine im Park. Alles sollte natÃ¼rlich wirken und nicht mit dem Zeichenbrett konstruiert. Weyhe lieÃŸ sogar eine betrÃ¤chtliche Anzahl an exotischen BÃ¤umen pflanzen. Interessant ist auch, dass er eine Turmruine anlegen lieÃŸ, da dies zu dieser Zeit als &quot;schick&quot; im Garten galt (genau wie SÃ¤ulen oder Ã„hnliches). Auch wurden die WasserlÃ¤ufe gekonnt in die Anlage integriert, und auf den einstigen VerteidigungswÃ¤llen und DÃ¤mmen wurden Wege angelegt, die der Moerser BÃ¼rger heute noch gerne fÃ¼r einen Spaziergang durch den wunderbaren Park nutzt. Erstmals konnte der BÃ¼rger den Park jedoch im Jahre 1905 betreten, denn in diesem Jahre fiel der Besitz des Schlosses und des Parks in die HÃ¤nde der Stadt Moers.</span>",
    "ID" : "match-WPD!WPD_MMM.08381-p2076-2077",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "ErikDunsing,Raymond,NiKo",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Moerser Schloss",
    "foundries" : "treetagger treetagger/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 connexor connexor/morpho connexor/syntax connexor/phrase xip xip/morpho xip/constituency xip/dependency mate mate/morpho mate/dependency opennlp opennlp/morpho base base/sentences base/paragraphs",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_MMM.08381",
    "snippet" : "<span class=\"context-left\">Seit der Schleifung der Festungsanlagen durch Friedrich den GroÃŸen im Jahre 1762 waren die Festungsinsel und die einstigen SteinwÃ¤lle und GrÃ¤ben immer mehr verkommen. DorngestrÃ¼pp wucherte Ã¼ber der verfallenen Insel und der Moerser BÃ¼rger mied es, dort entlang zu wandern. Nur vereinzelte Ziegenherden, die anspruchslos genug waren, wurden zum Grasen in die Wildnis geschickt. Wintgens, der den grÃ¶ÃŸten Teil der Anlage bereits gekauft hatte, lieÃŸ die Wildnis in einen Schlosspark, den heutigen Stadtpark, umbauen. Eigens zu diesem Zwecke lieÃŸ er den Hofarchitekten Maximilian Weyhe aus DÃ¼sseldorf kommen. Dieser hatte schon einige bedeutende Parkanlagen gestaltet, sein Abbild ist heute auf einer Bronzeplatte im Stadtpark verewigt. Weyhe wollte aber keinen Park in barocken geometrischen Formen bauen. Der Geschmack der Zeit war viel mehr hin zum Naturpark gewandert. Man legte Wert auf runde Formen, wilde freie BÃ¤ume und groÃŸe Steine im Park. Alles sollte natÃ¼rlich wirken und nicht mit dem Zeichenbrett konstruiert. Weyhe lieÃŸ sogar eine betrÃ¤chtliche Anzahl an exotischen </span><span class=\"match\">BÃ¤umen</span><span class=\"context-right\"> pflanzen. Interessant ist auch, dass er eine Turmruine anlegen lieÃŸ, da dies zu dieser Zeit als &quot;schick&quot; im Garten galt (genau wie SÃ¤ulen oder Ã„hnliches). Auch wurden die WasserlÃ¤ufe gekonnt in die Anlage integriert, und auf den einstigen VerteidigungswÃ¤llen und DÃ¤mmen wurden Wege angelegt, die der Moerser BÃ¼rger heute noch gerne fÃ¼r einen Spaziergang durch den wunderbaren Park nutzt. Erstmals konnte der BÃ¼rger den Park jedoch im Jahre 1905 betreten, denn in diesem Jahre fiel der Besitz des Schlosses und des Parks in die HÃ¤nde der Stadt Moers.</span>",
    "ID" : "match-WPD!WPD_MMM.08381-p2100-2101",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Gabor,Asb,ChristophDemmer",
    "textClass" : "wissenschaft populaerwissenschaft",
    "corpusID" : "WPD",
    "title" : "Ramismus",
    "foundries" : "corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 base base/sentences base/paragraphs opennlp opennlp/morpho treetagger treetagger/morpho mate mate/morpho mate/dependency xip xip/morpho xip/constituency xip/dependency connexor connexor/morpho connexor/syntax connexor/phrase",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_RRR.00717",
    "snippet" : "<span class=\"context-left\">Siehe auch: Ramifizierung, Ramifikation, Organon, Kategorienlehre, </span><span class=\"match\">Baum</span><span class=\"context-right\"> des Wissens, Arbor porphyriana, Philippismus, Neuaristotelismus, Melanchthonismus, Calvinismus, Reformation</span>",
    "ID" : "match-WPD!WPD_RRR.00717-p159-160",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Martin-vogel,Sybilla,Gorgodon",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Khasi",
    "foundries" : "base base/sentences base/paragraphs connexor connexor/morpho connexor/syntax connexor/phrase opennlp opennlp/morpho xip xip/morpho xip/constituency xip/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency treetagger treetagger/morpho",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_KKK.03618",
    "snippet" : "<span class=\"context-left\">nur alleinstehende </span><span class=\"match\">BÃ¤ume</span><span class=\"context-right\"> dÃ¼rfen geschlagen werden, keine BÃ¤ume aus einem Wald heraus</span>",
    "ID" : "match-WPD!WPD_KKK.03618-p830-831",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Martin-vogel,Sybilla,Gorgodon",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Khasi",
    "foundries" : "base base/sentences base/paragraphs connexor connexor/morpho connexor/syntax connexor/phrase opennlp opennlp/morpho xip xip/morpho xip/constituency xip/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency treetagger treetagger/morpho",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_KKK.03618",
    "snippet" : "<span class=\"context-left\">nur alleinstehende BÃ¤ume dÃ¼rfen geschlagen werden, keine </span><span class=\"match\">BÃ¤ume</span><span class=\"context-right\"> aus einem Wald heraus</span>",
    "ID" : "match-WPD!WPD_KKK.03618-p835-836",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Stechlin,Orchi,Vlado",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "WaldvÃ¶glein",
    "foundries" : "xip xip/morpho xip/constituency xip/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 connexor connexor/morpho connexor/syntax connexor/phrase mate mate/morpho mate/dependency base base/sentences base/paragraphs treetagger treetagger/morpho opennlp opennlp/morpho",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_WWW.00689",
    "snippet" : "<span class=\"context-left\">Cephalanthera schaberi </span><span class=\"match\">Baum</span><span class=\"context-right\">.</span>",
    "ID" : "match-WPD!WPD_WWW.00689-p158-159",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Boris Kaiser,Plattmaster,Semon",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Unterliek",
    "foundries" : "connexor connexor/morpho connexor/syntax connexor/phrase opennlp opennlp/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency treetagger treetagger/morpho base base/sentences base/paragraphs xip xip/morpho xip/constituency xip/dependency",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_UUU.01708",
    "snippet" : "<span class=\"context-left\">Befindet sich das Unterliek an einem </span><span class=\"match\">Baum</span><span class=\"context-right\"> (z.B. beim GroÃŸsegel), spricht man auch von dem Baumliek. Dessen Spannung, d.h. der Zug, unter dem das Segeltuch im Bereich des Unterlieks steht, wird Ã¼ber den Unterliekstrecker (eine Leine) gesteuert, der am Schothorn befestigt wird. Wird der Unterliekstrecker stark durchgesetzt (d.h. viel Zug mit dieser Leine ausgeÃ¼bt), erhÃ¤lt das Unterliek ein flaches Profil (d.h. ist bei seitlichem Winddruck wenig gewÃ¶lbt).</span>",
    "ID" : "match-WPD!WPD_UUU.01708-p25-26",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Boris Kaiser,Plattmaster,Semon",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Unterliek",
    "foundries" : "connexor connexor/morpho connexor/syntax connexor/phrase opennlp opennlp/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency treetagger treetagger/morpho base base/sentences base/paragraphs xip xip/morpho xip/constituency xip/dependency",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_UUU.01708",
    "snippet" : "<span class=\"context-left\">Man kann ein Segel an einem </span><span class=\"match\">Baum</span><span class=\"context-right\"> mit losem Unterliek fahren (z.B. bei RollgroÃŸanlagen): Dann ist das Segel im Bereich des Unterlieks nur am Hals und Schothorn mit dem Baum verbunden. Oder das Unterliek ist auf seiner ganzen LÃ¤nge am Baum befestigt. Dies geschieht hÃ¤ufig, indem in das Unterliek zur Verdickung desselben ein Tau eingenÃ¤ht wird und dieses dann in eine Keep (d.h. eine Nut) im Baum eingefÃ¼hrt wird.</span>",
    "ID" : "match-WPD!WPD_UUU.01708-p92-93",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Boris Kaiser,Plattmaster,Semon",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Unterliek",
    "foundries" : "connexor connexor/morpho connexor/syntax connexor/phrase opennlp opennlp/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency treetagger treetagger/morpho base base/sentences base/paragraphs xip xip/morpho xip/constituency xip/dependency",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_UUU.01708",
    "snippet" : "<span class=\"context-left\">Man kann ein Segel an einem Baum mit losem Unterliek fahren (z.B. bei RollgroÃŸanlagen): Dann ist das Segel im Bereich des Unterlieks nur am Hals und Schothorn mit dem </span><span class=\"match\">Baum</span><span class=\"context-right\"> verbunden. Oder das Unterliek ist auf seiner ganzen LÃ¤nge am Baum befestigt. Dies geschieht hÃ¤ufig, indem in das Unterliek zur Verdickung desselben ein Tau eingenÃ¤ht wird und dieses dann in eine Keep (d.h. eine Nut) im Baum eingefÃ¼hrt wird.</span>",
    "ID" : "match-WPD!WPD_UUU.01708-p115-116",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Boris Kaiser,Plattmaster,Semon",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Unterliek",
    "foundries" : "connexor connexor/morpho connexor/syntax connexor/phrase opennlp opennlp/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency treetagger treetagger/morpho base base/sentences base/paragraphs xip xip/morpho xip/constituency xip/dependency",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_UUU.01708",
    "snippet" : "<span class=\"context-left\">Man kann ein Segel an einem Baum mit losem Unterliek fahren (z.B. bei RollgroÃŸanlagen): Dann ist das Segel im Bereich des Unterlieks nur am Hals und Schothorn mit dem Baum verbunden. Oder das Unterliek ist auf seiner ganzen LÃ¤nge am </span><span class=\"match\">Baum</span><span class=\"context-right\"> befestigt. Dies geschieht hÃ¤ufig, indem in das Unterliek zur Verdickung desselben ein Tau eingenÃ¤ht wird und dieses dann in eine Keep (d.h. eine Nut) im Baum eingefÃ¼hrt wird.</span>",
    "ID" : "match-WPD!WPD_UUU.01708-p126-127",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Boris Kaiser,Plattmaster,Semon",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Unterliek",
    "foundries" : "connexor connexor/morpho connexor/syntax connexor/phrase opennlp opennlp/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency treetagger treetagger/morpho base base/sentences base/paragraphs xip xip/morpho xip/constituency xip/dependency",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_UUU.01708",
    "snippet" : "<span class=\"context-left\">Man kann ein Segel an einem Baum mit losem Unterliek fahren (z.B. bei RollgroÃŸanlagen): Dann ist das Segel im Bereich des Unterlieks nur am Hals und Schothorn mit dem Baum verbunden. Oder das Unterliek ist auf seiner ganzen LÃ¤nge am Baum befestigt. Dies geschieht hÃ¤ufig, indem in das Unterliek zur Verdickung desselben ein Tau eingenÃ¤ht wird und dieses dann in eine Keep (d.h. eine Nut) im </span><span class=\"match\">Baum</span><span class=\"context-right\"> eingefÃ¼hrt wird.</span>",
    "ID" : "match-WPD!WPD_UUU.01708-p152-153",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Boris Kaiser,Plattmaster,Semon",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Unterliek",
    "foundries" : "connexor connexor/morpho connexor/syntax connexor/phrase opennlp opennlp/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency treetagger treetagger/morpho base base/sentences base/paragraphs xip xip/morpho xip/constituency xip/dependency",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_UUU.01708",
    "snippet" : "<span class=\"context-left\">Wird das Segel ohne </span><span class=\"match\">Baum</span><span class=\"context-right\"> gefahren (z.B: Fock oder Genua bei Amwindkursen), wird die Schot direkt am Schothorn befestigt. Die Profilierung des Unterlieks, d.h. ob es flacher oder gewÃ¶lbter ist, wird dann Ã¼ber den Zug der Schot und die Lage des Holepunktes gesteuert.</span>",
    "ID" : "match-WPD!WPD_UUU.01708-p159-160",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Crux,Vic Fontaine,BS Thurner Hof",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Ananasrenette",
    "foundries" : "connexor connexor/morpho connexor/syntax connexor/phrase base base/sentences base/paragraphs corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency treetagger treetagger/morpho xip xip/morpho xip/constituency xip/dependency opennlp opennlp/morpho",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_AAA.07202",
    "snippet" : "<span class=\"context-left\">Die FrÃ¼chte der Ananasrenette mit ihrem besonderem, sortentypischen Aroma bleiben eher klein. Sie reifen Mitte bis Ende Oktober und bleiben bei entsprechender Lagerung bis Februar genussreif. Der </span><span class=\"match\">Baum</span><span class=\"context-right\"> ist anfÃ¤llig fÃ¼r Mehltau und Obstbaumkrebs und reagiert auf trockene WitterungsverhÃ¤ltnisse mit der Ausbildung sehr kleiner, wenig aromatischer FrÃ¼chte.</span>",
    "ID" : "match-WPD!WPD_AAA.07202-p78-79",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Feinschreiber,TriebtÃ¤ter,Stefan KÃ¼hn",
    "textClass" : "sport fussball",
    "corpusID" : "WPD",
    "title" : "Anita KulcsÃ¡r",
    "foundries" : "xip xip/morpho xip/constituency xip/dependency mate mate/morpho mate/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 opennlp opennlp/morpho base base/sentences base/paragraphs connexor connexor/morpho connexor/syntax connexor/phrase treetagger treetagger/morpho",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_KKK.10701",
    "snippet" : "<span class=\"context-left\">Anita KulcsÃ¡r war am Morgen des 19. Januar 2005 von ihrer Wohnung in SukorÃ³ aus unterwegs zum Vormittagstraining nach DunaÃºjvÃ¡ros. Auf der LandstraÃŸe 6207 zwischen Velence und Pusztaszabolcs kam sie auf der glatten Fahrbahn ins Schleudern. Der Wagen kam von der StraÃŸe ab und prallte unkontrolliert gegen einen </span><span class=\"match\">Baum</span><span class=\"context-right\">. Sie starb sofort am Unfallort.</span>",
    "ID" : "match-WPD!WPD_KKK.10701-p193-194",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Franz Xaver,Rosenzweig,Naddy",
    "textClass" : "wissenschaft populaerwissenschaft",
    "corpusID" : "WPD",
    "title" : "Bussardartige",
    "foundries" : "base base/sentences base/paragraphs xip xip/morpho xip/constituency xip/dependency mate mate/morpho opennlp opennlp/morpho treetagger treetagger/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 connexor connexor/morpho connexor/syntax connexor/phrase",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_BBB.15757",
    "snippet" : "<span class=\"context-left\">Die FlugfÃ¤higkeit der Bussardartigen ist wesentlich schwerfÃ¤lliger als die der wendigen Habichte oder Falken. DafÃ¼r ist ihr KÃ¶rperbau besonders gut fÃ¼r lange GleitflÃ¼ge geeignet. AuÃŸerdem sind sie in der Wahl ihres Futters anpassungsfÃ¤hig. In der Regel werden kleine bis mittlere SÃ¤ugetiere, von manchen Arten (beispielsweise dem Seeadler (Haliaeetus)) Fische oder WasservÃ¶gel gejagt. Der sÃ¼dostasiatische Affenadler (Pithecophaga jefferyi) oder der sÃ¼damerikanische WÃ¼rgadler (Morphnus guianensis) jagen auch in </span><span class=\"match\">BÃ¤umen</span><span class=\"context-right\"> lebende Affen und VÃ¶gel.</span>",
    "ID" : "match-WPD!WPD_BBB.15757-p162-163",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Steschke,Asb,Paethon",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Kudzu (Pflanze)",
    "foundries" : "base base/sentences base/paragraphs opennlp opennlp/morpho mate mate/morpho mate/dependency connexor connexor/morpho connexor/syntax connexor/phrase xip xip/morpho xip/constituency xip/dependency treetagger treetagger/morpho corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_KKK.10525",
    "snippet" : "<span class=\"context-left\">Leider fand Kudzu im SÃ¼dosten sehr gute Wachstumsbedingungen und ohne die natÃ¼rlichen Feinde die in Japan vorkommen breitete er sich explosionsartig aus. Heute sind ca. 30.000 kmÂ² von Kudzu Ã¼berwuchert und man wird der Plage, wegen der enormen Wachstumsgeschwindigkeit von bis zu 30cm am Tag, kaum noch Herr. Die Pflanze Ã¼berwuchert in kÃ¼rzester Zeit HÃ¤user, </span><span class=\"match\">BÃ¤ume</span><span class=\"context-right\"> und alles was ihr im Weg steht. Sie kann (wenn sie nicht bekÃ¤mpft wird) innerhalb weniger Monate ein Haus komplett Ã¼berwuchern.</span>",
    "ID" : "match-WPD!WPD_KKK.10525-p136-137",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Filzstift,Alexander Sommer,TheK",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Neuseeland",
    "foundries" : "xip xip/morpho xip/constituency xip/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 mate mate/morpho mate/dependency connexor connexor/morpho connexor/syntax connexor/phrase treetagger treetagger/morpho base base/sentences base/paragraphs opennlp opennlp/morpho",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_NNN.02848",
    "snippet" : "<span class=\"context-left\">Als die EuropÃ¤er ins Land kamen, waren etwa 70 % der LandesflÃ¤che bewaldet. Mittlerweile sind noch etwa 15 % des Landes von einheimischen WÃ¤ldern bedeckt, dazu kommen weitere etwa 5 % FlÃ¤che mit schnellwachsenden importierten </span><span class=\"match\">BÃ¤umen</span><span class=\"context-right\"> wie Monterey Pine und Redwood fÃ¼r die neuseelÃ¤ndische Forstwirtschaft. Wesentliche Teile der ursprÃ¼nglichen WÃ¤lder stehen unter Naturschutz, zu guten Teilen in Nationalparks und so genannten Forest Parks.</span>",
    "ID" : "match-WPD!WPD_NNN.02848-p1139-1140",
    "pubDate" : "2005-03-28"
  } ],
  "totalResults" : 4053,
  "startIndex" : 0,
  "itemsPerPage" : 25,
  "benchmarkSearchResults" : "6.02 ms",
  "benchmarkHitCounter" : "6.795 ms",
  "error" : null,
  "request" : {
    "@context" : "http://ids-mannheim.de/ns/KorAP/json-ld/v0.1/context.jsonld",
    "query" : {
      "@type" : "korap:token",
      "wrap" : {
        "@type" : "korap:term",
        "key" : "baum",
        "layer" : "lemma",
        "match" : "match:eq"
      }
    },
    "collections" : [ {
      "@type" : "korap:meta-filter",
      "@value" : {
        "@type" : "korap:term",
        "@field" : "korap:field#corpusID",
        "@value" : "WPD"
      }
    } ],
    "meta" : {
      "startPage" : 1,
      "context" : "paragraph"
    }
  },
  "context" : "p"
}
