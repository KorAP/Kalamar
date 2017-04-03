#!/usr/bin/env perl
use Mojolicious::Lite;
use Mojo::ByteStream 'b';
use Mojo::Date;

# This is an API fake server with fixtures

# Request API token
get '/auth/apiToken' => sub {
  my $c = shift;

  # Get auth header
  my $auth = $c->req->headers->authorization;

  # Authorization missing or not basic
  if (!$auth || $auth =~ s/\s*Basic\s+//gi) {
    return $c->render(
      json => {
        error => [2, 'x']
      }
    );
  };

  # Decode header
  my ($username, $pwd) = @{b($auth)->b64_decode->split(':')->to_array};

  if ($pwd eq 'test') {

    # Render info with token
    return $c->render(
      json => {
        username => $username,
        expires => Mojo::Date->new(time + (3 * 34 * 60 * 60)),
        token => 'abcdefg',
        token_type => 'api_token'
      }
    );
  };

  return $c->render(
    json => {
      error => []
    }
  );
};

app->start;

1;
