#!/usr/bin/env perl
use Mojolicious::Lite;
use Mojo::ByteStream 'b';
use Mojo::Date;
use Mojo::JSON qw/true false encode_json decode_json/;
use strict;
use warnings;
use Mojo::JWT;
use Mojo::File qw/path/;
use Mojo::Util qw/slugify/;

# This is an API fake server with fixtures

my $secret = 's3cr3t';
my $fixture_path = path(Mojo::File->new(__FILE__)->dirname)->child('..', 'fixtures');

# Legacy:
helper jwt_encode => sub {
  shift;
  return Mojo::JWT->new(
    secret => $secret,
    token_type => 'api_token',
    expires => time + (3 * 34 * 60 * 60),
    claims => { @_ }
  );
};

# Legacy;
helper jwt_decode => sub {
  my ($c, $auth) = @_;
  $auth =~ s/\s*api_token\s+//;
  return Mojo::JWT->new(secret => $secret)->decode($auth);
};


# Load fixture responses
helper 'load_response' => sub {
  my $c = shift;
  my $q_name = shift;
  my $file = $fixture_path->child("response_$q_name.json");
  $c->app->log->debug("Load response from $file");

  unless (-f $file) {
    return {
      status => 500,
      json => {
        errors => [[0, 'Unable to load query response from ' . $file]]
      }
    }
  };

  my $response = $file->slurp;
  my $decode = decode_json($response);
  unless ($decode) {
    return {
      status => 500,
      json => {
        errors => [[0, 'Unable to parse JSON']]
      }
    }
  };

  return $decode;
};


# Base page
get '/v1.0/' => sub {
  shift->render(text => 'Fake server available');
};


# Search fixtures
get '/v1.0/search' => sub {
  my $c = shift;
  my $v = $c->validation;
  $v->optional('q');
  $v->optional('page');
  $v->optional('ql');
  $v->optional('cq');
  $v->optional('count');
  $v->optional('context');
  $v->optional('offset');
  $v->optional('cutoff')->in(qw/true false/);

  $c->app->log->debug('Receive request');

  # Response q=x&ql=cosmas3
  if ($v->param('ql') && $v->param('ql') eq 'cosmas3') {
    return $c->render(
      status => 400,
      json => {
        "\@context" => "http://korap.ids-mannheim.de/ns/koral/0.3/context.jsonld",
        "errors" => [[307,"cosmas3 is not a supported query language!"]]
      });
  };

  if (!$v->param('q')) {
    return $c->render(%{$c->load_response('query_no_query')});
  };

  my @slug_base = ($v->param('q'));
  push @slug_base, 'o' . $v->param('offset') if defined $v->param('offset');
  push @slug_base, 'c' . $v->param('count') if defined $v->param('count');
  push @slug_base, 'co' . $v->param('cutoff') if defined $v->param('cutoff');
  push @slug_base, 'cq' if defined $v->param('cq');

  # Get response based on query parameter
  my $response = $c->load_response('query_' . slugify(join('_', @slug_base)));

  # Check authentification
  if (my $auth = $c->req->headers->header('Authorization')) {

    my $jwt;
    if ($auth =~ /^Bearer/) {
      # Username unknown in OAuth2
      $response->{json}->{meta}->{authorized} = 'yes';
    }
    elsif ($jwt = $c->jwt_decode($auth)) {
      $response->{json}->{meta}->{authorized} = $jwt->{username} if $jwt->{username};
    };
  };

  # Set page parameter
  if ($v->param('page')) {
    $response->{json}->{meta}->{startIndex} = $v->param("startIndex");
  };

  # Simple search fixture
  $c->render(%$response);

  $c->app->log->debug('Rendered result');

  return 1;
};

# Textinfo fixtures
get '/v1.0/corpus/:corpusId/:docId/:textId' => sub {
  my $c = shift;

  my $file = join('_', (
    'textinfo',
    $c->stash('corpusId'),
    $c->stash('docId'),
    $c->stash('textId')
  ));

  my $slug = slugify($file);

  # Get response based on query parameter
  my $response = $c->load_response($slug);
  return $c->render(%$response);
};


# Matchinfo fixtures
get '/v1.0/corpus/:corpusId/:docId/:textId/:matchId/matchInfo' => sub {
  my $c = shift;

  my $file = join('_', (
    'matchinfo',
    $c->stash('corpusId'),
    $c->stash('docId'),
    $c->stash('textId'),
    $c->stash('matchId')
  ));

  my $slug = slugify($file);

  # Get response based on query parameter
  my $response = $c->load_response($slug);
  return $c->render(%$response);
};


# Statistics endpoint
get '/v1.0/statistics' => sub {
  my $c = shift;
  my $v = $c->validation;
  $v->optional('corpusQuery');

  my @list = 'corpusinfo';
  if ($v->param('corpusQuery')) {
    push @list, $v->param('corpusQuery');
  };
  my $slug = slugify(join('_', @list));

  # Get response based on query parameter
  my $response = $c->load_response($slug);
  return $c->render(%$response);
};

