use Mojo::Base -strict;
use lib '../lib', 'lib';
use Test::More;
use Test::Mojo;

# Test the documentation

my $t = Test::Mojo->new('Kalamar');

$t->get_ok('/doc/ql/poliqarp-plus')
  ->status_is(200)
  ->text_like('title', qr/poliqarp/i)
  ->element_exists('aside.active')
  ->element_exists('main.tutorial')
  ->element_exists('header')
  ->element_exists('aside nav')
  ->content_is('');

$t->get_ok('/doc/ql/poliqarp-plus?embedded=true')
  ->status_is(200)
  ->text_like('title', qr/poliqarp/i)
  ->element_exists('aside.active')
  ->element_exists('main.tutorial')
  ->element_exists_not('header');


done_testing();
