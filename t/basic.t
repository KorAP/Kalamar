use Mojo::Base -strict;
use lib '../lib', 'lib';
use Test::More;
use Test::Mojo;

my $t = Test::Mojo->new('Kalamar');
$t->get_ok('/')
  ->status_is(200)
  ->text_is('title', 'KorAP - Corpus Analysis Platform')
  ->text_is('h1 span', 'KorAP - Corpus Analysis Platform');

done_testing();
