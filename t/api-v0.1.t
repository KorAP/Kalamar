#!/usr/bin/env perl
use strict;
use warnings;
use Test::More;
use Test::Mojo;
use Mojo::JSON;
use Mojo::ByteStream 'b';
use utf8;

my $t = Test::Mojo->new;

my $url = Mojo::URL->new('http://10.0.10.13:8888/api/v0.1/');

# Get resources - corpus
$t->get_ok($url->clone->path('corpus'))
  ->status_is(200)
  ->header_is('Content-Type', 'application/json; charset=utf-8')
  ->json_is('/0/id', 'WPD')
  ->json_is('/0/name', 'WPD')
  ->json_is('/0/path', 'WPD')
  ->json_is('/0/managed', Mojo::JSON->true)
  ->json_is('/0/statistics/documents', 196510)
  ->json_is('/0/statistics/tokens', 51545081)
  ->json_is('/0/statistics/sentences', 4116282)
  ->json_is('/0/statistics/paragraphs', 2034752);

# Get resources - collection
$t->get_ok($url->clone->path('collection'))
  ->status_is(200)
  ->json_is('/0/managed', Mojo::JSON->true)
  ->json_is('/0/name', 'Wikipedia')
  ->json_is('/0/description', 'Die freie Enzyklopädie');

# Get resources - query
$t->get_ok($url->clone->path('query'))
  ->status_is(200)
  ->json_is([]);

# Get resources - foundry
$t->get_ok($url->clone->path('foundry'))
  ->status_is(200);

# Get resources - layer
$t->get_ok($url->clone->path('layer'))
  ->status_is(200);

# Stats
$t->get_ok($url->clone->path('corpus/WPD/stats'))
  ->json_is('/documents', 196510)
  ->json_is('/tokens', 51545081)
  ->json_is('/sentences', 4116282)
  ->json_is('/paragraphs', 2034752)
  ->status_is(200);

# Matchinfo
$t->get_ok($url->clone->path('corpus/WPD/SSS.04897/p29-30/matchInfo'))
  ->json_is('/author', 'Darkone,Dramburg,Fusslkopp')
  ->json_is('/textClass', 'freizeit-unterhaltung reisen')
  ->json_is('/corpusID', 'WPD')
  ->json_is('/title', 'Schloss Hohenzieritz')
  ->json_is('/docID', 'WPD_SSS.04897')
  ->json_is('/ID', 'match-WPD!WPD_SSS.04897-p29-30')
  ->json_is('/snippet', "<span class=\"context-left\"><span class=\"more\"></span></span><span class=\"match\">Haus</span><span class=\"context-right\"><span class=\"more\"></span></span>")
  ->status_is(200);

# Matchinfo
$t->get_ok($url->clone->path('corpus/WPD/SSS.04897/p29-30/matchInfo')->query({ foundry => '*'}))
  ->json_is('/author', 'Darkone,Dramburg,Fusslkopp')
  ->json_is('/textClass', 'freizeit-unterhaltung reisen')
  ->json_is('/corpusID', 'WPD')
  ->json_is('/title', 'Schloss Hohenzieritz')
  ->json_is('/docID', 'WPD_SSS.04897')
  ->json_is('/ID', 'match-WPD!WPD_SSS.04897-p23-45')
  ->json_has('/snippet')
  ->status_is(200);

# Search
# Check serialization
$t->get_ok($url->clone->path('search')->query({ q => 'contains(<s>, [orth=Test])', ql => 'poliqarp'}))
  ->json_is('/startIndex', 0)
  ->json_like('/totalResults', qr/\d+/)
  ->json_is('/itemsPerPage', 25)
  ->status_is(200);

my $tx = $t->ua->build_tx('TRACE', $url->clone->path('search')->query({ q => 'contains(<s>, [orth=Test])', ql => 'poliqarp'}));
$tx = $t->ua->start($tx);

#{"@context":"http://ids-mannheim.de/ns/KorAP/json-ld/v0.1/context.jsonld","query":{"@type":"korap:group","operation":"operation:position","frame":"frame:contains","operands":[{"@type":"korap:span","key":"s"},{"@type":"korap:token","wrap":{"@type":"korap:term","layer":"orth","key":"Test","match":"match:eq"}}]},"collections":[{"@type":"korap:meta-filter","@value":{"@type":"korap:term","@field":"korap:field#corpusID","@value":"WPD"}}],"meta":{}}
$t->tx($tx)
  ->json_is('/@context', 'http://ids-mannheim.de/ns/KorAP/json-ld/v0.2/context.jsonld')
  ->json_is('/query/@type', 'korap:group')
  ->json_is('/query/operation', 'operation:position')
  ->json_is('/query/operands/0/@type', 'korap:span')
  ->json_is('/query/operands/0/key', 's')
  ->status_is(200);

#$t->get_ok()
#  ->content_is('')
#  ->status_is(200);



done_testing;
