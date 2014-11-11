package Korap::Plugin::KorapSearch;
use Mojo::Base 'Mojolicious::Plugin';
use Scalar::Util qw/blessed/;
use Mojo::JSON qw/decode_json true/;
use Mojo::ByteStream 'b';

# TODO: This will probably be an engine for M::P::Search
# cutoff has to be true or false
# TODO: Write search snippet

sub map_matches {
  return [] unless $_[0];
  [
    map {
      $_->{ID} =~ s/^match\-[^!]+![^-]+-//;
      $_->{docID} =~ s/^[^_]+_//;
      $_;
    } @{ shift() }
  ];
};

sub register {
  my ($plugin, $mojo, $param) = @_;
  $param ||= {};

  # Load parameter from Config file
  if (my $config_param = $mojo->config('KorAP')) {
    $param = { %$param, %$config_param };
  };

  my $api = $param->{'api-0.1'};

  # Create search endpoint
  $mojo->routes->add_shortcut(
    search => sub {
      # Todo: Support TRACE
      return shift->route('/search')->to('search#remote')
    }
  );

  $mojo->helper(
    search => sub {
      my $c = shift;

      # Todo: If there is no callback, return the hits object!
      my $cb = pop if ref $_[-1] && ref $_[-1] eq 'CODE';

      my %param = @_;

      # Test envronment
      if ($c->app->mode eq 'test') {
	state $json = decode_json(join(' ', <DATA>));
	$c->stash('search.count' => 10);
	$c->stash('search.startPage' => 1);
	$c->stash('search.totalResults' => 666);
	$c->stash('search.itemsPerPage' => 10);
	$c->stash('search.bm.hit' => 20);
	$c->stash('search.bm.result' => 10);
	$c->stash('search.query' => $json->{request}->{query});
	$c->stash('search.hits' => map_matches $json->{matches});
	return $cb->();
      };

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

      my $query = $param{query}   // scalar $c->param('q');
      my $cutoff = $param{cutoff} // scalar $c->param('cutoff') // undef;

      return '' unless $query;

      # Get stash information
      my $count = $c->stash('search.count');
      my $start_page = $c->stash('search.startPage');

      foreach ($start_page, $count) {
	$_ = undef if (!$_ || $_ !~ /^\d+$/);
      };

      my $url = Mojo::URL->new($api);

      if ($c->stash('corpus_id')) {
	$url->path('corpus/' . $c->stash('corpus_id') . '/search');
      }
      elsif ($c->stash('collection_id')) {
	$url->path('virtualcollection/' . $c->stash('collection_id') . '/search');
      }
      else {
	$url->path('search');
      };

      #if ($c->stash('resource')) {
      #$url->path($c->stash('resource'));
      #if ($c->stash('cid')) {
      #$url->path($c->stash('cid'));
      #};
      #};

      my %query = (q => $query);
      $query{ql} = scalar $c->param('ql') // 'poliqarp';
      $query{count} = $count if $count;
      $query{cutoff} = 'true' if $cutoff;

      $url->query(\%query);
      my $cache_url = $url->to_string;

      $url->query({context => 'paragraph'});

      # Check cache for total results
      my $total_results = $c->chi->get('total-' . $cache_url);
      if (defined $total_results) {
	$c->stash('search.totalResults' => $total_results);
	$c->app->log->debug('Get total result from cache');

	# Set cutoff unless already set
	$url->query({cutoff => 'true'}) unless defined $cutoff;
      }
      else {
	$c->stash('search.totalResults' => 0);
      };

      $url->query({page => $start_page});

      $c->stash('search.itemsPerPage' => $count);

      $c->stash('search.apirequest' => $url->to_string);

      my $ua = Mojo::UserAgent->new;

      # Blocking request
      # TODO: Make non-blocking
      my $tx = $ua->get($url);

      if (my $e = $tx->error) {
	$c->notify(error => ($e->{code} ? $e->{code} . ': ' : '') .
		     $e->{message} . ' (remote)');
	return;
      };

      # Request successful
      if (my $res = $tx->success) {

	$c->stash('search.apiresponse' => $res->body);

	my $json = $res->json;

	# Reformat benchmark counter
	my $benchmark = $json->{benchmark};
	if ($benchmark && $benchmark =~ s/\s+(m)?s$//) {
	  $benchmark = sprintf("%.2f", $benchmark) . ($1 ? $1 : '') . 's';
	};

	for ($c->stash) {
	  $_->{'search.benchmark'}    = $benchmark;
	  $_->{'search.itemsPerPage'} = $json->{itemsPerPage};
	  $_->{'search.timeExceeded'} = ($json->{timeExceeded} &&
					 $json->{timeExceeded}
					   eq Mojo::JSON::true) ? 1 : 0;
	  $_->{'search.query'}        = $json->{request}->{query};
	  $_->{'search.hits'}         = map_matches($json->{matches});
	};

	# Learn results
	unless ($total_results) {
	  if ($json->{totalResults} && $json->{totalResults} > -1) {
	    $c->app->log->debug('Cache total result');
	    $c->chi->set('total-' . $cache_url => $json->{totalResults}, '120min');
	  };
	  $c->stash('search.totalResults' => $json->{totalResults});
	};

	if ($json->{warning}) {
	  $c->notify(warn => $json->{warning});
	};

	# Check for error
	$plugin->_notify_on_error($c, 0, $res, $json);
      }

      # Request failed
      else {
	$plugin->_notify_on_error($c, 1, $tx->res);
      };

      # Run embedded template
      my $v = $cb->();

      # Delete useless stash keys
      foreach (qw/hits totalResults benchmark itemsPerPage error query/) {
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

sub _notify_on_error {
  my ($self, $c, $failure, $res) = @_;
  my $json = $res;

  my $log = $c->app->log;

  if (blessed $res) {
    if (blessed $res ne 'Mojo::JSON') {
      $json = $res->json;
    };
  }
  else {
    $json = undef;
  };

  if ($json) {
    if ($json->{error}) {
      $c->notify(error => $json->{error});
      return;
    }

    # New error messages
    elsif ($json->{errstr}) {
      $c->notify(error => $json->{errstr});
      return;
    }

    # policy service error messages
    elsif ($json->{status}) {
      $c->notify(error => 'Middleware error ' . $json->{status});
      return;
    };
  };

  if ($failure) {
    $c->notify(error => (
      ($res->{code}    ? $res->{code} . ': ' : '') .
      ($res->{message} ? $res->{message}     : 'Unknown error') .
      ' (remote)'
    ));
  };
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
