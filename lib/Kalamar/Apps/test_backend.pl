#!/usr/bin/env perl
use Mojolicious::Lite;
use Mojo::ByteStream 'b';
use Mojo::Date;
use strict;
use warnings;
use Mojo::JWT;

# This is an API fake server with fixtures

helper jwt => sub {
  shift;
  Mojo::JWT->new(
    secret => 's3cr3t',
    token_type => 'api_token',
    expires => Mojo::Date->new(time + (3 * 34 * 60 * 60)),
    claims => { @_ }
  );
};


# Base page
get '/' => sub {
  shift->render(text => 'Fake server available');
};


# Request API token
get '/auth/apiToken' => sub {
  my $c = shift;

  # Get auth header
  my $auth = $c->req->headers->authorization;

  # Authorization missing or not basic
  if (!$auth || $auth !~ s/\s*Basic\s+//gi) {
    return $c->render(
      json => {
        error => [[2, 'x']]
      }
    );
  };

  # Decode header
  my ($username, $pwd) = @{b($auth)->b64_decode->split(':')->to_array};


  # the password is 'pass'
  if ($pwd) {

    # the password is 'pass'
    if ($pwd eq 'pass') {

      # Render info with token
      return $c->render($c->jwt(username => $username));
    };

    return $c->render(
      json => {
        error => [[3, 'x']]
      }
    );
  };

  return $c->render(
    json => {
      error => [[4, 'x']]
    }
  );
};

app->start;
