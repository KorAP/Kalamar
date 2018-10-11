#!/usr/bin/env perl
use Mojolicious::Lite;
use Mojo::ByteStream 'b';
use Mojo::Date;
use Mojo::JSON qw/true false encode_json decode_json/;
use strict;
use warnings;
use Mojo::JWT;
use Mojo::File;

# This is an API fake server with fixtures

my $secret = 's3cr3t';

helper jwt_encode => sub {
  shift;
  return Mojo::JWT->new(
    secret => $secret,
    token_type => 'api_token',
    expires => time + (3 * 34 * 60 * 60),
    claims => { @_ }
  );
};

helper jwt_decode => sub {
  my ($c, $auth) = @_;
  $auth =~ s/\s*api_token\s+//;
  return Mojo::JWT->new(secret => $secret)->decode($auth);
};


# Base page
get '/' => sub {
  shift->render(text => 'Query fake server available');
};

# Search fixtures
get '/search' => sub {
  my $c = shift;
  my $v = $c->validation;
  $v->optional('q');
  $v->optional('page');
  $v->optional('ql');
  $v->optional('count');
  $v->optional('context');

  # Response q=x&ql=cosmas3
  if ($v->param('ql') && $v->param('ql') eq 'cosmas3') {
    return $c->render(
      status => 400,
      json => {
        "\@context" => "http://korap.ids-mannheim.de/ns/koral/0.3/context.jsonld",
        "errors" => [[307,"cosmas3 is not a supported query language!"]]
      });
  };

  if ($v->param('q')) {

    my $q = $v->param('q');

    # Response q=server_fail
    if ($q eq 'server_fail') {
      return $c->render(
        status => 500,
        inline => 'Oooops'
      );
    }

    # Response q=[orth=das
    if ($q eq '[orth=das') {
      return $c->render(
        status => 400,
        json => {
          "\@context" => "http://korap.ids-mannheim.de/ns/koral/0.3/context.jsonld",
          "errors" => [
            [302,"Parantheses/brackets unbalanced.",0],
            [302,"Could not parse query >>> [orth=das <<<."]
          ]
        }
      );
    }
  };

  my $response = decode_json(
    Mojo::File->new(__FILE__)->parent->child('response_baum.jsonld')
    );


  # Check authentification
  if (my $auth = $c->req->headers->header('Authorization')) {
    if (my $jwt = $c->jwt_decode($auth)) {
      $response->{meta}->{authorized} = $jwt->{username} if $jwt->{username};
    };
  };

  if ($v->param('page')) {
    $response->{meta}->{startIndex} = $v->param("startIndex");
  };


  # Simple search fixture
  return $c->render(
    json => $response
  );
};



############
# Auth API #
############

# Request API token
get '/auth/logout' => sub {
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
