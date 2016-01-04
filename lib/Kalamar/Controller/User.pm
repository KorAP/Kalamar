package Kalamar::Controller::User;
use Mojo::Base 'Mojolicious::Controller';

sub login {
  my $c = shift;
  $c->render(json => {
    response => 'logged in'
  });
};

sub logout {};

1;
