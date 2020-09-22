use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/tempfile/;

# Test the documentation
my $t = Test::Mojo->new('Kalamar');

my $temp = tempfile();

$temp->spurt(<<SCRIPT);
KorAP.register(...);
SCRIPT

$t->app->plugin('Plugins' => {
  default_plugins => $temp->to_string
});


$t->get_ok('/')
  ->text_is('h1 span', 'KorAP - Corpus Analysis Platform')
  ->content_like(qr!KorAP\.register\(!)
  ->content_like(qr!<script>\/\/<\!\[CDATA\[!)
  ;

done_testing;
