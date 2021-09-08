use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
# Test legacy links for documentation
my $t = Test::Mojo->new('Kalamar');
$t->get_ok('/doc/korap')
  ->status_is(302)
  ->header_like('Location',qr!/doc/+development!)
  ;
$t->get_ok('/doc/korap/kalamar')
  ->status_is(302)
  ->header_like('Location',qr!/doc/+development/+kalamar!)
  ;
done_testing();
