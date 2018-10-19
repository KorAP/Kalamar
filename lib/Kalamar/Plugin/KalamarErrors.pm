package Kalamar::Plugin::KalamarErrors;
use Mojo::Base 'Mojolicious::Plugin';


# Register error plugin
sub register {
  my ($plugin, $mojo) = @_;


  # Notify on warnings
  $mojo->helper(
    notify_on_warnings => sub {
      my ($c, $json) = @_;

      my $warnings = $json->{warnings};

      return unless $warnings;

      # TODO: Check for ref!
      foreach my $w (@$warnings) {
        $c->notify(
          warn =>
            ($w->[0] ? $w->[0] . ': ' : '') .
            $w->[1]
          );
      };

      return 1;
    }
  );

  # Notify on errors
  $mojo->helper(
    notify_on_errors => sub {
      my ($c, $json) = @_;

      my $errors = $json->{errors};

      return unless $errors;

      foreach my $e (@$errors) {
        $c->notify(
          error =>
            ($e->[0] ? $e->[0] . ': ' : '') .
            ($e->[1] || 'Unknown')
          );
      };

      return 1;
    }
  );

  # Catch connection errors
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
        return Mojo::Promise->new->reject;
      };

      # There is json
      if ($json) {
        $c->stash(api_response => $json);

        # TODO:
        #   Check for references of errors and warnings!

        # There are errors
        if ($c->notify_on_errors($json)) {

          # Return on errors - ignore warnings
          return Mojo::Promise->new->reject;
        };

        # Notify on warnings
        $c->notify_on_warnings($json);

        # What does status mean?
        if ($json->{status}) {

          $c->notify(error => 'Middleware error ' . $json->{'status'});
          return Mojo::Promise->new->reject;
        };
      }

      # There is an error but no json
      else {

        # Send rejection promise
        $c->notify(error => $err->{code} . ': ' . $err->{message});
        return Mojo::Promise->new->reject;
      };

      return $json;
    }
  );
};




1;
