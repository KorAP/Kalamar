use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use utf8;
use File::Temp qw/tempdir/;
use Mojo::File qw/path/;

my $repo = 'https://github.com/KorAP/DeReKo-Issues';

# Without configuration, there is no corpus issue page
my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    api_path => 'xyz'
  }
});

$t->get_ok('/doc')
  ->status_is(200)
  ->element_exists_not('nav a[href^=/doc/corpus]')
  ;

$t->get_ok('/doc/corpus/issues')
  ->status_is(404)
  ;

$t->get_ok('/doc/corpus')
  ->status_is(404)
  ;

# Configured, without a corpus section in the navigation
$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    api_path => 'xyz',
    plugins => ['CorpusIssues'],
    corpus_issues => $repo . '/'
  }
});

$t->get_ok('/doc')
  ->status_is(200)
  ->text_is('nav > ul.nav > li:last-child > a', 'Corpora')
  ->element_exists('nav > ul.nav > li:last-child > a[href=/doc/corpus/issues#page-top]')
  ->text_is('nav > ul.nav > li:last-child > ul > li > a', 'Corpus Issues')
  ->element_exists('nav > ul.nav > li:last-child > ul > li > a[href=/doc/corpus/issues#page-top]')
  ;

$t->get_ok('/doc/corpus?embedded=true')
  ->status_is(404)
  ;

$t->get_ok('/doc/corpus/issues' => { 'Accept-Language' => 'en-US, en, de-DE' })
  ->status_is(200)
  ->text_is('title', 'KorAP: Corpus Issues')
  ->text_is('h2#page-top', 'KorAP: Corpus Issues')
  ->element_exists('a[href=' . $repo . '/issues][target=_top]')
  ->element_exists('a[href=' . $repo . '/issues/new][target=_top]')
  ->content_like(qr!protected by copyright!)
  ->element_exists('nav li.active > a[href=/doc/corpus/issues#page-top]')
  ;

$t->get_ok('/doc/corpus/issues' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->text_is('title', 'KorAP: Korpusfehler')
  ->element_exists('a[href=' . $repo . '/issues/new][target=_top]')
  ->content_like(qr!urheberrechtlich geschützt!)
  ->text_is('nav > ul.nav > li:last-child > ul > li > a', 'Korpusfehler')
  ;

# Configured via environment, with a corpus section in the navigation
{
  local $ENV{KALAMAR_CORPUS_ISSUES} = $repo;

  $t = Test::Mojo->new('Kalamar' => {
    Kalamar => {
      api_path => 'xyz',
      plugins => ['CorpusIssues'],
      corpus_issues => 'https://example.org/ignored',
      navi_ext => [
        {
          title => 'Corpus',
          id => 'corpus',
          items => [
            {
              title => 'Composition',
              id => 'composition'
            }
          ]
        },
        {
          title => 'Privacy',
          id => 'privacy'
        }
      ]
    }
  });
};

$t->get_ok('/doc')
  ->status_is(200)
  ->text_is('nav > ul.nav > li:last-child > a', 'Privacy')
  ->element_count_is('nav a[href^=/doc/corpus/issues]', 1)
  ->text_is('nav > ul.nav > li:nth-last-child(2) > ul > li:first-child > a', 'Composition')
  ->text_is('nav > ul.nav > li:nth-last-child(2) > ul > li:last-child > a', 'Corpus Issues')
  ;

$t->get_ok('/doc/corpus/issues')
  ->status_is(200)
  ->element_exists('a[href=' . $repo . '/issues/new]')
  ;

# Invalid URLs are ignored
$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    api_path => 'xyz',
    plugins => ['CorpusIssues'],
    corpus_issues => 'javascript:alert(1)'
  }
});

$t->get_ok('/doc')
  ->element_exists_not('nav a[href^=/doc/corpus]')
  ;

$t->get_ok('/doc/corpus/issues')
  ->status_is(404)
  ;

