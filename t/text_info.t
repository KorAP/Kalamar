use Mojo::Base -strict;
use Test::Mojo;
use Test::More;
use Mojo::File qw/path/;


#####################
# Start Fake server #
#####################
my $mount_point = '/realapi/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo->new('Kalamar');

# Mount fake backend
# Get the fixture path
my $fixtures_path = path(Mojo::File->new(__FILE__)->dirname, 'server');
my $fake_backend = $t->app->plugin(
  Mount => {
    $mount_point =>
      $fixtures_path->child('mock.pl')
  }
);
# Configure fake backend
$fake_backend->pattern->defaults->{app}->log($t->app->log);

# Query passed
$t->get_ok('/corpus/GOE/AGI/00000')
  ->status_is(200)
  ->json_is('/document/fields/0/key', 'textSigle')
  ->json_is('/document/fields/0/value', 'GOE/AGI/00000')
  ;

$t->get_ok('/corpus/GOE/AGI/00000?response-pipe=glemm')
  ->status_is(200)
  ->json_is('/document/fields/0/key', 'textSigle')
  ->json_is('/document/fields/0/value', 'GOE/AGI/00000')
  ->json_is('/meta/responsePipes', 'glemm')
  ;


# Not found - should probably be 404
$t->get_ok('/corpus/GOE/AGY/00000')
  ->status_is(200)
  ->json_is('/notifications/0/1', '630: Document not found')
  ;

# Real example from NKJP
$t->get_ok('/corpus/NKJP/NKJP/forumowisko.pl_57')
  ->status_is(200)
  ->json_like('/notifications/0/1', qr!^Unable to load!)
  ;



done_testing;
__END__
