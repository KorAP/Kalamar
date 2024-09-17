use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/path/;
use utf8;

$ENV{KALAMAR_VERSION} = '0.47.999';

#####################
# Start Fake server #
#####################
my $mount_point = '/realapi/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo->new('Kalamar');

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

$t->app->mode('production');

$t->get_ok('/')
  ->status_is(200)
  ->text_is('title', 'KorAP-DeLiKo@DNB - Corpus Analysis Platform')
  ->text_is('h1 span', 'KorAP-DeLiKo@DNB - Corpus Analysis Platform')
  ->element_exists('div.intro')
  ->text_is('div.intro > p > strong', 'KorAP')
  ->content_unlike(qr!onload!)
  ->text_is('div.intro > p > a.link-guided-tour', 'guided tour')
  ->text_is('nav > div > a[href=/doc/korap/kalamar]', 'V 0.47.999')
  ->element_exists('select#ql-field option[value=poliqarp]')
  ->element_exists('select#ql-field option[value=cqp]')
  ->element_exists_not('select#ql-field option[value=noliqart]')
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
  ->text_is('title', 'KorAP-DeLiKo@DNB - Corpus Analysis Platform')
  ->text_is('h1 span', 'KorAP-DeLiKo@DNB - Corpus Analysis Platform')
  ->element_exists('div.intro')
  ->text_is('div.intro h2', 'This is a custom intro page!')
  ->element_exists('meta[name="DC.description"][content="KorAP-DeLiKo@DNB - Corpus Analysis Platform"]')
  ->element_exists('meta[name="keywords"][content^="KorAP"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/WebApplication"]')
  ->element_exists_not('#koralQuery')
  ->element_exists('aside.invisible')
  ->element_exists('aside.off')
  ;

$t->get_ok('/?cq=corpusSigle%3DGOE')
  ->status_is(200)
  ->text_is('title', 'KorAP-DeLiKo@DNB - Corpus Analysis Platform')
  ->text_is('h1 span', 'KorAP-DeLiKo@DNB - Corpus Analysis Platform')
  ->element_exists_not('#notifications div.notify')
  ->element_exists('div.intro')
  ->text_is('div.intro h2', 'This is a custom intro page!')
  ->element_exists('meta[name="DC.description"][content="KorAP-DeLiKo@DNB - Corpus Analysis Platform"]')
  ->element_exists('meta[name="keywords"][content^="KorAP"]')
  ->element_exists('body[itemscope][itemtype="http://schema.org/WebApplication"]')
  ->element_exists('#koralQuery')
  ->element_exists('aside.invisible')
  ->element_exists('aside.off')
  ->text_is('#notifications > .notify-error', undef)
  ;

$t->get_ok('/huhuhuhuhu')
  ->status_is(404)
  ->text_is('title', 'KorAP: 404 - Page not found')
  ->text_is('h1 span', 'KorAP: 404 - Page not found');


$t->get_ok('/doc/off')
  ->status_is(200)
  ->text_is('title', 'KorAP-DeLiKo@DNB - Corpus Analysis Platform')
  ->text_is('h1 span', 'KorAP-DeLiKo@DNB - Corpus Analysis Platform')
  ->attr_is('aside', 'class',' off')
  ;


done_testing();
