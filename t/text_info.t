use Mojo::Base -strict;
use Test::Mojo;
use Test::More;
use Mojo::File qw/path/;


#####################
# Start Fake server #
#####################
my $mount_point = '/api/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo->new('Kalamar');

# Mount fake backend
# Get the fixture path
my $fixtures_path = path(Mojo::File->new(__FILE__)->dirname, 'fixtures');
my $fake_backend = $t->app->plugin(
  Mount => {
    $mount_point =>
      $fixtures_path->child('fake_backend.pl')
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

# Not found - should probably be 404
$t->get_ok('/corpus/GOE/AGY/00000')
  ->status_is(200)
  ->json_is('/notifications/0/1', '630: Document not found')
  ;


done_testing;
__END__
