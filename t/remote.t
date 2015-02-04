use Mojo::Base -strict;
use lib '../lib', 'lib';
use Test::More;
use Test::Mojo;

my $t = Test::Mojo->new('Korap');
$t->get_ok('/')
  ->status_is(200)
  ->text_is('title', 'KorAP')
  ->text_like('h1 span', qr/Korpusanalyseplattform/i)
  ;

# Check paging
$t->get_ok('/?q=test')
  ->text_is('pre.query.serial span', 'JSON-LD Serialization for "test"')
  ->text_like('#total-results', qr/\d+ matches$/)
  ->element_exists('[title=Alignment]')
  ->text_is('#pagination a[rel=self] span', 1)
;

# Check paging
$t->get_ok('/?q=test&p=2')
  ->text_is('pre.query.serial span', 'JSON-LD Serialization for "test"')
  ->text_like('#total-results', qr/\d+ matches$/)
  ->text_is('#pagination a[rel=self] span', 2)
;

# $t->get_ok('/tutorial?testing=1')
#   ->text_like('div.test p.pass', qr/Pass: [1-9]/)
#  ;

done_testing();
