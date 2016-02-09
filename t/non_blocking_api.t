use Mojo::Base -strict;
use lib '../lib', 'lib';
use Test::More skip_all => 'No remote tests';
use Test::Mojo;
use Mojo::URL;
use Benchmark qw/:hireswallclock/;

my $t = Test::Mojo->new('Kalamar');

$t->app->routes->get('/searchtest')->to(
  cb => sub {
    my $c = shift;
    $c->render(inline => <<'TEMPLATE');
%= search query => param('q'), start_page => param('p'), no_cache => 1, begin
<h1><%= search->query %></h1>
<p id="api"><%= search->api %></p>
<p id="cutoff"><%= search->cutoff %></p>
<p id="ql"><%= search->query_language %></p>
<p id="no_cache"><%= search->no_cache %></p>
<p id="start_page"><%= search->start_page %></p>
<p id="total_results"><%= search->total_results %></p>
<p id="api_request"><%= search->api_request %></p>
%=  search_results begin
  <li><%= $_->{ID} %></li>
%   end
% end
TEMPLATE
  }
);

my $exttemplate = <<'EXTTEMPLATE';
<h1><%= search->query %></h1>
<p id="api"><%= search->api %></p>
<p id="cutoff"><%= search->cutoff %></p>
<p id="ql"><%= search->query_language %></p>
<p id="no_cache"><%= search->no_cache %></p>
<p id="start_page"><%= search->start_page %></p>
<p id="total_results"><%= search->total_results %></p>
<p id="api_request"><%= search->api_request %></p>
%=  search_results begin
  <li><%= $_->{ID} %></li>
%   end
EXTTEMPLATE


$t->app->routes->get('/searchasync')->to(
  cb => sub {
    my $c = shift;
    $c->search(
      query => $c->param('q'),
      start_page => $c->param('p'),
      no_cache => 1,
      cb => sub {
	return $c->render(inline => $exttemplate);
      }
    );
  }
);

my $tracetemplate = <<'TRACETEMPLATE';
<h1><%= search->query %></h1>
<p id="api"><%= search->api %></p>
<p id="cutoff"><%= search->cutoff %></p>
<p id="ql"><%= search->query_language %></p>
<p id="api_request"><%= search->api_request %></p>
<p id="query-jsonld"><%= dumper search->query_jsonld %></p>
TRACETEMPLATE

$t->app->routes->get('/traceasync')->to(
  cb => sub {
    my $c = shift;
    $c->search->trace(
      query => $c->param('q'),
      sub {
	return $c->render(inline => $tracetemplate);
      }
    );
  }
);

my $matchtemplate = <<'MATCHTEMPLATE';
<p id="api"><%= search->api %></p>
<p id="api_request"><%= search->api_request %></p>
<p id="search-result"><%= search->results->first->{docID} . '.' . search->results->first->{textID} %></p>
MATCHTEMPLATE


$t->app->routes->get('/matchinfo')->to(
  cb => sub {
    my $c = shift;
    $c->search->match(
      corpus_id => $c->param('corpus_id'),
      doc_id    => $c->param('doc_id'),
      text_id   => $c->param('text_id'),
      match_id  => $c->param('match_id'),
      foundry => '*',
      sub {
	return $c->render(inline => $matchtemplate);
      }
    );
  }
);

my $colltemplate = <<'COLLTEMPLATE';
<p id="api"><%= search->api %></p>
<p id="api_request"><%= search->api_request %></p>
<p id="search-resource"><%= stash('search.resource')->[0]->{name} %></p>
COLLTEMPLATE

$t->app->routes->get('/collectioninfo')->to(
  cb => sub {
    my $c = shift;
    $c->search->resource(
      type => 'collection',
      sub {
	return $c->render(inline => $colltemplate);
      }
    );
  }
);


$t->app->routes->get('/collectionandsearch-parallel')->to(
  cb => sub {
    my $c = shift;
    $c->delay(
      sub {
	my $delay = shift;
	$c->search->resource(
	  type => 'collection',
	  $delay->begin
	);

	$c->search(
	  query => $c->param('q'),
	  start_page => $c->param('p'),
	  no_cache => 1,
	  cb => $delay->begin
	);
      },
      sub {
	return $c->render(
	  inline => $exttemplate .
	    q!<p id="search-resource"><%= stash('search.resource')->[0]->{name} %></p>!
	  );
      }
    )
  }
);

my $query = 'startswith(<s>,[mate/m=gender:masc]{3,5})';

# Search everything in parallel!
$t->get_ok(Mojo::URL->new('/collectionandsearch-parallel')->query({q => $query}))
  ->status_is(200)
  ->text_is('.notify-error', '')
  ->text_is('h1', $query)
  ->text_is('#api', 'http://10.0.10.13:7070/api/v0.1/')
  ->text_is('#ql', 'poliqarp')
  ->text_is('#search-resource', 'Wikipedia');

$t->get_ok('/collectioninfo')
  ->status_is(200)
  ->text_is('#search-resource', 'Wikipedia');

# http://10.0.10.14:6666/corpus/WPD/WWW.04738/p265-266
$t->get_ok(Mojo::URL->new('/matchinfo')->query({
  corpus_id => 'WPD',
  doc_id => 'WWW',
  text_id => '04738',
  match_id => 'p265-266'
}))
  ->status_is(200)
  ->text_is('#search-result', 'WWW.04738');

$t->get_ok(Mojo::URL->new('/traceasync')->query({q => $query}))
  ->status_is(200)
  ->text_is('.notify-error', '')
  ->text_is('h1', $query)
  ->text_is('#api', 'http://10.0.10.13:7070/api/v0.1/')
  ->text_is('#ql', 'poliqarp')
  ->text_like('#query-jsonld', qr!korap:boundary!);

my $t0 = Benchmark->new;

$t->get_ok(Mojo::URL->new('/searchasync')->query({q => $query}))
  ->status_is(200)
  ->text_is('.notify-error', '')
  ->text_is('h1', $query)
  ->text_is('#api', 'http://10.0.10.13:7070/api/v0.1/')
  ->text_is('#cutoff', '')
  ->text_is('#ql', 'poliqarp')
  ->text_is('#no_cache', 1)
  ->text_is('#start_page', 1)
  ->text_is('#total_results', 54215)
#  ->text_is('li', 'p265-266')
  ;

my $t1 = Benchmark->new;

$t->get_ok(Mojo::URL->new('/searchtest')->query({q => $query}))
  ->status_is(200)
  ->text_is('.notify-error', '')
  ->text_is('h1', $query)
  ->text_is('#api', 'http://10.0.10.13:7070/api/v0.1/')
  ->text_is('#cutoff', '')
  ->text_is('#ql', 'poliqarp')
  ->text_is('#no_cache', 1)
  ->text_is('#start_page', 1)
  ->text_is('#total_results', 54215)
#  ->text_is('li', 'p265-266')
  ;

diag 'sync  ' . timestr(timediff(Benchmark->new, $t1));
diag 'async ' . timestr(timediff($t1, $t0));

# Check time_exceeded!

done_testing;
__END__
