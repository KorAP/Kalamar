package Kalamar::Controller::User;
use Mojo::Base 'Mojolicious::Controller';

# Login action
sub login {
  my $c = shift;

  # Validate input
  my $v = $c->validation;
  $v->required('handle_or_email', 'trim');
  $v->required('pwd', 'trim');
  $v->csrf_protect;

  if ($v->has_error) {
    if ($v->has_error('csrf_token')) {
      $c->notify(error => $c->loc('Auth_csrfFail'));
    }
    else {
      $c->notify(error => $c->loc('Auth_loginFail'));
    };
  }

  # Login user
  elsif ($c->user->login(
    $v->param('handle_or_email'),
    $v->param('pwd')
  )) {
    $c->notify(success => $c->loc('Auth_loginSuccess'));
  }

  else {
    $c->notify(error => $c->loc('Auth_loginFail'));
  };

  # Set flash for redirect
  $c->flash(handle_or_email => $v->param('handle_or_email'));

  # Redirect to slash
  return $c->redirect_to('index');
};


# Logout of the session
sub logout {
  my $c = shift;

  # Log out of the system
  if ($c->user->logout) {
    $c->notify(success => $c->loc('Auth_logoutSuccess'));
  }

  # Something went wrong
  else {
    $c->notify('error', $c->loc('Auth_logoutFail'));
  };

  return $c->redirect_to('index');
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
