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

$t->get_ok('/settings')
  ->text_is('a[href*=/settings/oauth]','OAuth Token Management')
  ->text_is('h1 span', 'Settings')
  ;

$t->get_ok('/settings/oauth')
  ->text_is('a[href*=/settings/oauth]','OAuth Token Management')
  ->text_is('h1 span', 'Settings')
  ->text_is('p#abc', 'My Settings')
  ;

done_testing;
__END__
