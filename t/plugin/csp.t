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


# New
$t = Test::Mojo->new;
$t->app->config(
  CSP => {
    'style-src' => ['self','unsafe-inline'],
    'img-src' => ['self', 'data:']
  }
);

$t->app->plugin('Kalamar::Plugin::CSP' => {
  'script-src' => '*',
  'img-src' => 'self'
});

$t->app->routes->get('/n')->to(
  cb => sub {
    shift->render(text => 'hello world');
  }
);

$t->get_ok('/n')
  ->status_is(200)
  ->content_is('hello world')
  ->header_is($csp, "img-src 'self' data:;script-src *;style-src 'self' 'unsafe-inline';")
  ;

$t = Test::Mojo->new;
$t->app->config(
  CSP => {
    'style-src' => ['self'],
    'img-src' => ['self', 'data:'],
    -with_nonce => 1
  }
);
$t->app->plugin('Kalamar::Plugin::CSP');

$t->app->routes->get('/nonce')->to(
  cb => sub {
    shift->render(inline => 'Hallo! <%= csp_nonce_tag %>');
  }
);

my $content = $t->get_ok('/nonce')
  ->status_is(200)
  ->content_like(qr'Hallo! <script nonce=".{20}">//<')
  ->header_like($csp, qr!^img-src 'self' data:;script-src 'nonce-.{20}';style-src 'self';!)
  ->tx->res->to_string;
;

$content =~ q!<script nonce="(.{20})"!;
like($content, qr/nonce-\Q$1\E/);



done_testing;
__END__
