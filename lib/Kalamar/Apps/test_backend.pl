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

helper jwt => sub {
  shift;
  return Mojo::JWT->new(
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
      my $jwt = $c->jwt(username => $username);

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
