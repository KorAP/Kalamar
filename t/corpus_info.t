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
$t->get_ok('/corpus')
  ->status_is(200)
  ->content_like(qr!"tokens":5991667065!)
  ->json_is('/documents', 20216975)
  ->json_is('/tokens', 5991667065)
  ->json_is('/sentences', 403923016)
  ->json_is('/paragraphs', 129385487)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ;

$t->get_ok('/corpus?cq=docSigle+%3D+\"GOE/AGA\"')
  ->status_is(200)
  ->json_is('/documents', 5)
  ->json_is('/tokens', 108557)
  ->json_is('/sentences', 3835)
  ->json_is('/paragraphs', 124)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ;

$t->get_ok('/corpus?cq=4')
  ->status_is(400)
  ->json_is('/notifications/0/1', "302: Could not parse query >>> (4) <<<.")
  ;

# Query passed
$t->get_ok('/corpus')
  ->status_is(200)
  ->content_like(qr!"tokens":5991667065!)
  ->json_is('/documents', 20216975)
  ->json_is('/tokens', 5991667065)
  ->json_is('/sentences', 403923016)
  ->json_is('/paragraphs', 129385487)
  ->header_is('X-Kalamar-Cache', 'true')
  ;


done_testing;
__END__
