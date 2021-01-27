use Mojo::Base -strict;
use Test::More;
use Test::Mojo;

# Test the documentation

my $t = Test::Mojo->new('Kalamar');

my $app = $t->app;

is($app->under_construction, '<p>Under Construction!</p>');

is($app->embedded_link_to('doc', 'privacy', 'privacy'), '<a class="embedded-link" href="/doc/privacy">privacy</a>');
is($app->embedded_link_to('doc', 'privacy', 'korap', 'privacy'), '<a class="embedded-link" href="/doc/korap/privacy">privacy</a>');


my $c = $app->build_controller;
$c->title('Example');
is($c->page_title, '<h2 id="page-top">Example</h2>');

$t->get_ok('/' => { 'X-Forwarded-Host' => 'korap2.ids-mannheim.de'})
  ->attr_is('meta[property="og:url"]', 'content', '//korap2.ids-mannheim.de/')
  ;

$t->get_ok('/')
  ->header_like('Content-Security-Policy', qr!default-src 'self';!)
  ->header_like('Content-Security-Policy', qr!media-src 'none';!)
  ->header_like('Content-Security-Policy', qr!object-src 'self';!)
  ;

$t->get_ok('/')
  ->content_like(qr/inline js permitted/)
  ;

done_testing;

1;
