package Kalamar::Controller::User;
use Mojo::Base 'Mojolicious::Controller';

# Login action
sub login {
  my $c = shift;

  # Validate input
  my $v = $c->validation;
  $v->required('handle_or_email', 'trim');
  $v->required('pwd', 'trim');

  if ($v->has_error) {
    $c->notify(error => 'login fail');
  }

  # Login user
  elsif ($c->user->login(
    $v->param('handle_or_email'),
    $v->param('pwd')
  )) {
    $c->notify(success => 'Login successful!');
  };

  # return $c->render(text => 'ok');
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
