use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/path/;
use Data::Dumper;


#####################
# Start Fake server #
#####################
my $mount_point = '/realapi/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['Auth'],
    experimental_proxy => 1
  }
});

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

# Globally set server
$t->app->ua->server->app($t->app);

$t->get_ok('/realapi/v1.0')
  ->status_is(200)
  ->content_is('Fake server available')
  ;

$t->get_ok('/api/v1.0/')
  ->status_is(200)
  ->content_is('Fake server available')
  ;

$t->get_ok('/api/v1.0/search?ql=cosmas3')
  ->status_is(400)
  ->json_is('/errors/0/0','307')
  ->header_is('connection', 'close')
  ;

$t->post_ok('/api/v1.0/oauth2/token' => {} => form => {
  username => 'test',
  password => 'pass'
})
  ->status_is(400)
  ->json_is('/errors/0/1','Grant Type unknown')
  ;

$t->post_ok('/api/v1.0/oauth2/token' => {} => form => {
  grant_type => 'password',
  client_id => 2,
  client_secret => 'k414m4r-s3cr3t',
  username => 'test',
  password => 'pass'
})
  ->status_is(200)
  ->json_is('/token_type', 'Bearer')
  ;


done_testing;
__END__
