package Kalamar::Controller::User;
use Mojo::Base 'Mojolicious::Controller';

# Login action
sub login {
  my $c = shift;

  # Validate input
  my $v = $c->validation;
  $v->required('handle_or_email');
  $v->required('pwd');

  # Login user
  $c->user->login(
    $v->param('handle_or_email'),
    $v->param('pwd')
  );

  return $c->redirect_to('/');
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
