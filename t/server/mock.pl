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

our %tokens = (
  'access_token'    => "4dcf8784ccfd26fac9bdb82778fe60e2",
  'refresh_token'   => "hlWci75xb8atDiq3924NUSvOdtAh7Nlf9z",
  'access_token_2'  => "abcde",
  'access_token_3' => 'jvgjbvjgzucgdwuiKHJK',
  'refresh_token_2' => "fghijk",
  'new_client_id' => 'fCBbQkA2NDA3MzM1Yw==',
  'new_client_secret' => 'KUMaFxs6R1WGud4HM22w3HbmYKHMnNHIiLJ2ihaWtB4N5JxGzZgyqs5GTLutrORj',
  'auth_token_1'    => 'mscajfdghnjdfshtkjcuynxahgz5il'
);

helper get_token => sub {
  my ($c, $token) = @_;
  return $tokens{$token}
};

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

# Expiration helper
helper expired => sub {
  my ($c, $auth, $set) = @_;

  $auth =~ s/^[^ ]+? //;
  if ($set) {
    $c->app->log->debug("Set $auth for expiration");
    $c->app->defaults('auth_' . $auth => 1);
    return 1;
  };

  $c->app->log->debug("Check $auth for expiration: " . (
    $c->app->defaults('auth_' . $auth) // '0'
  ));

  return $c->app->defaults('auth_' . $auth);
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

app->defaults('oauth.client_list' => []);


# Base page
get '/v1.0/' => sub {
  shift->render(text => 'Fake server available');
};


get '/v1.0/redirect-target-a' => sub {
  shift->render(text => 'Redirect Target!');
} => 'redirect-target';


# Base page
get '/v1.0/redirect' => sub {
  my $c = shift;
  $c->res->code(308);
  $c->res->headers->location($c->url_for('redirect-target')->to_abs);
  return $c->render(text => '');
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
  $v->optional('pipes');
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

  if ($v->param('q') eq 'error') {
    return $c->render(
      status => 500,
      inline => '<html><head>ERROR</head></html>'
    );
  };

  my @slug_base = ($v->param('q'));
  push @slug_base, 'o' . $v->param('offset') if defined $v->param('offset');
  push @slug_base, 'c' . $v->param('count') if defined $v->param('count');
  push @slug_base, 'co' . $v->param('cutoff') if defined $v->param('cutoff');
  push @slug_base, 'cq' if defined $v->param('cq');
  push @slug_base, 'p' . $v->param('pipes') if defined $v->param('pipes');

  # Get response based on query parameter
  my $response = $c->load_response('query_' . slugify(join('_', @slug_base)));

  # Check authentification
  if (my $auth = $c->req->headers->header('Authorization')) {

    $c->app->log->debug("There is an authorization header $auth");
    my $jwt;
    if ($auth =~ /^Bearer/) {
      # Username unknown in OAuth2
      $response->{json}->{meta}->{authorized} = 'yes';
    }
    elsif ($auth =~ /^api_token/ && ($jwt = $c->jwt_decode($auth))) {
      $response->{json}->{meta}->{authorized} = $jwt->{username} if $jwt->{username};
    };

    # Code is expired
    if ($c->expired($auth)) {

      $c->app->log->debug("The access token has expired");

      return $c->render(
        status => 401,
        json => {
          errors => [[2003,  'Access token is expired']]
        }
      );
    }

    # Auth token is invalid
    if ($auth =~ /^Bearer inv4lid/) {
      $c->app->log->debug("The access token is invalid");

      return $c->render(
        status => 401,
        json => {
          errors => [[2011,  'Access token is invalid']]
        }
      );
    }
  };

  if ($v->param('pipes')) {
    $response->{json}->{meta}->{pipes} = $v->param('pipes');
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
  $v->optional('cq');

  my @list = 'corpusinfo';
  if ($v->param('cq')) {
    push @list, $v->param('cq');
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

    if ($auth =~ /^Bearer/) {
      $c->app->log->debug('Server-Logout: ' . $auth);
      return $c->render(json => { msg => [[0, 'Fine!']]});
    }

    elsif (my $jwt = $c->jwt_decode($auth)) {
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
    elsif ($c->param('username') !~ /^t.st$/) {
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
        "access_token" => $c->get_token('access_token'),
        "refresh_token" => $c->get_token('refresh_token'),
        "scope" => "all",
        "token_type" => "Bearer",
        "expires_in" => 86400
      });
  }

  # Refresh token
  elsif ($grant_type eq 'refresh_token') {

    if ($c->param('refresh_token') eq 'inv4lid') {
      return $c->render(
        status => 400,
        json => {
          "error_description" => "Refresh token is expired",
          "error" => "invalid_grant"
        }
      );
    };

    $c->app->log->debug("Refresh the token in the mock server!");

    return $c->render(
      status => 200,
      json => {
        "access_token" => $c->get_token("access_token_2"),
        "refresh_token" => $c->get_token("refresh_token_2"),
        "token_type" => "Bearer",
        "expires_in" => 86400
      }
    );
  }

  # Get auth_token_1
  elsif ($grant_type eq 'authorization_code') {
    if ($c->param('code') eq $tokens{auth_token_1}) {
      return $c->render(
        status => 200,
        json => {
          "access_token" => $tokens{access_token_3},
          "expires_in" => 31536000,
          "scope" => 'match_info search openid',
          "token_type" => "Bearer"
        }
      );
    };
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

# Revoke API token
post '/v1.0/oauth2/revoke' => sub {
  my $c = shift;

  my $refresh_token = $c->param('token');

  if ($c->param('client_secret') ne 'k414m4r-s3cr3t') {
    return $c->render(
      json => {
        "error_description" => "Invalid client credentials",
        "error" => "invalid_client"
      },
      status => 401
    );
  };

  return $c->render(
    text => ''
  )
};

# Register a client
post '/v1.0/oauth2/client/register' => sub {
  my $c = shift;
  my $json = $c->req->json;

  if ($json->{redirectURI}) {
    return $c->render(
      status => 400,
      json => {
        errors => [
          [
            201,
            "Unrecognized field \"redirectURI\" (class de.ids_mannheim.korap.web.input.OAuth2ClientJson), not marked as ignorable (5 known properties: \"redirect_uri\", \"type\", \"name\", \"description\", \"url\"])\n at [Source: (org.eclipse.jetty.server.HttpInputOverHTTP); line: 1, column: 94] (through reference chain: de.ids_mannheim.korap.web.input.OAuth2ClientJson[\"redirectURI\"])"
          ]
        ]
      }
    );
  };

  my $name = $json->{name};
  my $desc = $json->{description};
  my $type = $json->{type};
  my $url  = $json->{url};
  my $redirect_url = $json->{redirect_uri};

  my $list = $c->app->defaults('oauth.client_list');

  push @$list, {
    "client_id" => $tokens{new_client_id},
    "client_name" => $name,
    "client_description" => $desc,
    "client_url" => $url
  };

  # Confidential server application
  if ($type eq 'CONFIDENTIAL') {
    return $c->render(json => {
      client_id => $tokens{new_client_id},
      client_secret => $tokens{new_client_secret}
    });
  };

  # Desktop application
  return $c->render(json => {
    client_id => $tokens{new_client_id}
  });
};


# Register a client
post '/v1.0/oauth2/client/list' => sub {
  my $c = shift;

  my $v = $c->validation;

  $v->required('super_client_id');
  $v->required('super_client_secret');

  if ($v->has_error) {
    return $c->render(
      json => [],
      status => 400
    );
  };

  # $c->param('client_secret');

  # Is empty [] when nothing registered

  return $c->render(
    json => $c->stash('oauth.client_list'),
    status => 200
  );
};


# Get token list
post '/v1.0/oauth2/token/list' => sub {
  my $c = shift;
  return $c->render(json => [
    {
      "client_description" => "Nur ein Beispiel",
      "client_id" => $tokens{new_client_id},
      "client_name" => "Beispiel",
      "client_url" => "",
      "created_date" => "2021-04-14T19:40:26.742+02:00[Europe\/Berlin]",
      "expires_in" => "31533851",
      "scope" => [
        "match_info",
        "search",
        "openid"
      ],
      "token" => "jhkhkjhk_hjgjsfz67i",
      "user_authentication_time" => "2021-04-14T19:39:41.81+02:00[Europe\/Berlin]"
    }
  ]);
};

del '/v1.0/oauth2/client/deregister/:client_id' => sub {
  my $c = shift;
  my $client_id = $c->stash('client_id');

  my $list = $c->app->defaults('oauth.client_list');

  my $break = -1;
  for (my $i = 0; $i < @$list; $i++) {
    if ($list->[$i]->{client_id} eq $client_id) {
      $break = $i;
      last;
    };
  };

  if ($break != -1) {
    splice @$list, $break, 1;
  }

  else {
    return $c->render(
      json => {
        error_description => "Unknown client with $client_id.",
        error => "invalid_client"
      },
      status => 401
    );
  };

  return $c->render(
    json => $c->stash('oauth.client_list'),
    status => 200
  );
};

post '/v1.0/oauth2/authorize' => sub {
  my $c = shift;
  my $type = $c->param('response_type');
  my $client_id = $c->param('client_id');
  my $redirect_uri = $c->param('redirect_uri');

  if ($type eq 'code') {

    return $c->redirect_to(
      Mojo::URL->new($redirect_uri)->query({
        code => $tokens{auth_token_1},
        scope => 'match_info search openid'
      })
      );
  }
};


#######################
# Query Reference API #
#######################

use CHI;
my $chi = CHI->new(
  driver => 'Memory',
  global => 1
);

# Store query
put '/v1.0/query/~:user/:query_name' => sub {
  my $c = shift;
  my $user = $c->stash('user');
  my $qname = $c->stash('query_name');

  if ($chi->is_valid($qname)) {
    return $c->render(
      json => {
        errors => [
          {
            message => 'Unable to store query reference'
          }
        ]
      }, status => 400
    );
  };

  my $json = $c->req->json;

  my $store = {
    name => $qname,
    koralQuery => { '@type' => 'Okay' },
    query => $json->{query},
    queryType => $json->{queryType},
    type => $json->{type},
    queryLanguage => $json->{queryLanguage},
  };

  if (exists $json->{description}) {
    $store->{description} = $json->{description}
  };

  # Set query reference
  $chi->set($qname => $store);

  my $queries = $chi->get('~queries') // [];
  push @$queries, $qname;
  $chi->set('~queries' => $queries);

  return $c->render(
    status => 201,
    text => ''
  );
};

# Get query
get '/v1.0/query/~:user/:query_name' => sub {
  my $c = shift;

  my $user = $c->stash('user');
  my $qname = $c->stash('query_name');

  my $json = $chi->get($qname);

  if ($json) {
    return $c->render(
      json => $json
    );
  };

  return $c->render(
    json => {
      errors => [
        {
          message => 'Query reference not found'
        }
      ]
    }, status => 404
  );
};


# Get all queries
get '/v1.0/query/~:user' => sub {
  my $c = shift;
  my $user = $c->stash('user');
  my $qs = $chi->get('~queries') // [];
  my @queries = ();
  foreach (@$qs) {
    push @queries, $chi->get($_);
  };
  return $c->render(json => { refs => \@queries });
};


# Store query
del '/v1.0/query/~:user/:query_name' => sub {
  my $c = shift;
  my $user = $c->stash('user');
  my $qname = $c->stash('query_name');

  $chi->remove($qname);

  my $queries = $chi->get('~queries') // [];

  my @clean = ();
  foreach (@$queries) {
    push @clean, $_ unless $_ eq $qname
  };

  $chi->set('~queries' => \@clean);

  return $c->render(
    status => 200,
    text => ''
  );
};

post '/v1.0/oauth2/revoke/super' => sub {
  my $c = shift;

  my $s_client_id = $c->param('super_client_id');
  my $s_client_secret = $c->param('super_client_secret');
  my $token = $c->param('token');

  return $c->render(text => 'SUCCESS');
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
