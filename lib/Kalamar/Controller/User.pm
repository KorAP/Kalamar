package Kalamar::Controller::User;
use Mojo::Base 'Mojolicious::Controller';

sub login {
  my $c = shift;
  my $v = $c->validator;
  $v->required('handle_or_email');
  $v->required('pwd');

  my $handle = $v->param('handle_or_email');
  my $pwd = $v->param('pwd');

  $c->user->login($handle, $pwd);

  return $c->redirect_to;
};

sub logout {
  shift->user->logout;
};

sub register {
  my $c = shift;
  $c->render(json => {
    response => 'register'
  });
};

sub pwdforgotten {
  my $c = shift;
  $c->render(json => {
    response => 'pwdforgotten'
  });
};

1;
