use Mojo::Base -strict;
use lib '../lib', 'lib';
use Test::More;
use Test::Mojo;

my $t = Test::Mojo->new('Kalamar');
$t->get_ok('/')
  ->status_is(200)
  ->text_is('title', 'KorAP')
  ->text_like('h1 span', qr/Korpusanalyseplattform/i);

done_testing();
