use Mojo::Base -strict;
use Test::Mojo;
use Test::More;
use Mojo::File qw/path/;
use Mojo::JSON qw'decode_json';
use Kalamar::Controller::Search;


#####################
# Start Fake server #
#####################
my $mount_point = '/realapi/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo->new('Kalamar' => {
  Localize => {
    dict => {
      title_addon => 'Test'
    }
  }
});

# Mount fake backend
# Get the fixture path
my $fixtures_path = path(Mojo::File->new(__FILE__)->dirname, 'server');
my $fake_backend = $t->app->plugin(
  Mount => {
    $mount_point =>
      $fixtures_path->child('mock.pl')
  }
);
# Configure fake backend
$fake_backend->pattern->defaults->{app}->log($t->app->log);

my $q = qr!(?:\"|&quot;)!;

# Query passed
my $err = $t->get_ok('/?q=baum')
  ->status_is(200)
  ->content_type_is('text/html;charset=UTF-8')

  ->text_is('title', 'KorAP-Test: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP-Test: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')

  # Total results
  ->text_is('#total-results', 51)

  # Total pages
  ->element_count_is('#pagination > a', 5)

  ->element_exists_not('#resultinfo > #pagination')

  # api_response
  ->content_like(qr/${q}authorized${q}:null/)
  ->content_like(qr/${q}pubDate${q},${q}subTitle${q},${q}author${q}/)

  # No cutOff
  ->content_unlike(qr!${q}cutOff${q}:true!)

  ->element_exists('li[data-text-sigle=GOE/AGI/00000]')
  ->element_exists('li:nth-of-type(1) div.flop')
  ->element_exists('li[data-text-sigle=GOE/AGI/00001]')
  ->element_exists('li:nth-of-type(2) div.flip')

  # Match1
  ->element_exists('li:nth-of-type(1)' .
                     '[data-match-id="p2030-2031"]' .
                     '[data-text-sigle="GOE/AGI/00000"]' .
                     '[id="GOE/AGI/00000#p2030-2031"]' .
                     '[data-available-info^="base/s=spans"]' .
                     '[data-info^="{"]')
  ->text_is('li:nth-of-type(1) div.meta', 'GOE/AGI/00000')
  ->element_exists('li:nth-of-type(1) div.match-main div.match-wrap div.snippet')
  ->element_exists('li:nth-of-type(1) div.snippet.startMore.endMore')
  ->text_like('li:nth-of-type(1) div.snippet span.context-left',qr!sie etwas bedeuten!)
  ->text_like('li:nth-of-type(1) div.snippet span.context-left',qr!sie etwas bedeuten!)
  ->text_is('li:nth-of-type(1) div.snippet span.match mark','Baum')
  ->text_like('li:nth-of-type(1) div.snippet span.context-right',qr!es war!)
  ->text_is('li:nth-of-type(1) p.ref strong', 'Italienische Reise')
  ->text_like('li:nth-of-type(1) p.ref', qr!by Goethe, Johann Wolfgang!)
  ->text_is('li:nth-of-type(1) p.ref span.sigle', '[GOE/AGI/00000]')
  ->text_is('li:nth-of-type(1) p.ref time[datetime=1982]', 1982)
  ->text_like('li:nth-of-type(1) p.ref ', qr!von \(, \)!)
  ->text_is('li:nth-of-type(1) p.ref span.pages', 'p. 109')

  ->element_exists_not('li:nth-of-type(2) p.ref time')
  ->text_like('li:nth-of-type(2) p.ref ', qr!von \(\)!)
  ->text_is('li:nth-of-type(2) p.ref span.pages', 'pp. 109–204')

  ->header_isnt('X-Kalamar-Cache', 'true')
  ->attr_is('#pagination','data-page','1')
  ->attr_is('#pagination','data-total','3')
  ->attr_is('#pagination','data-count','25')
  ->tx->res->dom->at('#error')
  ;

is(defined $err ? $err->text : '', '');

# Query passed
$t->app->defaults(items_per_page => 20);

$t->get_ok('/?q=baum')
  ->status_is(200)
  ->content_type_is('text/html;charset=UTF-8')
  ->element_count_is('#pagination > a', 5)
  ->attr_is('#pagination','data-page','1')
  ->attr_is('#pagination','data-total','3')
  ->attr_is('#pagination','data-count','20')
;

$t->app->defaults(items_per_page => 25);

$t->get_ok('/?q=[orth=das')
  ->status_is(400)
  ->text_is('div.notify-error:nth-of-type(1)', '302: Parantheses/brackets unbalanced.')
  ->element_exists('#search')
  ->text_like('div.notify-error:nth-of-type(2)', qr!302: Could not parse query .+? \[orth=das.+?!)
  ;

# Check for query error with ql (from remote.t)
$t->get_ok('/?q=[orth=das&ql=poliqarp')
  ->element_exists('.notify-error')
  ->text_is('.notify-error', '302: Parantheses/brackets unbalanced.')
  ->content_like(qr!data-koralquery=!)
  ->text_is('.no-results:nth-of-type(1)', 'Unable to perform the action.')
  ;


# Query with partial cache (for total results)
$err = $t->get_ok('/?q=baum')
  ->status_is(200)
  ->text_is('title', 'KorAP-Test: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP-Test: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->content_like(qr!${q}cutOff${q}:true!)
  ->text_is('#total-results', 51)
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');

# Query without partial cache (unfortunately) (but no total results)
$err = $t->get_ok('/?q=baum&cutoff=true')
  ->status_is(200)
  ->text_is('title', 'KorAP-Test: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP-Test: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->content_like(qr!${q}cutOff${q}:true!)
  ->element_exists_not('#total-results')
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');

# Query with partial cache (but no total results)
$err = $t->get_ok('/?q=baum&cutoff=true')
  ->status_is(200)
  ->text_is('title', 'KorAP-Test: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP-Test: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->header_is('X-Kalamar-Cache', 'true')
  ->content_like(qr!${q}cutOff${q}:true!)
  ->element_exists_not('#total-results')
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');


# Query with full cache
$err = $t->get_ok('/?q=baum')
  ->status_is(200)
  ->text_is('title', 'KorAP-Test: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP-Test: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->header_is('X-Kalamar-Cache', 'true')
  ->content_like(qr!${q}cutOff${q}:true!)
  ->text_is('#total-results', 51)
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');


# Query with page information
$err = $t->get_ok('/?q=der&p=1&count=2' => { 'Accept-Language' => 'en-US, en, de-DE' })
  ->status_is(200)
  ->text_is('title', 'KorAP-Test: Find »der« with Poliqarp')

  # Total results
  ->text_is('#total-results', '14,581')

  # Total pages
  ->element_count_is('#pagination > a', 7)
  ->text_is('#pagination a:nth-of-type(6) span', '7,291')
  ->element_exists('#pagination a.ellipsis.inactive')
  ->content_like(qr!${q}count${q}:2!)
  ->content_like(qr!${q}startIndex${q}:0!)
  ->content_like(qr!${q}itemsPerPage${q}:2!)

  # No caching
  ->header_isnt('X-Kalamar-Cache', 'true')

  # Not searched for "der" before
  ->content_unlike(qr!${q}cutOff${q}:true!)

  ->attr_is('#pagination','data-page','1')
  ->attr_is('#pagination','data-total','7291')
  ->attr_is('#pagination','data-count','2')

  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');


# Check pagination repetion of page
my $next_href = $t->get_ok('/?q=der&p=1&count=2')
  ->tx->res->dom->at('#pagination a[rel=next]')->attr('href');
like($next_href, qr/p=2/);
unlike($next_href, qr/p=1/);

# Query with page information - next page
$err = $t->get_ok('/?q=der&p=2&count=2' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->text_is('div.logoaddon', 'Test')
  ->text_is('title', 'KorAP-Test: Finde »der« mit Poliqarp')
  ->element_exists('#search')

  # Total results
  ->text_is('#total-results', '14.581')

  # Total pages
  ->element_count_is('#pagination > a', 7)
  ->text_is('#pagination a:nth-of-type(6) span', '7.291')
  ->content_like(qr!${q}count${q}:2!)
  ->content_like(qr!${q}itemsPerPage${q}:2!)
  ->content_like(qr!${q}startIndex${q}:2!)

  ->attr_is('#pagination','data-page','2')
  ->attr_is('#pagination','data-total','7291')
  ->attr_is('#pagination','data-count','2')

  # No caching
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->content_like(qr!${q}cutOff${q}:true!)
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');


# Query with failing parameters
$t->get_ok('/?q=fantastisch&ql=Fabelsprache')
  ->status_is(400)
  ->text_is('#notifications div.notify-error', 'Parameter "ql" invalid')
  ->element_exists('#search')
  ->element_count_is('#notifications div.notify-error', 1)
  ;
$t->get_ok('/?q=fantastisch&cutoff=no')
  ->status_is(400)
  ->text_is('#notifications div.notify-error', 'Parameter "cutoff" invalid')
  ->element_count_is('#notifications div.notify-error', 1)
  ;
$t->get_ok('/?q=fantastisch&p=hui&o=hui&count=-8')
  ->status_is(400)
  ->text_like('#notifications div.notify-error', qr!Parameter ".+?" invalid!)
  ->element_count_is('#notifications div.notify-error', 3)
  ;

# Long, but not too long query
my $long_query = 'b' x 4096;
$err = $t->get_ok('/?q=' . $long_query)
  ->status_is(400)
  ->text_like('#notifications div.notify-error', qr!Unable to load query response from!)
  ->tx->res->dom->at('#error')
  ;

# Query too long
my $too_long_query = 'b' x 4097;
$err = $t->get_ok('/?q=' . $too_long_query)
  ->status_is(400)
  ->text_like('#notifications div.notify-error', qr!Parameter ".+?" invalid!)
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');

# Query with timeout
$t->get_ok('/?q=timeout')
  ->status_is(200)
  ->text_like('#notifications div.notify-warn', qr!Response time exceeded!)
  ->text_is('#total-results', ' 4,274,841')
  ->text_is('#total-results span[title]', 'more than');
;

# Query with error
$t->get_ok('/?q=error')
  ->status_is(400)
  ->text_is('#notifications .notify-error','500: Internal Server Error')
;

# Do not cache
$t->get_ok('/?q=timeout')
  ->status_is(200)
  # ->text_like('#notifications div.notify-warning', qr!Response time exceeded!)
  ->element_exists("input#cq")
  ->element_exists_not("input#cq[value]")
  ->text_is('#total-results', ' 4,274,841')
  ->text_is('#total-results span[title]', 'more than');
  ;

$t->app->defaults(no_cache => 1);

# Query with collection
$err = $t->get_ok('/?q=baum&collection=availability+%3D+%2FCC-BY.*%2F')
  ->status_is(200)
  ->element_exists("input#cq[value='availability = /CC-BY.*/']")
  ->content_like(qr!${q}availability${q}!)
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');


$t->app->hook(
  after_search => sub {
    my $c = shift;
    $c->content_for('after_search_results' => '<p id="special">Funny</p>');
  }
);

# Query with corpus query
$err = $t->get_ok('/?q=baum&cq=availability+%3D+%2FCC-BY.*%2F')
  ->status_is(200)
  ->element_exists("input#cq[value='availability = /CC-BY.*/']")
  ->content_like(qr!${q}availability${q}!)
  ->text_is('#special', 'Funny')
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');

my $match = {
  matchID => 'match-FOLK/00070-SE-01/T-04-p5441-5442',
  textSigle => 'FOLK/00070-SE-01/T-04'
};

$match = Kalamar::Controller::Search::_map_match($match);

is($match->{matchID}, 'p5441-5442');

# Query with pipe
$err = $t->get_ok('/?q=baum&pipe=glemm')
  ->status_is(200)
  ->content_like(qr/${q}pipes${q}:${q}glemm${q}/)
  ->tx->res->dom->at('#error')
  ;
is(defined $err ? $err->text : '', '');


my $base_fixtures = path(Mojo::File->new(__FILE__)->dirname, 'fixtures');
my $text_info = $base_fixtures->child('response_textinfo_goe_agi_00000.json')->slurp;
my $fields = decode_json($text_info)->{json}->{document}->{fields};

my $f = Kalamar::Controller::Search::_flatten_fields($fields);

is($f->{textSigle}, 'GOE/AGI/00000');
is($f->{author}, 'Goethe, Johann Wolfgang von');
is($f->{docSigle}, 'GOE/AGI');
is($f->{docTitle}, 'Goethe: Autobiographische Schriften III, (1813-1816, 1819-1829)');
is($f->{textType}, 'Autobiographie');
is($f->{language}, 'de');
is($f->{availability}, 'ACA-NC');
is($f->{title}, 'Italienische Reise');
is($f->{creationDate}, '1813');
is($f->{pubDate}, '1982');
is($f->{reference}, 'Goethe, Johann Wolfgang von: Italienische Reise. Auch ich in Arkadien!, (Geschrieben: 1813-1816), In: Goethe, Johann Wolfgang von: Goethes Werke, Bd. 11, Autobiographische Schriften III, Hrsg.: Trunz, Erich. München: Verlag C. H. Beck, 1982, S. 9-349');
is($f->{subTitle}, 'Auch ich in Arkadien!');
is($f->{tokenSource}, 'base#tokens');
is($f->{foundries}, 'corenlp corenlp/constituency corenlp/morpho corenlp/sentences dereko dereko/structure dereko/structure/base-sentences-paragraphs-pagebreaks malt malt/dependency marmot marmot/morpho opennlp opennlp/morpho opennlp/sentences treetagger treetagger/morpho');
is($f->{publisher}, 'Verlag C. H. Beck');
is($f->{corpusAuthor}, 'Goethe, Johann Wolfgang von');
is($f->{layerInfos}, 'corenlp/c=spans corenlp/p=tokens corenlp/s=spans dereko/s=spans malt/d=rels marmot/m=tokens marmot/p=tokens opennlp/p=tokens opennlp/s=spans tt/l=tokens tt/p=tokens');
is($f->{pubPlace}, 'München');
is($f->{corpusTitle}, 'Goethes Werke');
is($f->{corpusSigle}, 'GOE');
is($f->{corpusEditor}, 'Trunz, Erich');


done_testing;
__END__
