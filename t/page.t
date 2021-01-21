use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/path/;

# Test the documentation

my $t = Test::Mojo->new('Kalamar');

my $app = $t->app;

is($app->under_construction, '<p>Under Construction!</p>');

is($app->embedded_link_to('doc', 'privacy', 'privacy'), '<a class="embedded-link" href="/doc/privacy">privacy</a>');
is($app->embedded_link_to('doc', 'privacy', 'korap', 'privacy'), '<a class="embedded-link" href="/doc/korap/privacy">privacy</a>');


my $c = $app->build_controller;
$c->title('Example');
is($c->page_title, '<h2 id="page-top">Example</h2>');

$t->get_ok('/' => { 'X-Forwarded-Host' => 'korap2.ids-mannheim.de'})
  ->attr_is('meta[property="og:url"]', 'content', '//korap2.ids-mannheim.de/')
  ;

# Test csp
$t->get_ok('/')
  ->header_like('Content-Security-Policy', qr!default-src 'self';!)
  ->header_like('Content-Security-Policy', qr!media-src 'none';!)
  ->header_like('Content-Security-Policy', qr!object-src 'self';!)
  ->header_like('Content-Security-Policy', qr!nonce-!)
  ->content_like(qr/<script nonce/)
  ->content_like(qr/document\.body\.classList\.remove\(\'no-js\'\);/)
  ->header_is('X-Content-Type-Options', 'nosniff')
  ->header_is('Access-Control-Allow-Methods','GET, POST, OPTIONS')
  ->header_is('X-Frame-Options', 'sameorigin')
  ;

# Test additions
$t = Test::Mojo->new('Kalamar' => {
  'Localize' => {
    dict => {
      en_howToCite => 'Citation Help',
      de_howToCite => 'Zitierhilfe',
      en_recentCorpusPub => 'Recent publications to refer to DeReKo as linguistic research data',
      de_recentCorpusPub => 'Neuere Publikationen zu DeReKo als linguistische Forschungsdatengrundlage',
      en_recentToolPub => 'Recent publications to refer to KorAP as a tool for research',
      de_recentToolPub => 'Neuere Publikationen zu KorAP als Forschungswerkzeug',
    }
  },
  'TagHelpers-ContentBlock' => {
    footer => [
      {
        inline => '<%= link_to loc("howToCite") => url_for(doc => { page => "faq" })->fragment("howToCite") %>',
        position => 75
      }
    ],
    faq => [
      {
        position => 50,
        inline => <<'HOWTOCITE'
<section>
  <h3 id="howToCite"><%= loc 'howToCite' %></h3>
%= include 'custom/partial/citation'
</section>
HOWTOCITE
      }
    ]
  }
});

push @{$t->app->renderer->paths}, path(path(__FILE__)->dirname);

$t->get_ok('/')
  ->text_is('footer a:nth-child(1)', 'Citation Help')
  ->attr_like('footer a:nth-child(1)', 'href', qr'/doc/+faq#howToCite');

$t->get_ok('/doc//faq#howToCite')
  ->text_is('#howToCite', 'Citation Help')
  ->text_is('section > section h4', 'Recent publications to refer to DeReKo as linguistic research data')
  ;

done_testing;

1;
