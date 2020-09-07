package Kalamar::Plugin::Test;
use Mojo::Base 'Mojolicious::Plugin';


sub register {
  my ($plugin, $app, $param) = @_;

  # Add entry to settings navigation
  $app->navi->add(settings => (
    'OAuth Token Management', 'oauth'
  ));

  $app->routes->get('/settings/oauth')->to(
    cb => sub {
      my $c = shift;
      $c->res->headers->header('X-Robots' => 'noindex');
      $c->content_with(settings => '<p id="abc">My Settings</p>');
      return $c->render('settings');
    }
  );
};

package main;
use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/path/;


#####################
# Start Fake server #
#####################
my $mount_point = '/realapi/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['Test']
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

# Test robots meta tag

$t->get_ok('/')
  ->attr_is('meta[name=robots]', 'content', 'index,follow')
  ->header_isnt('X-Robots', 'noindex')
  ;

$t->get_ok('/doc/ql/poliqarp-plus')
  ->attr_is('meta[name=robots]', 'content', 'index,follow')
  ->header_isnt('X-Robots', 'noindex')
  ;

$t->get_ok('/corpus')
  ->status_is(200)
  ->header_is('X-Robots', 'noindex')
  ;

$t->get_ok('/corpus/WPD15/232/39681/p2133-2134?spans=false&foundry=*&format=json')
  ->status_is(200)
  ->header_is('X-Robots', 'noindex')
  ;

$t->get_ok('/settings')
  ->attr_is('meta[name=robots]', 'content', 'noindex')
  ->header_is('X-Robots', 'noindex')
  ;

$t->get_ok('/?q=baum')
  ->status_is(200)
  ->text_is('#total-results', 51)
  ->attr_is('meta[name=robots]', 'content', 'noindex')
  ->header_is('X-Robots', 'noindex')
  ;

done_testing;
