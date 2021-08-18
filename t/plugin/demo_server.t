
use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
# Test the documentation
my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['DemoServer']
  }
});
$t->get_ok('/demo/all.html')
  ->status_is(200)
  ->content_type_is('text/html;charset=UTF-8')
  ->text_is('title', 'Complete Demo')
  ;
$t->get_ok('/demo/alldemo.js')
  ->status_is(200)
  ->content_type_is('application/javascript')
  ->content_like(qr!'app/en'!)
  ;
done_testing;
__END__
