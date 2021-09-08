use Mojo::Base -strict;
use Test::More;
use Test::Mojo;

# Test legacy links for documentation

my $t = Test::Mojo->new('Kalamar');

my $h = $t->get_ok('/doc/korap')
  ->status_is(302)
  ->header_like('Location',qr!/doc/+development!)
  ->tx->res->headers->header('Location')
  ;

$t->get_ok($h)
  ->status_is(200)
  ;

$h = $t->get_ok('/doc/korap/kalamar')
  ->status_is(302)
  ->header_like('Location',qr!/doc/+development/+kalamar!)
  ->tx->res->headers->header('Location')
  ;

$t->get_ok($h)
  ->status_is(200)
  ;

$t->get_ok('/doc/korap/karang')
  ->status_is(302)
  ->header_like('Location',qr!/doc/+development/+karang!)
  ;

$t->get_ok('/doc/korap/koral')
  ->status_is(302)
  ->header_like('Location',qr!/doc/+development/+koral!)
  ;

$t->get_ok('/doc/korap/krill')
  ->status_is(302)
  ->header_like('Location',qr!/doc/+development/+krill!)
  ;

$t->get_ok('/doc/korap/kustvakt')
  ->status_is(302)
  ->header_like('Location',qr!/doc/+development/+kustvakt!)
  ;

done_testing();
