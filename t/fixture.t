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

$t->get_ok('/search?q=[orth=das&ql=poliqarp')
  ->status_is(400)
  ->json_is('/errors/0/0',302)
  ->json_is('/errors/0/1','Parantheses/brackets unbalanced.')
  ->json_is('/errors/1/0',302)
  ->json_is('/errors/1/1','Could not parse query >>> [orth=das <<<.')
  ;

done_testing;
__END__

