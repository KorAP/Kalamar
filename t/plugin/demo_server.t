<<<<<<< HEAD
use Mojo::Base -strict;
use Test::More;
use Test::Mojo;

=======

use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
>>>>>>> Use containerMenu as a base for HintMenu instead of regular menu
# Test the documentation
my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['DemoServer']
  }
});
<<<<<<< HEAD

=======
>>>>>>> Use containerMenu as a base for HintMenu instead of regular menu
$t->get_ok('/demo/all.html')
  ->status_is(200)
  ->content_type_is('text/html;charset=UTF-8')
  ->text_is('title', 'Complete Demo')
  ;
<<<<<<< HEAD

=======
>>>>>>> Use containerMenu as a base for HintMenu instead of regular menu
$t->get_ok('/demo/alldemo.js')
  ->status_is(200)
  ->content_type_is('application/javascript')
  ->content_like(qr!'app/en'!)
  ;
<<<<<<< HEAD

done_testing;
__END__
=======
done_testing;
__END__
>>>>>>> Use containerMenu as a base for HintMenu instead of regular menu
