use Mojo::Base -strict;
use lib '../lib', 'lib';
use Test::More;
use Test::Mojo;

my $t = Test::Mojo->new('Kalamar');

$t->app->mode('production');

$t->get_ok('/')
  ->status_is(200)
  ->text_is('title', 'KorAP - Corpus Analysis Platform')
  ->text_is('h1 span', 'KorAP - Corpus Analysis Platform');

$t->get_ok('/huhuhuhuhu')
  ->status_is(404)
  ->text_is('title', 'KorAP: 404 - Page not found')
  ->text_is('h1 span', 'KorAP: 404 - Page not found');

done_testing();
