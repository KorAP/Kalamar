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
    proxy_inactivity_timeout => 99,
    proxy_connect_timeout => 66,
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
my $fake_app = $fake_backend->pattern->defaults->{app};
$fake_app->log($t->app->log);

# Globally set server
$t->app->ua->server->app($t->app);

my $rendered = 0;
$t->app->hook(
  after_render => sub {
    $rendered++;
  }
);

$t->get_ok('/doc')
  ->status_is(200)
  ->text_like('title', qr!KorAP!)
  ;

is($rendered, 1);

$t->get_ok('/realapi/v1.0')
  ->status_is(200)
  ->content_is('Fake server available')
  ;

is($rendered, 1);

$t->get_ok('/api/v1.0/')
  ->status_is(200)
  ->header_is('X-Proxy', 'Kalamar')
  ->header_is('X-Robots', 'noindex')
  ->header_is('Connection', 'close')
  ->header_is('Access-Control-Allow-Origin', '*')
  ->header_is('Access-Control-Allow-Methods', 'GET, OPTIONS')
  ->content_is('Fake server available')
  ;

# Proxy renders
is($rendered, 2);

$t->get_ok('/api/v1.0/search?ql=cosmas3')
  ->status_is(400)
  ->header_is('Access-Control-Allow-Origin', '*')
  ->header_is('Access-Control-Allow-Methods', 'GET, OPTIONS')
  ->json_is('/errors/0/0','307')
  ->header_is('connection', 'close')
  ;

# Proxy renders
is($rendered, 3);

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

# Create long-running route
$fake_app->routes->get('/v1.0/longwait')->to(
  cb => sub {
    my $c = shift;

    $c->render_later;
    Mojo::IOLoop->timer(
      5 => sub {
        return $c->render(text => 'okay');
      }
    );
  });

# Set proxy timeout
is($t->app->ua->inactivity_timeout, 99);
is($t->app->ua->connect_timeout, 66);

# Set proxy timeout
$t->app->ua->inactivity_timeout(1);

$t->get_ok('/api/v1.0/longwait')
  ->status_is(400)
  ->content_is('Proxy error: Inactivity timeout')
  ;

$t->get_ok('/api/v1.0/redirect-target-a')
  ->status_is(200)
  ->header_is('Access-Control-Allow-Origin', '*')
  ->header_is('Access-Control-Allow-Methods', 'GET, OPTIONS')
  ->content_is('Redirect Target!')
  ;

$t->get_ok('/api/v1.0/redirect')
  ->status_is(308)
  ->content_is('')
  ;

$t->ua->max_redirects(2);

$t->get_ok('/api/v1.0/redirect')
  ->status_is(200)
  ->header_is('Access-Control-Allow-Origin', '*')
  ->content_is('Redirect Target!')
  ;

# Check CORS
$t->options_ok('/api/v1.0/search?ql=cosmas3')
  ->status_is(204)
  ->content_is('')
  ->header_is('Access-Control-Allow-Origin', '*')
  ->header_is('Access-Control-Allow-Methods', 'GET, OPTIONS')
  ->header_is('Access-Control-Max-Age', '86400')
  ;


done_testing;
__END__
