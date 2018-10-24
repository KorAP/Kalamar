use Mojo::Base -strict;
use Test::Mojo;
use Test::More;
use Mojo::File qw/path/;


#####################
# Start Fake server #
#####################
my $mount_point = '/api/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo->new('Kalamar');

# Mount fake backend
# Get the fixture path
my $fixtures_path = path(Mojo::File->new(__FILE__)->dirname, 'fixtures');
my $fake_backend = $t->app->plugin(
  Mount => {
    $mount_point =>
      $fixtures_path->child('fake_backend.pl')
  }
);
# Configure fake backend
$fake_backend->pattern->defaults->{app}->log($t->app->log);

# Query passed
$t->get_ok('/?q=baum')
  ->status_is(200)
  ->text_is('#error','')

  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')

  # Total results
  ->text_is('#total-results', 51)

  # Total pages
  ->element_count_is('#pagination a', 5)

  # api_response
  ->content_like(qr/\"authorized\":null/)
  ->content_like(qr/\"pubDate\",\"subTitle\",\"author\"/)

  # No cutOff
  ->content_unlike(qr!\"cutOff":true!)

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
  ->text_is('li:nth-of-type(1) p.ref time[datetime=1982]', 1982)
  ->text_is('li:nth-of-type(1) p.ref span.sigle', '[GOE/AGI/00000]')
  ->header_isnt('X-Kalamar-Cache', 'true')
  ;


$t->get_ok('/?q=[orth=das')
  ->status_is(400)
  ->text_is('div.notify-error:nth-of-type(1)', '302: Parantheses/brackets unbalanced.')
  ->text_like('div.notify-error:nth-of-type(2)', qr!302: Could not parse query .+? \[orth=das.+?!)
  ;

# Query with partial cache (for total results)
$t->get_ok('/?q=baum')
  ->status_is(200)
  ->text_is('#error','')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->content_like(qr!\"cutOff":true!)
  ->text_is('#total-results', 51)
  ;

# Query with full cache
$t->get_ok('/?q=baum')
  ->status_is(200)
  ->text_is('#error','')
  ->text_is('title', 'KorAP: Find »baum« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »baum« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ->header_is('X-Kalamar-Cache', 'true')
  ->content_like(qr!\"cutOff":true!)
  ->text_is('#total-results', 51)
  ;


# Query with page information
$t->get_ok('/?q=der&p=1&count=2')
  ->status_is(200)
  ->text_is('#error','')
  ->text_is('title', 'KorAP: Find »der« with Poliqarp')

  # Total results
  ->text_is('#total-results', '14,581')

  # Total pages
  ->element_count_is('#pagination a', 7)
  ->text_is('#pagination a:nth-of-type(6) span', 7291)
  ->content_like(qr!\"count":2!)
  ->content_like(qr!\"startIndex":0!)
  ->content_like(qr!\"itemsPerPage":2!)

  # No caching
  ->header_isnt('X-Kalamar-Cache', 'true')

  # Not searched for "der" before
  ->content_unlike(qr!\"cutOff":true!)
  ;

# Query with page information - next page
$t->get_ok('/?q=der&p=2&count=2')
  ->status_is(200)
  ->text_is('#error','')
  ->text_is('title', 'KorAP: Find »der« with Poliqarp')

  # Total results
  ->text_is('#total-results', '14,581')

  # Total pages
  ->element_count_is('#pagination a', 7)
  ->text_is('#pagination a:nth-of-type(6) span', 7291)
  ->content_like(qr!\"count":2!)
  ->content_like(qr!\"itemsPerPage":2!)
  ->content_like(qr!\"startIndex":2!)

  # No caching
  ->header_isnt('X-Kalamar-Cache', 'true')
  ->content_like(qr!\"cutOff":true!)
  ;




done_testing;
__END__
