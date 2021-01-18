use Mojo::Base -strict;
use Test::More;
use Test::Mojo;

# Test the documentation
my $t = Test::Mojo->new('Kalamar' => {
  'Piwik' => {
    url => 'https://piwik.korap.ids-mannheim.de/',
    site_id => 1,
    embed => 1
  }
});

# Load piwik
$t->app->plugin('Kalamar::Plugin::Piwik');

$t->get_ok('/doc/faq')
  ->status_is(200)
  ->text_like('section[name=piwik-opt-out] h3', qr!can I opt-out!)
  ->element_exists('section[name=piwik-opt-out] iframe')
  ->content_like(qr!var _paq!)
  ->content_like(qr!window\.addEventListener\('korapRequest!)
  ->content_like(qr!setDocumentTitle!)
  ->content_like(qr!setCustomUrl!)
  ->content_like(qr!trackPageView!)
  ;

$t = Test::Mojo->new('Kalamar' => {
  'Piwik' => {
    url => 'https://piwik.korap.ids-mannheim.de/',
    site_id => 1,
    embed => 1,
    append => 'console.log("fun")'
  }
});

$t->app->plugin('Kalamar::Plugin::Piwik' => {
  cors_compliant => 1
});


is($t->app->piwik_tag('as-script'), '<script src="https://piwik.korap.ids-mannheim.de/piwik.js" async defer></script><script src="/js/tracking.js"></script>');

$t->get_ok('/doc/faq')
  ->status_is(200)
  ->text_like('section[name=piwik-opt-out] h3', qr!can I opt-out!)
  ->element_exists('section[name=piwik-opt-out] iframe')
  ->element_exists('script[src$="/js/tracking.js"]')
  ->content_unlike(qr!var _paq!)
  ;

$t->get_ok('/js/tracking.js')
  ->status_is(200)
  ->content_like(qr!var _paq!)
  ->content_like(qr!;console\.log\("fun"\)!)
  ->content_like(qr!;window\.addEventListener\('korapRequest!)
  ;

# No embedding
$t = Test::Mojo->new('Kalamar' => {
  'Piwik' => {
    url => 'https://piwik.korap.ids-mannheim.de/',
    site_id => 1,
    embed => 0
  }
});
$t->app->plugin('Kalamar::Plugin::Piwik');

$t->get_ok('/doc/faq')
  ->status_is(200)
  ->text_like('section[name=piwik-opt-out] h3', qr!can I opt-out!)
  ->element_exists_not('section[name=piwik-opt-out] iframe')
  ->content_unlike(qr!var _paq!)
  ->content_unlike(qr!window\.addEventListener\('korapRequest!)
  ;

done_testing;
