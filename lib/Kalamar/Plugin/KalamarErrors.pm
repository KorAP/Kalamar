package Kalamar::Plugin::KalamarErrors;
use Mojo::Base 'Mojolicious::Plugin';


# Notify types
sub _notify {
  my ($c, $json, $type, $notify_type) = @_;
  my $msgs = $json->{$type};

  return unless $msgs;

  # wrong structure
  unless (ref $msgs && ref $msgs eq 'ARRAY') {
    $c->notify(error => 'Message structure failed');
    return 1;
  }

  # Get errors
  foreach my $m (@$msgs) {

    # Error is correctly defined
    if (ref $m && ref $m eq 'ARRAY') {
      $c->notify(
        $notify_type =>
          ($m->[0] ? $m->[0] . ': ' : '') .
          ($m->[1] || 'Unknown')
        );
    }

    # Wrong structure
    else {
      $c->notify(error => 'Message structure failed');
    };
  };

  return 1;
};


# Register error plugin
sub register {
  my ($plugin, $mojo) = @_;


  # Notify on warnings
  $mojo->helper(
    notify_on_warnings => sub {
      my ($c, $json) = @_;
      return _notify($c, $json, 'warnings', 'warning');
    }
  );


  # Notify on errors
  $mojo->helper(
    notify_on_errors => sub {
      my ($c, $json) = @_;
      return _notify($c, $json, 'errors', 'error');
    }
  );

  # Catch errors and warnings
  # This won't be called for connection errors!
  $mojo->helper(
    catch_errors_and_warnings => sub {
      my ($c, $tx) = @_;
      my $err = $tx->error;

      if ($err && $err->{code} != 500) {
        $c->stash(status => $err->{code});
      };

      # Check the response
      my $res = $tx->res;
      my $json;
      $json = $res->json if $res->body;

      # There is no json and no error
      if (!$json && !$err) {

        $c->notify(error => 'JSON response is invalid');
        return; # Mojo::Promise->new->reject;
      };

      # There is json
      if ($json) {

        $c->stash(api_response => $json);

        # There are errors
        if ($c->notify_on_errors($json)) {

          # Return on errors - ignore warnings
          return;# Mojo::Promise->new->reject;
        };

        # Notify on warnings
        $c->notify_on_warnings($json);

        # What does status mean?
        if ($json->{status}) {

          $c->notify(error => 'Middleware error ' . $json->{'status'});
          return;# Mojo::Promise->new->reject;
        };
      }

      # There is an error but no json
      else {

        # Send rejection promise
        $c->notify(error => $err->{code} . ': ' . $err->{message});
        return; #Mojo::Promise->new->reject;
      };

      return $json;
    }
  );
};




1;
