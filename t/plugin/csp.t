use Mojolicious::Lite;
use Test::Mojo;
use Test::More;

my $t = Test::Mojo->new;

plugin 'Kalamar::Plugin::CSP' => {
  'style-src' => ['self','unsafe-inline'],
  'script-src' => '*',
  'img-src' => ['self', 'data:']
};

get '/' => sub {
  shift->render(text => 'hello world');
};

my $csp = 'Content-Security-Policy';

$t->get_ok('/')
  ->status_is(200)
  ->content_is('hello world')
  ->header_is($csp, "img-src 'self' data:;script-src *;style-src 'self' 'unsafe-inline';")
  ;

$t->app->csp->add('img-src' => 'stats.ids-mannheim.de');

$t->get_ok('/')
  ->status_is(200)
  ->content_is('hello world')
  ->header_is($csp, "img-src 'self' data: stats.ids-mannheim.de;script-src *;style-src 'self' 'unsafe-inline';")
  ;

$t->get_ok('/')
  ->status_is(200)
  ->content_is('hello world')
  ->header_is($csp, "img-src 'self' data: stats.ids-mannheim.de;script-src *;style-src 'self' 'unsafe-inline';")
  ;

$t->app->csp->add('img-src' => 'stats.ids-mannheim.de');

$t->get_ok('/')
  ->status_is(200)
  ->content_is('hello world')
  ->header_is($csp, "img-src 'self' data: stats.ids-mannheim.de;script-src *;style-src 'self' 'unsafe-inline';")
  ;

$t->app->csp->add('script-src' => '*');

$t->get_ok('/')
  ->status_is(200)
  ->content_is('hello world')
  ->header_is($csp, "img-src 'self' data: stats.ids-mannheim.de;script-src *;style-src 'self' 'unsafe-inline';")
  ;


done_testing;
__END__
