use Mojo::Base -strict;
use Test::Mojo;
use Test::More;

my $t = Test::Mojo->new('Kalamar');

# Query passed
$t->get_ok('/q2?q=hui')
  ->status_is(200)
  ->text_is('#error','')
  ->text_is('title', 'KorAP: Find »hui« with Poliqarp')
  ->element_exists('meta[name="DC.title"][content="KorAP: Find »hui« with Poliqarp"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/SearchResultsPage"]')
  ;



done_testing;
