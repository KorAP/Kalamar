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
    korap_match_id => sub {
      my $c = shift;
      my $match = shift;
      my $mid = $match->{ID};
      $mid =~ s/^match\-[^!]+![^-]+-//;
      return $mid // '';
    }
  );

  $mojo->helper(
    korap_doc_id => sub {
      my $c = shift;
      my $match = shift;
      my $did = $match->{docID};
      $did =~ s/^[^_]_//;
      return $did // '';
    }
  );

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
  "query" : "tokens:s:baum",
  "matches" : [ {
    "author" : "ErikDunsing,Ninjamask,Magnus",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Friedrich Wilhelm (Brandenburg)",
    "foundries" : "opennlp opennlp/morpho xip xip/morpho xip/constituency xip/dependency base base/sentences base/paragraphs mate mate/morpho mate/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 connexor connexor/morpho connexor/syntax connexor/phrase treetagger treetagger/morpho",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_WWW.04738",
    "snippet" : "<span class=\"context-left\"><span class=\"more\"></span>wurde ihm der Mirabolanen frucht und </span><span class=\"match\">baum</span><span class=\"context-right\"> &lt;Terminalia catappa L. oder Terminalia citrina<span class=\"more\"></span></span>",
    "ID" : "match-WPD!WPD_WWW.04738-p265-266",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Sk-Bot,Wiegels,Katharina",
    "textClass" : "freizeit-unterhaltung reisen",
    "corpusID" : "WPD",
    "title" : "Hans Heinrich von Wuthenau",
    "foundries" : "corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 opennlp opennlp/morpho connexor connexor/morpho connexor/syntax connexor/phrase base base/sentences base/paragraphs xip xip/morpho xip/constituency xip/dependency mate mate/morpho mate/dependency treetagger treetagger/morpho",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_WWW.07095",
    "snippet" : "<span class=\"context-left\"><span class=\"more\"></span>:Jch heisse drumb Gerad', das dieser </span><span class=\"match\">baum</span><span class=\"context-right\"> uns zeigetDas man aufrichtig sey, nichts<span class=\"more\"></span></span>",
    "ID" : "match-WPD!WPD_WWW.07095-p154-155",
    "pubDate" : "2005-03-28"
  }, {
    "author" : "Zwobot,Holdbold,WiseWoman",
    "textClass" : "kultur literatur",
    "corpusID" : "WPD",
    "title" : "Johann Rist",
    "foundries" : "mate mate/morpho mate/dependency xip xip/morpho xip/constituency xip/dependency corenlp corenlp/namedentities corenlp/namedentities/ne_dewac_175m_600 corenlp/namedentities corenlp/namedentities/ne_hgc_175m_600 treetagger treetagger/morpho connexor connexor/morpho connexor/syntax connexor/phrase opennlp opennlp/morpho base base/sentences base/paragraphs",
    "tokenization" : "opennlp#tokens",
    "field" : "tokens",
    "startMore" : true,
    "endMore" : true,
    "docID" : "WPD_RRR.05363",
    "snippet" : "<span class=\"context-left\"><span class=\"more\"></span>Emblem wird das heilige holtz der </span><span class=\"match\">baum</span><span class=\"context-right\"> Guajacum genant, fremde Brasilianische landschaft, der<span class=\"more\"></span></span>",
    "ID" : "match-WPD!WPD_RRR.05363-p373-374",
    "pubDate" : "2005-03-28"
  } ],
  "totalResults" : 3,
  "startIndex" : 0,
  "itemsPerPage" : 25,
  "benchmarkSearchResults" : "1.638 ms",
  "benchmarkHitCounter" : "4.332 ms",
  "error" : null,
  "request" : {
    "@context" : "http://ids-mannheim.de/ns/KorAP/json-ld/v0.1/context.jsonld",
    "query" : {
      "@type" : "korap:token",
      "wrap" : {
        "@type" : "korap:term",
        "key" : "baum",
        "layer" : "orth",
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
    "meta" : { }
  },
  "context" : {
    "left" : [ "token", 6 ],
    "right" : [ "token", 6 ]
  }
}
