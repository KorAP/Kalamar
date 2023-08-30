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
  ->content_unlike(qr!var _paq!)
  ->content_unlike(qr!window\.addEventListener\('korapRequest!)
  ->content_unlike(qr!setDocumentTitle!)
  ->content_unlike(qr!setCustomUrl!)
  ->content_unlike(qr!trackPageView!)
  ->element_exists('script[src$="/settings/assets/tracking.js"]')
  ;

$t = Test::Mojo->new('Kalamar' => {
  'Piwik' => {
    url => 'https://piwik.korap.ids-mannheim.de/',
    site_id => 1,
    embed => 1,
    append => 'console.log("fun")'
  }
});

$t->app->plugin('Kalamar::Plugin::Piwik');

is($t->app->piwik_tag('as-script'), '<script src="/settings/assets/tracking.js"></script>' .
     '<script src="https://piwik.korap.ids-mannheim.de/matomo.js" async defer></script>');

$t->get_ok('/doc/faq')
  ->status_is(200)
  ->text_like('section[name=piwik-opt-out] h3', qr!can I opt-out!)
  ->element_exists('section[name=piwik-opt-out] iframe')
  ->element_exists('script[src$="/settings/assets/tracking.js"]')
  ->content_unlike(qr!_paq!)
  ->header_like('Content-Security-Policy',qr!connect-src 'self' [^;]*?https://piwik\.korap\.ids-mannheim\.de/!)
  ->header_like('Content-Security-Policy',qr!img-src 'self' [^;]*?https://piwik\.korap\.ids-mannheim\.de/!)
  ->header_like('Content-Security-Policy',qr!script-src 'self' [^;]*?https://piwik\.korap\.ids-mannheim\.de/!)
  ->header_like('Content-Security-Policy',qr!frame-src [^;]*?(?:\*|https://piwik\.korap\.ids-mannheim\.de/)!)
  ;

$t->get_ok('/settings/assets/tracking.js')
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
  ->content_unlike(qr!_paq!)
  ->content_unlike(qr!window\.addEventListener\('korapRequest!)
  ->element_exists_not('script[src$="/settings/assets/tracking.js"]')
  ;

done_testing;