# A URL alone does not activate an optional plugin.
$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {api_path => 'xyz', corpus_issues => $repo}
});
$t->get_ok('/doc')->status_is(200)
  ->element_exists_not('nav a[href^=/doc/corpus]');
$t->get_ok('/doc/corpus/issues')->status_is(404);

# Enabling the plugin without a URL also leaves the documentation unchanged.
$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {api_path => 'xyz', plugins => ['CorpusIssues']}
});
$t->get_ok('/doc')->status_is(200)
  ->element_exists_not('nav a[href^=/doc/corpus]');
$t->get_ok('/doc/corpus/issues')->status_is(404);

# Empty sections work, and navigation rendering neither accumulates entries
# nor mutates the instance configuration.
my $navigation = [{id => 'corpus', title => 'Corpus'}];
$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {api_path => 'xyz', plugins => ['CorpusIssues'],
    corpus_issues => $repo, navi_ext => $navigation}
});
for (1 .. 2) {
  $t->get_ok('/doc')->status_is(200)
    ->element_count_is('nav > ul > li > a[href=/doc/corpus#page-top]', 1)
    ->element_count_is('nav > ul > li > ul > li > a[href=/doc/corpus/issues#page-top]', 1);
}
is_deeply($navigation, [{id => 'corpus', title => 'Corpus'}],
  'plugin does not modify the instance navigation');

# An explicitly configured entry is reused, keeping its position.
$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {api_path => 'xyz', plugins => ['CorpusIssues'],
    corpus_issues => $repo, navi_ext => [{id => 'corpus', title => 'Corpus',
      items => [{id => 'issues', title => 'Issues'}, {id => 'composition', title => 'Composition'}]}]}
});
$t->get_ok('/doc')->status_is(200)
  ->element_count_is('nav a[href=/doc/corpus/issues#page-top]', 1)
  ->text_is('nav > ul > li:last-child > ul > li:last-child > a', 'Composition');

$t->get_ok('/doc/corpus/issues?embedded=true' => {'Accept-Language' => 'de'})
  ->status_is(200)->text_is('h2#page-top', 'KorAP: Korpusfehler')
  ->element_exists_not('header');

# Existing instance landing pages are not shadowed by a plugin template.
my $templates = tempdir(CLEANUP => 1);
path($templates, 'custom', 'doc')->make_path;
path($templates, 'custom', 'doc', 'corpus.html.ep')->spurt('Instance corpus overview');
unshift @{$t->app->renderer->paths}, $templates;
$t->get_ok('/doc/corpus' => {'Accept-Language' => 'en'})
  ->status_is(200)->content_like(qr/Instance corpus overview/);

# Match the real instance: the corpus section is first and folded; the
# issue entry belongs after the existing corpus links and must be visible.
$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {api_path => 'xyz', plugins => ['CorpusIssues'], corpus_issues => $repo}
});
my $instance_nav = [
  {id => 'corpus', title => 'Corpus basis', class => 'folded', items => [
    map { {id => $_, title => $_} } qw/releases composition useful_subcorpora named_vc/
  ]},
  {id => 'faq', title => 'FAQ'}
];
$t->app->config(doc_navi => $instance_nav);
$t->get_ok('/doc/corpus/issues')
  ->status_is(200)
  ->element_exists('nav > ul > li:first-child > a[href=/doc/corpus#page-top]')
  ->element_exists('nav > ul > li:first-child > ul > li:nth-child(4) > a[href=/doc/corpus/named_vc#page-top]')
  ->element_exists('nav > ul > li:first-child > ul.active > li.active:last-child > a[href=/doc/corpus/issues#page-top]')
  ->element_count_is('nav a[href=/doc/corpus/issues#page-top]', 1)
  ->text_is('nav > ul > li:last-child > a', 'FAQ');
is(scalar @{$instance_nav->[0]{items}}, 4, 'plugin leaves the corpus navigation configuration unchanged');

done_testing;
