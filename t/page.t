use Mojo::Base -strict;
use Test::More;
use Test::Mojo;

# Test the documentation

my $t = Test::Mojo->new('Kalamar');

my $app = $t->app;

is($app->under_construction, '<p>Under Construction!</p>');

is($app->embedded_link_to('privacy', 'privacy'), '<a class="embedded-link" href="/doc/privacy">privacy</a>');
is($app->embedded_link_to('privacy', 'korap', 'privacy'), '<a class="embedded-link" href="/doc/korap/privacy">privacy</a>');


my $c = $app->build_controller;
$c->title('Example');
is($c->page_title, '<h2 id="page-top">Example</h2>');

done_testing;

1;
