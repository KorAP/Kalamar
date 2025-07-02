#!/usr/bin/env perl
use Mojolicious::Lite;
use Mojo::ByteStream 'b';
use Mojo::Date;
use Mojo::JSON qw/true false encode_json decode_json/;
use strict;
use warnings;
use Mojo::File qw/path/;
use Mojo::Util qw/slugify/;
use Kalamar::Controller::Search;

our @default_search_fields = @Kalamar::Controller::Search::search_fields;

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
  'new_client_id_2' => 'hghGHhjhFRz_gJhjrd==',
  'new_client_id_3' => 'jh0gfjhjbfdsgzjghj==',
  'new_client_secret' => 'KUMaFxs6R1WGud4HM22w3HbmYKHMnNHIiLJ2ihaWtB4N5JxGzZgyqs5GTLutrORj',
  'auth_token_1'    => 'mscajfdghnjdfshtkjcuynxahgz5il'
);

helper get_token => sub {
  my ($c, $token) = @_;
  return $tokens{$token}
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


helper 'add_client' => sub {
  my $c = shift;
  my $client = shift;
  my $list = $c->stash('oauth.client_list');
  push @$list, $client;
};

# Add plugin to plugin list for marketplace
helper 'add_plugin' => sub {
  my $c = shift;
  my $cplugin = shift;
  my $pl_list = $c->app->defaults('oauth.plugin_list');
  push @$pl_list, $cplugin;
};

helper 'add_instplugin' => sub {
   my $c = shift;
   my $cplugin = shift;
   my $pl_list = $c->app->defaults('oauth.pluginin_list');
   push @$pl_list, $cplugin; 
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
app->defaults('oauth.plugin_list' => []);
app->defaults('oauth.pluginin_list' => []);

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
  $v->optional('response-pipes');
  $v->optional('fields');
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

  if ($v->param('q') eq $Kalamar::Controller::Search::query_placeholder) {
    # Get response based on query parameter
    my $response = $c->load_response('query_baum_o0_c25_cq');
    return $c->render(%$response);
  };

  my @slug_base = ($v->param('q'));
  push @slug_base, 'o' . $v->param('offset') if defined $v->param('offset');
  push @slug_base, 'c' . $v->param('count') if defined $v->param('count');
  push @slug_base, 'co' . $v->param('cutoff') if defined $v->param('cutoff');
  push @slug_base, 'cq' if defined $v->param('cq');
  push @slug_base, 'p' . $v->param('pipes') if defined $v->param('pipes');
  push @slug_base, 'rp' . $v->param('response-pipes') if defined $v->param('response-pipes');

  if (defined $v->param('fields') && ($v->param('fields') ne join(',', @default_search_fields))) {
    push @slug_base, 'f' .join('-', split(',', $v->param('fields')));
  };

  # Get response based on query parameter
  my $response = $c->load_response('query_' . slugify(join('_', @slug_base)));

  # Check authentification
  if (my $auth = $c->req->headers->header('Authorization')) {

    $c->app->log->debug("There is an authorization header $auth");
    if ($auth =~ /^Bearer/) {
      # Username unknown in OAuth2
      $response->{json}->{meta}->{authorized} = 'yes';
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

  if ($v->param('response-pipes')) {
    $response->{json}->{meta}->{responsePipes} = $v->param('response-pipes');
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
get '/v1.0/corpus/#corpusId/#docId/#textId' => sub {
  my $c = shift;
  my $v = $c->validation;
  $v->optional('response-pipes');

  my $file = join('_', (
    'textinfo',
    $c->stash('corpusId'),
    $c->stash('docId'),
    $c->stash('textId')
  ));

  my $slug = slugify($file);

  # Get response based on query parameter
  my $response = $c->load_response($slug);

  if ($v->param('response-pipes')) {
    $response->{json}->{meta}->{responsePipes} = $v->param('response-pipes');
  };

  return $c->render(%$response);
};


# Matchinfo fixtures
get '/v1.0/corpus/#corpusId/#docId/#textId/#matchId' => sub {
  my $c = shift;
  my $v = $c->validation;
  $v->optional('response-pipes');

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

  if ($v->param('response-pipes')) {
    $response->{json}->{meta}->{responsePipes} = $v->param('response-pipes');
  };

  return $c->render(%$response);
};


# Statistics endpoint
get '/v1.0/statistics' => sub {
  my $c = shift;
  my $v = $c->validation;
  $v->optional('cq');
  $v->optional('response-pipes', 'trim');

  my @list = 'corpusinfo';
  if ($v->param('cq')) {
    push @list, $v->param('cq');
  };
  my $slug = slugify(join('_', @list));

  # Get response based on query parameter
  my $response = $c->load_response($slug);

  if ($v->param('response-pipes')) {
    my $meta = $response->{json}->{meta} // {};
    $meta->{responsePipes} = $v->param('response-pipes');
    $response->{json}->{meta} = $meta;
  };

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
    if ($pwd eq 'ldaperr') {
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
    if ($c->param('code') && $c->param('code') eq $tokens{auth_token_1}) {
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
  my $src  = $json->{source};
  my $redirect_uri = $json->{redirect_uri};

  my $list = $c->app->defaults('oauth.client_list');

  my $obj = {
    "client_id" => $tokens{new_client_id},
    "client_name" => $name,
    "client_description" => $desc,
    "client_url" => $url,
    "client_redirect_uri" => $redirect_uri,
    "client_type" => $type
  };

  # Plugin!
  if ($src) {
    $obj->{source} = $src;
    $obj->{client_id} = $tokens{new_client_id_3};
  };

  push @$list, $obj;

  if ($redirect_uri && $redirect_uri =~ /FAIL$/) {
    return $c->render(
      status => 400,
      json => {
        "error_description" => $redirect_uri . " is invalid.",
        "error" => "invalid_request"
      }
    )
  };

  # Confidential server application
  if ($type eq 'CONFIDENTIAL') {

    return $c->render(json => {
      client_id => $tokens{new_client_id_2},
      client_secret => $tokens{new_client_secret}
    });
  };

  # Desktop application
  return $c->render(json => {
    client_id => $tokens{new_client_id}
  });
};

# Mock API list plugins
post '/v1.0/plugins' => sub {
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

  return $c->render(
   json => $c->stash('oauth.plugin_list'),
   status => 200
  );
};

# Mock API list installed plugins
post '/v1.0/plugins/installed' => sub {
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

  return $c->render(
    json => $c->stash('oauth.pluginin_list'),
    status => 200
  );
};


# Mock API plugin installation
post '/v1.0/plugins/install' => sub {
  my $c = shift;
  my $v = $c->validation;
  $v->required('super_client_id');
  $v->required('super_client_secret');
  $v->required('client_id');
  my $cl_id = $c->param('client_id');
  if ($v->has_error) {
    return $c->render(
      json => [],
      status => 400
    );
  };
  
  my $date = "2022-12-13T16:33:27.621+01:00[Europe/Berlin]";
  my $pl_list =  $c->app->defaults('oauth.plugin_list');
  my $cl_name = (grep{($_->{client_id} eq $cl_id)}@$pl_list)[0]->{client_name};
  
  if (length $cl_name){
    
    my %inst_plugin = (
      "name" => $cl_name,
      "client_id" => $cl_id,
      "installed_date" => $date,
      );

    $c->add_instplugin(\%inst_plugin);
 
    return $c->render(
      json => %inst_plugin,
      status => 200
    );
  }

  return $c->render(
    json => [],
    status => 400
  );
};

# Mock API plugin uninstallation
post '/v1.0/plugins/uninstall' => sub {
  my $c = shift;
  my $v = $c->validation;
  $v->required('super_client_id');
  $v->required('super_client_secret');
  $v->required('client_id');
  if ($v->has_error) {
    return $c->render(
      json => [],
      status => 400
    );
  };
  my $cl_id = $c->param('client_id');

  my $plin_list =  $c->app->defaults('oauth.pluginin_list');
  my @new_list = grep{!($_->{client_id} eq $cl_id)}@$plin_list;
  $c->app->defaults('oauth.pluginin_list' => \@new_list);
  
  if(scalar @new_list eq scalar @$plin_list){
    return $c->render(
      status => 404
     );
  }
  return $c->render(
   json => $c->stash('oauth.pluginin_list'),
    status => 200
  );
  };

# Register a client
post '/v1.0/oauth2/client/list' => sub {
  my $c = shift;

  my $v = $c->validation;
  $v->required('super_client_id');
  $v->required('super_client_secret');

  $v->optional('filter_by' );
  $v->optional('authorized_only' );

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

# Get client info
post '/v1.0/oauth2/client/:client_id' => sub {
  my $c = shift;

  # Validate input
  my $v = $c->validation;
  $v->required('super_client_id');
  $v->required('super_client_secret');

  if ($v->has_error) {
    return $c->render(
      status => 400,
      json => {
        error_description => "No super client",
        error => "no_superclient"
      }
    );
  };

  my $client_id = $c->stash('client_id');

  my $list = $c->stash('oauth.client_list');

  foreach (@$list) {
    if ($_->{client_id} eq $client_id) {
      return $c->render(
        json => $_,
        status => 200
      );
    };
  };

  return $c->render(
    json => {
      error_description => "Unknown client with $client_id.",
      error => "invalid_client"
    },
    status => 401
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
  my $scope = $c->param('scope');
  my $state = $c->param('state');
  my $redirect_uri = $c->param('redirect_uri') // 'NO';

  if ($type eq 'code' && $client_id eq 'xyz') {

    if ($state eq 'fail') {
      $c->res->headers->location(
        Mojo::URL->new($redirect_uri)->query({
          error_description => 'FAIL'
        })
        );
      $c->res->code(400);
      return $c->rendered;
    };

    if (index($redirect_uri,'http://wrong') >= 0) {
      return $c->render(
        code => 400,
        content_type => 'text/plain',
        text => '{"error_description":"Invalid redirect URI","state":"ZMwDGTZ2RY","error":"invalid_request"}'
      );
    };

    return $c->redirect_to(
      Mojo::URL->new($redirect_uri)->query({
        code => $tokens{auth_token_1},
        scope => $scope,
      })
      );
  }

  elsif ($type eq 'code') {
    my $loc = Mojo::URL->new($redirect_uri)->query({
      code => $tokens{auth_token_1},
      scope => 'match_info search openid'
    });

    my $res = $c->res;
    $res->headers->location($loc);
    return $c->rendered($client_id eq '307' ? 307 : 302);
    # return $c->rendered(302);
  };

  return $c->render(
    code => 400,
    content_type => 'text/plain',
    content => 'Unknown'
  );
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

get '/fakeclient/return' => sub {
  my $c = shift;
  $c->render(
    text => 'welcome back! [' . $c->param('code') . ']'
  );
} => 'return_uri';


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
