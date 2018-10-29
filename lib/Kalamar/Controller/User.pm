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
  $v->optional('fwd')->closed_redirect;

  if ($v->has_error) {
    if ($v->has_error('fwd')) {
      $c->notify(error => $c->loc('Auth_openRedirectFail'));
    }
    elsif ($v->has_error('csrf_token')) {
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
  return $c->relative_redirect_to($v->param('fwd') // 'index');
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


# Currently not in used
sub register {
  my $c = shift;
  $c->render(json => {
    response => 'register'
  });
};


# Currently not in use
sub pwdforgotten {
  my $c = shift;
  $c->render(json => {
    response => 'pwdforgotten'
  });
};

1;