############
# Auth API #
############

# Request API token
get '/v1.0/auth/logout' => sub {
  my $c = shift;

  if (my $auth = $c->req->headers->header('Authorization')) {
    if (my $jwt = $c->jwt_decode($auth)) {
      my $user = $jwt->{username} if $jwt->{username};

      $c->app->log->debug('Server-Logout: ' . $user);
      return $c->render(json => { msg => [[0, 'Fine!']]});
    };
  };

  return $c->render(status => 400, json => { error => [[0, 'No!']]});
};


# Request API token
get '/v1.0/auth/apiToken' => sub {
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
      my $jwt = $c->jwt_encode(username => $username);

      # Render in the Kustvakt fashion:
      return $c->render(
        format => 'html',
        text => encode_json({
          %{$jwt->claims},
          expires    => $jwt->expires,
          token      => $jwt->encode,
          token_type => 'api_token'
        })
      );
    }

    elsif ($pwd eq 'ldaperr') {
      return $c->render(
        format => 'html',
        status => 401,
        json => {
          "errors" => [[2022,"LDAP Authentication failed due to unknown user or password!"]]
        }
      );
    };

    return $c->render(
      json => {
        error => [[2004, undef]]
      }
    );
  };

  return $c->render(
    json => {
      error => [[2004, undef]]
    }
  );
};


# Request API token
post '/v1.0/oauth2/token' => sub {
  my $c = shift;

  my $grant_type = $c->param('grant_type') // 'undefined';

  if ($grant_type eq 'password') {

    # Check for wrong client id
    if ($c->param('client_id') ne '2') {
      return $c->render(
        json => {
          "error_description" => "Unknown client with " . $_->{client_id},
          "error" => "invalid_client"
        },
        status => 401
      );
    }

    # Check for wrong client secret
    elsif ($c->param('client_secret') ne 'k414m4r-s3cr3t') {
      return $c->render(
        json => {
          "error_description" => "Invalid client credentials",
          "error" => "invalid_client"
        },
        status => 401
      );
    }

    # Check for wrong user name
    elsif ($c->param('username') ne 'test') {
      return $c->render(json => {
        error => [[2004, undef]]
      });
    }

    # Check for ldap error
    elsif ($c->param('password') eq 'ldaperr') {
      return $c->render(
        format => 'html',
        status => 401,
        json => {
          "errors" => [
            [
              2022,
              "LDAP Authentication failed due to unknown user or password!"
            ]
          ]
        }
      );
    }

    # Check for wrong password
    elsif ($c->param('password') ne 'pass') {
      return $c->render(json => {
        format => 'html',
        status => 401,
        "errors" => [[2022,"LDAP Authentication failed due to unknown user or password!"]]
      });
    }

    # Return fine access
    return $c->render(
      json => {
        "access_token" => "4dcf8784ccfd26fac9bdb82778fe60e2",
        "refresh_token" => "hlWci75xb8atDiq3924NUSvOdtAh7Nlf9z",
        "scope" => "all",
        "token_type" => "Bearer",
        "expires_in" => 86400
      });
  }

  # Refresh token
  elsif ($grant_type eq 'refresh_token') {
    return $c->render(
      status => 200,
      json => {
        "access_token" => "abcde",
        "refresh_token" => "fghijk",
        "token_type" => "Bearer",
        "expires_in" => 86400
      }
    );
  }

  # Unknown token grant
  else {
    return $c->render(
      status => 400,
      json => {
        "errors" => [
          [
            0, "Grant Type unknown", $grant_type
          ]
        ]
      }
    )
  }
};



app->start;


__END__


  # Temporary:
  my $collection_query = {
    '@type' => "koral:docGroup",
    "operation" => "operation:or",
    "operands" => [
      {
	'@type' => "koral:docGroup",
	"operation" => "operation:and",
	"operands" => [
	  {
	    '@type' => "koral:doc",
	    "key" => "title",
	    "match" => "match:eq",
	    "value" => "Der Birnbaum",
	    "type" => "type:string"
	  },
	  {
	    '@type' => "koral:doc",
	    "key" => "pubPlace",
	    "match" => "match:eq",
	    "value" => "Mannheim",
	    "type" => "type:string"
	  },
	  {
	    '@type' => "koral:docGroup",
	    "operation" => "operation:or",
	    "operands" => [
	      {
		'@type' => "koral:doc",
		"key" => "subTitle",
		"match" => "match:eq",
		"value" => "Aufzucht oder Pflege",
		"type" => "type:string"
	      },
	      {
		'@type' => "koral:doc",
		"key" => "subTitle",
		"match" => "match:eq",
		"value" => "Gedichte",
		"type" => "type:string"
	      }
	    ]
	  }
	]
      },
      {
	'@type' => "koral:doc",
	"key" => "pubDate",
	"match" => "match:geq",
	"value" => "2015-03-05",
	"type" => "type:date"
      }
    ]
  };
