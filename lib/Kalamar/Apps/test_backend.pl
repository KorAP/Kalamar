#!/usr/bin/env perl
use Mojolicious::Lite;
use Mojo::ByteStream 'b';
use Mojo::Date;
use Mojo::JSON qw/true false encode_json/;
use strict;
use warnings;
use Mojo::JWT;

# This is an API fake server with fixtures

# TODO: Test the fake server

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
  shift->render(text => 'Fake server available');
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

  # Check for Baum
  my $response = {
    "\@context" => "http://korap.ids-mannheim.de/ns/KoralQuery/v0.3/context.jsonld",
    "meta" => {
      "count" => 25,
      "startIndex" => 0,
      "authorized" => undef,
      "timeout" => 120000,
      "context" => {
        "left" => ["token",40],
        "right" => ["token",40]
      },
      "fields" => ["pubDate","subTitle","author","pubPlace","title","textSigle","UID","ID","layerInfos","corpusSigle","docSigle","corpusID","textClass"],
      "version" => "0.55.7",
      "benchmark" => "0.120577834 s",
      "totalResults" => 51,
      "serialQuery" => "tokens:s:Baum",
      "itemsPerPage" => 25
    },
    "query" => {
      "\@type" => "koral:token",
      "wrap" => {
        "\@type" => "koral:term",
        "layer" => "orth",
        "key" => "Baum",
        "match" => "match:eq",
        "foundry" => "opennlp",
        "rewrites" => [
          {
              "\@type" => "koral:rewrite",
              "src" => "Kustvakt",
              "operation" => "operation:injection",
              "scope" => "foundry"
            }
        ]
      }
    },
    "matches" => [
      {
        "field" => "tokens",
        "pubPlace" => "München",
        "textSigle" => "GOE/AGI/00000",
        "docSigle" => "GOE/AGI",
        "corpusSigle" => "GOE",
        "title" => "Italienische Reise",
        "subTitle" => "Auch ich in Arkadien!",
        "author" => "Goethe, Johann Wolfgang von",
        "layerInfos" => "base/s=spans corenlp/c=spans corenlp/p=tokens corenlp/s=spans dereko/s=spans malt/d=rels mdp/d=rels opennlp/p=tokens opennlp/s=spans tt/l=tokens tt/p=tokens tt/s=spans",
        "startMore" => true,
        "endMore" => true,
        "snippet" => "<span class=\"context-left\"><span class=\"more\"></span>sie etwas bedeuten zu wollen und machte mit der Oberlippe eine fatale Miene. ich sprach sehr viel mit ihr durch, sie war überall zu Hause und merkte gut auf die Gegenstände. so fragte sie mich einmal, was das für ein </span><span class=\"match\"><mark>Baum</mark></span><span class=\"context-right\"> sei. es war ein schöner großer Ahorn, der erste, der mir auf der ganzen Reise zu Gesichte kam. den hatte sie doch gleich bemerkt und freute sich, da mehrere nach und nach erschienen, daß sie auch diesen Baum unterscheiden könne<span class=\"more\"></span></span>",
        "matchID" => "match-GOE/AGI/00000-p2030-2031",
        "UID" => 0,
        "pubDate" => "1982"
      },
      {
        "field" => "tokens",
        "pubPlace" => "München",
        "textSigle" => "GOE/AGI/00000",
        "docSigle" => "GOE/AGI",
        "corpusSigle" => "GOE",
        "title" => "Italienische Reise",
        "subTitle" => "Auch ich in Arkadien!",
        "author" => "Goethe, Johann Wolfgang von",
        "layerInfos" => "base/s=spans corenlp/c=spans corenlp/p=tokens corenlp/s=spans dereko/s=spans malt/d=rels mdp/d=rels opennlp/p=tokens opennlp/s=spans tt/l=tokens tt/p=tokens tt/s=spans",
        "startMore" => true,
        "endMore" => true,
        "snippet" => "<span class=\"context-left\"><span class=\"more\"></span>für ein Baum sei. es war ein schöner großer Ahorn, der erste, der mir auf der ganzen Reise zu Gesichte kam. den hatte sie doch gleich bemerkt und freute sich, da mehrere nach und nach erschienen, daß sie auch diesen </span><span class=\"match\"><mark>Baum</mark></span><span class=\"context-right\"> unterscheiden könne. sie gehe, sagte sie, nach Bozen auf die Messe, wo ich doch wahrscheinlich auch hinzöge. wenn sie mich dort anträfe, müsse ich ihr einen Jahrmarkt kaufen, welches ich ihr denn auch versprach. dort wollte sie auch ihre neue<span class=\"more\"></span></span>",
        "matchID" => "match-GOE/AGI/00000-p2068-2069",
        "UID" => 0,
        "pubDate" => "1982"
      }
    ]
  };

  # Error responses:
  if ($v->param('ql') && $v->param('ql') eq 'cosmas3') {
    return $c->render(json => {
      errors => [[101,"No entity found for id","test_h"]]
    });
  };

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
