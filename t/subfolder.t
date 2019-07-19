use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/path/;
use utf8;

my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['Auth']
  }
});

$t->app->mode('production');

$t->post_ok('/user/login' => form => { handle_or_email => 'test', pwd => 'fail' })
  ->status_is(302)
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists('link[rel=stylesheet][href^=/css/kalamar-]')
  ->element_exists('script[src^=/js/kalamar-]')
  ->element_exists('div.notify-error')
  ->text_is('div.notify-error', 'Bad CSRF token')
  ->element_exists('input[name=handle_or_email][value=test]')
  ->element_exists_not('div.button.top a')
  ->content_like(qr!KorAP\.URL = ''!)
  ;

is('kalamar',$t->app->sessions->cookie_name);
ok(!$t->app->sessions->secure);

$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['Auth'],
    secure_cookie => 1
  }
});

$t->post_ok('/user/login' => form => { handle_or_email => 'test', pwd => 'fail' })
  ->status_is(302)
  ->header_is('Location' => '/');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ;

is('kalamar',$t->app->sessions->cookie_name);
ok($t->app->sessions->secure);

$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['Auth'],
    proxy_prefix => '/korap/test',
    secure_cookie => 1
  }
});

$t->app->mode('production');

$t->get_ok('/')
  ->status_is(200)
  ->element_exists('link[rel=stylesheet][href^=/korap/test/css/kalamar-]')
  ->element_exists('script[src^=/korap/test/js/kalamar-]')
  ;

is('kalamar-koraptest',$t->app->sessions->cookie_name);
ok($t->app->sessions->secure);

$t->post_ok('/user/login' => form => { handle_or_email => 'test', pwd => 'fail' })
  ->status_is(302)
  ->header_is('Location' => '/');

# Session can't be used
$t->get_ok('/')
  ->status_is(200)
  ->element_exists_not('div.notify-error')
  ->content_like(qr!KorAP\.URL = '/korap/test'!)
  ;


done_testing();
