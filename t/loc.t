use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/path/;
use utf8;

$ENV{KALAMAR_VERSION} = '0.47.999';

my $t = Test::Mojo->new('Kalamar');

$t->app->mode('production');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists('html[lang="en"]')
  ->text_is('title', 'KorAP - Corpus Analysis Platform')
  ->text_is('h1 span', 'KorAP - Corpus Analysis Platform')
  ;

$t->get_ok('/' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->element_exists('html[lang="de"]')
  ->text_is('title', 'KorAP - Korpusanalyseplattform der nächsten Generation')
  ->text_is('h1 span', 'KorAP - Korpusanalyseplattform der nächsten Generation')
  ;

$t->get_ok('/' => { 'Accept-Language' => 'ro, en' })
  ->status_is(200)
  ->element_exists('html[lang="ro"]')
  ->text_is('title', 'KorAP - Platformă pentru analiza corpusului')
  ->text_is('h1 span', 'KorAP - Platformă pentru analiza corpusului')
  ;

$t->get_ok('/' => { 'Accept-Language' => 'hu, en' })
  ->status_is(200)
  ->element_exists('html[lang="hu"]')
  ->text_is('title', 'KorAP - Korpuszelemző platform')
  ->text_is('h1 span', 'KorAP - Korpuszelemző platform')
  ;

$t->app->mode('development');
$t->get_ok('/' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->element_exists('html[lang="de"]');

done_testing();
