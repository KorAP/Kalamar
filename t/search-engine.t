use Mojo::Base -strict;
use lib '../lib', 'lib';
use Test::More;
use Test::Mojo;

my $t = Test::Mojo->new('Korap');

$t->app->routes->get('/searchtest')->to(
  cb => sub {
    my $c = shift;
    $c->render(inline => <<'TEMPLATE');
%= search query => 'baum', start_page => param('p'), no_cache => 1, begin
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
      query => 'baum',
      start_page => $c->param('p'),
      no_cache => 1,
      cb => sub {
	return $c->render(inline => $exttemplate);
      }
    );
  }
);

$t->get_ok('/searchasync')
  ->status_is(200)
  ->text_is('.notify-error', '')
  ->text_is('h1', 'baum')
  ->text_is('#api', 'http://10.0.10.13:7070/api/v0.1/')
  ->text_is('#cutoff', '')
  ->text_is('#ql', 'poliqarp')
  ->text_is('#no_cache', 1)
  ->text_is('#start_page', 1)
  ->text_is('#total_results', 3)
  ->text_is('li', 'p265-266');


$t->get_ok('/searchtest')
  ->status_is(200)
  ->text_is('.notify-error', '')
  ->text_is('h1', 'baum')
  ->text_is('#api', 'http://10.0.10.13:7070/api/v0.1/')
  ->text_is('#cutoff', '')
  ->text_is('#ql', 'poliqarp')
  ->text_is('#no_cache', 1)
  ->text_is('#start_page', 1)
  ->text_is('#total_results', 3)
  ->text_is('li', 'p265-266');


done_testing;
