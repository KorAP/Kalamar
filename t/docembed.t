use Mojo::Base -strict;
use Mojolicious::Lite;
use Test::More;
use Test::Mojo;
use utf8;

my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    api_path => 'xyz',
    navi_ext => [
      {
        title => 'Privacy',
        id => 'privacy'
      }
    ]
  }
});

$t->get_ok('/doc')
  ->text_is('nav > ul.nav > li.active a', 'KorAP')
  ->text_is('nav > ul.nav > li:last-child a', 'Privacy')
  ->element_exists('nav > ul.nav > li:last-child a[href=/doc/privacy#tutorial-top]')
  ;

done_testing;
