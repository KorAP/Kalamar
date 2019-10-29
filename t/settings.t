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
      $c->content_with(settings => '<p id="abc">My Settings</p>');
      return $c->render('settings');
    }
  );
};

package main;
use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::ByteStream 'b';

my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['Test']
  }
});

my $app = $t->app;

$app->routes->get('/settings')->to(cb => sub { shift->render('settings') })->name('settings_start');
$app->routes->get('/settings/:scope/:page')->to(scope => undef, page => undef)->name('settings');


$t->get_ok('/settings')
  ->text_is('a[href~/settings/oauth]','OAuth Token Management')
#  ->text_is('h2#page-top', 'Settings')
  ;

$t->get_ok('/settings/oauth')
  ->text_is('a[href~/settings/oauth]','OAuth Token Management')
#  ->text_is('h2#page-top', 'Settings')
#  ->text_is('#abc', 'My Settings')
  ;

done_testing;
__END__
