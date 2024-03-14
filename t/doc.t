use Mojo::Base -strict;
use Test::More;
use Test::Mojo;

# Test the documentation

my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    proxy_prefix => '/test'
  }
});

# Bug 2021-06-11
$t->get_ok('/doc/ql/wildcards?cat=1')
  ->status_is(404) # ! Should be 404!
  ;

$t->get_ok('/doc/ql/')
  ->status_is(200)
  ->text_is('title','KorAP: Query Languages')
  ;

$t->get_ok('/doc/ql')
  ->status_is(200)
  ->text_is('title','KorAP: Query Languages')
  ;

# Embedding
$t->get_ok('/doc/ql/poliqarp-plus')
  ->status_is(200)
  ->text_like('title', qr/poliqarp/i)
  ->element_exists('aside.active')
  ->element_exists_not('aside.settings')
  ->element_exists('main.tutorial')
  ->element_exists('header')
  ->element_exists('aside nav')
  ->text_is('h1 span', 'KorAP: Poliqarp+')
  ->element_exists('li.folded.active')
  ->text_is('li.folded.active a', 'Poliqarp+');

$t->get_ok('/doc/ql/poliqarp-plus?embedded=true')
  ->status_is(200)
  ->text_like('title', qr/poliqarp/i)
  ->element_exists('aside.active')
  ->element_exists('main.tutorial')
  ->element_exists_not('header')
  ->element_exists('li.folded.active')
  ->text_is('li.folded.active a', 'Poliqarp+');

# Languages
$t->get_ok('/' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->text_is("title", "KorAP - Korpusanalyseplattform der nächsten Generation");

$t->get_ok('/' => { 'Accept-Language' => 'en-US, en, de-DE' })
  ->status_is(200)
  ->text_is("title", "KorAP - Corpus Analysis Platform");

$t->get_ok('/doc/ql/' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->text_is('title','KorAP: Anfragesprachen')
  ->text_is('h3','Beispielanfragen')
  ;

$t->get_ok('/doc/ql' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->text_is('title','KorAP: Anfragesprachen')
  ;

# Pages
$t->get_ok('/doc/ql/poliqarp-plus' => { 'Accept-Language' => 'en-US, en, de-DE' })
  ->status_is(200)
  ->text_is("title", "KorAP: Poliqarp+")
  ->text_is('main section > h3', 'Simple Segments');

$t->get_ok('/doc/ql/poliqarp-plus' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->text_is("title", "KorAP: Poliqarp+")
  ->text_is('main section > h3', 'Einfache Segmente');

$t->get_ok('/doc/ql/annis' => { 'Accept-Language' => 'en-US, en, de-DE' })
  ->status_is(200)
  ->text_is("title", "KorAP: Annis QL");

# Check corpus examples
$t->get_ok('/doc/ql/poliqarp-plus')
  ->status_is(200)
  ->text_is('#segments pre.query.tutorial:nth-of-type(1) code', 'Baum');

# Check data
$t->get_ok('/doc/data/annotation' => { 'Accept-Language' => 'en-US, en, de-DE' })
  ->status_is(200)
  ->text_is('#page-top', 'KorAP: Annotations');
$t->get_ok('/doc/data/annotation' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->text_is('#page-top', 'KorAP: Annotationen');

my $app = $t->app;

$app->plugin(
  'Localize' => {
    dict => {
      Q => {
        newexample => {
          poliqarp => {
            simple => '** Beispiel'
          }
        }
      }
    }
  }
);

# Set other example query
$app->config('Kalamar')->{examplecorpus} = 'newexample';

is($app->loc('Q_poliqarp_simple'), '** Beispiel');

# Check corpus examples
$t->get_ok('/doc/ql/poliqarp-plus')
  ->status_is(200)
  ->text_is('#segments pre.query.tutorial:nth-of-type(1) code', 'Beispiel')
  ->text_is('#segments pre.query.tutorial:nth-of-type(1) span', '*');

# Check API endpoint
$t->get_ok('/doc/api' => { 'X-Forwarded-Host' => 'korap.ids-mannheim.de' })
  ->status_is(200)
  ->text_is('#api-service-uri', 'https://korap.ids-mannheim.de/test/api/v1.0/');


# Languages of dev pages
$t->get_ok('/doc/development/kalamar')
  ->status_is(200)
  ->text_is("title", "KorAP: Kalamar")
  ->content_like(qr!Main developer!);

$t->get_ok('/doc/development/kalamar' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->text_is("title", "KorAP: Kalamar")
  ->content_like(qr!Hauptentwickler!);


# Check mail_to_chiffre
like($t->app->mail_to_chiffre('korap@korap.example'),qr!rel="nofollow"!);
like($t->app->mail_to_chiffre('korap@korap.example'),qr!class="PArok"!);

done_testing();
