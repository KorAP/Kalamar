use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/path/;
use utf8;

my $t = Test::Mojo->new('Kalamar');

$t->app->mode('production');

$t->get_ok('/')
  ->status_is(200)
  ->text_is('title', 'KorAP - Corpus Analysis Platform')
  ->text_is('h1 span', 'KorAP - Corpus Analysis Platform')
  ->element_exists('div.intro')
  ->text_is('div.intro > p > strong', 'KorAP')
  ;

# Only routed when existing
$t->get_ok('/settings')
  ->status_is(404);

push @{$t->app->renderer->paths}, path(path(__FILE__)->dirname);

$t->app->plugin(Localize => {
  dict => {
    Template => {
      intro => 'custom/intro'
    }
  },
  override => 1
});


$t->get_ok('/')
  ->status_is(200)
  ->text_is('title', 'KorAP - Corpus Analysis Platform')
  ->text_is('h1 span', 'KorAP - Corpus Analysis Platform')
  ->element_exists('div.intro')
  ->text_is('div.intro h2', 'This is a custom intro page!')
  ->element_exists('meta[name="DC.description"][content="KorAP - Corpus Analysis Platform"]')
  ->element_exists('meta[name="keywords"][content^="KorAP"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/WebApplication"]')
  ;

$t->get_ok('/huhuhuhuhu')
  ->status_is(404)
  ->text_is('title', 'KorAP: 404 - Page not found')
  ->text_is('h1 span', 'KorAP: 404 - Page not found');

done_testing();
