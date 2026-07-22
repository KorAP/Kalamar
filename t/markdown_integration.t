use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/curfile/;

my $t = Test::Mojo->new('Kalamar');

ok($t->app->renderer->handlers->{md}, 'md handler registered in Kalamar');

ok($t->app->renderer->helpers->{markdown}, 'markdown helper registered in Kalamar');

push @{$t->app->renderer->paths}, curfile->dirname;

$t->get_ok('/doc/md_test')
  ->status_is(200)
  ->element_exists('html head title')
  ->content_like(qr/<h4>/)
  ->content_like(qr/<table>/)
  ->content_like(qr/<strong>test page<\/strong>/)
  ->content_like(qr/class="query tutorial"/)
  ;

# Markdown external link uses ext_link_to (target="_top")
$t->get_ok('/doc/md_test')
  ->content_like(qr/<a href="https:\/\/github\.com\/KorAP\/Kalamar" target="_top">/)
  ;

# Markdown internal link uses undef
$t->get_ok('/doc/md_test')
  ->content_like(qr/<a href="\/doc\/faq">FAQ<\/a>/)
  ;

# Localized custom pages: a German visitor gets custom/de/doc/md_test,
# an English one falls back to the default custom/doc/md_test.
$t->get_ok('/doc/md_test' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->content_like(qr/Testseite/)
  ->content_unlike(qr/test page/)
  ;

$t->get_ok('/doc/md_test' => { 'Accept-Language' => 'en-US, en, de-DE' })
  ->status_is(200)
  ->content_like(qr/test page/)
  ->content_unlike(qr/Testseite/)
  ;

done_testing;
