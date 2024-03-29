use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/path/;
use utf8;

my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['Auth']
  },
  'Kalamar-Auth' => {
    client_id => 2,
    client_secret => 'k414m4r-s3cr3t',
    oauth2 => 1
  }
});

$t->app->mode('production');

my $q = qr!(?:\"|&quot;)!;

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
  ->attr_is('body','data-korap-url','')
  ->header_exists_not('Strict-Transport-Security')
  ;

is('kalamar',$t->app->sessions->cookie_name);
ok(!$t->app->sessions->secure);

$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['Auth'],
    https_only => 1
  },
  'Kalamar-Auth' => {
    client_id => 2,
    client_secret => 'k414m4r-s3cr3t',
    oauth2 => 1
  }
});

$t->post_ok('/user/login' => form => { handle_or_email => 'test', pwd => 'fail' })
  ->status_is(302)
  ->header_is('Location' => '/')
  ->header_is('Strict-Transport-Security', 'max-age=3600; includeSubDomains')
  ;

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
    https_only => 1
  },
  'Kalamar-Auth' => {
    client_id => 2,
    client_secret => 'k414m4r-s3cr3t',
    oauth2 => 1
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
  ->attr_is('body','data-korap-url','/korap/test')
  ;


done_testing();
