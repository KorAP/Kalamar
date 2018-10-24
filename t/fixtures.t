use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/path/;

# Get the fixture path
my $fixtures_path = path(Mojo::File->new(__FILE__)->dirname, 'fixtures');

my $t = Test::Mojo->new($fixtures_path->child('fake_backend.pl'));

$t->get_ok('/')
  ->status_is(200)
  ->content_is('Fake server available');

$t->get_ok('/search?ql=cosmas3')
  ->status_is(400)
  ->json_is('/errors/0/0',"307")
  ->json_is('/errors/0/1',"cosmas3 is not a supported query language!")
  ;

$t->get_ok('/search?q=server_fail')
  ->status_is(500)
  ->text_is('#error', '')
  ->content_like(qr!Oooops!)
  ;

$t->get_ok('/search?q=[orth=das&ql=poliqarp&offset=0&count=25')
  ->status_is(400)
  ->text_is('#error', '')
  ->json_is('/errors/0/0',302)
  ->json_is('/errors/0/1','Parantheses/brackets unbalanced.')
  ->json_is('/errors/1/0',302)
  ->json_is('/errors/1/1','Could not parse query >>> [orth=das <<<.')
  ;

$t->get_ok('/search?q=baum&ql=poliqarp&offset=0&count=25')
  ->status_is(200)
  ->text_is('#error', '')
  ->json_is('/meta/count', 25)
  ->json_is('/meta/serialQuery', "tokens:s:Baum")
  ->json_is('/matches/0/docSigle', "GOE/AGI")
  ;

$t->get_ok('/corpus/WPD15/232/39681/p2133-2134/matchInfo?spans=false&foundry=*')
  ->status_is(200)
  ->json_is('/textSigle', 'WPD15/232/39681')
  ;

done_testing;
__END__

