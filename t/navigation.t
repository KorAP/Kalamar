use Mojo::Base -strict;
use Mojolicious::Lite;
use Test::More;
use Test::Mojo;
use utf8;

my $t = Test::Mojo->new;
my $app = $t->app;

# Add additional plugin path
push(@{$app->plugins->namespaces}, 'Kalamar::Plugin');

# Establish test route
$app->routes->get('/doc/:scope/:page')->to(cb => sub {}, scope => undef)->name('doc');
$app->routes->get('/settings/:scope/:page')->to(cb => sub {}, scope => undef)->name('settings');


# Load plugin to test
$app->plugin('KalamarPages');

my $languages = [qw/en de/];
$app->plugin('Localize' => {
  dict => {
    Nav => {
      _ => sub { $languages },
      -en => {
        faq => 'FAQ',
        '#default-foundries' => 'Default Foundries',
      },
      de => {
        faq => 'FAQ',
        '#default-foundries' => 'Standard Foundries'
      }
    }
  }
});

my $navi = [
  {
    id => 'development',
    title => 'KorAP'
  }
];

my $render = $app->navigation('doc', $navi);
like($render, qr!/doc/development!, 'Path matches doc/development');
like($render, qr!KorAP!, 'Title matches');

$navi = [
  {
    id => 'development',
    title => 'KorAP'
  },
  {
    id => 'krill',
    title => 'Krill'
  }
];

$render = $app->navigation('doc', $navi);
like($render, qr!/doc/development!, 'Path matches doc/development');
like($render, qr!KorAP!, 'Title matches');
like($render, qr!/doc/krill!, 'Path matches doc/krill');
like($render, qr!Krill!, 'Title matches');

$navi = [
  {
    id => 'development',
    title => 'KorAP',
    items => [
      {
        id => 'krill',
        title => 'Krill',
      }
    ]
  },
  {
    id => 'faq',
    title => 'FAQ'
  }
];

$render = $app->navigation('doc', $navi);
like($render, qr!/doc/development!, 'Path matches doc/development');
like($render, qr!/doc/development/krill!, 'Path matches development/krill');
like($render, qr!/doc/faq!, 'Path matches doc/faq');

$navi = [
  {
    id => 'development',
    title => 'KorAP',
    items => [
      {
        id => 'krill',
        title => 'Krill',
      },
      {
        id => 'koral',
        title => 'Koral'
      }
    ]
  },
  {
    title => 'Query Languages',
    id => 'ql',
    items => [
      {
        title => 'Cosmas II',
        id => 'cosmas2'
      },
      {
        'title' => 'Poliqarp+',
        'id' => 'poliqarp-plus',
        items => [
          {
            "title" => "Simple Segments",
            "id" => "#segments"
          },
          {
            "title" => "Complex Segments",
            "id" => "#complex"
          }
        ]
      }
    ]
  },
  {
    id => 'faq',
    title => 'FAQ'
  }
];

$render = $app->navigation('doc', $navi);
like($render, qr!/doc/development!, 'Path matches doc/development');
like($render, qr!/doc/development/krill!, 'Path matches development/krill');
like($render, qr!/doc/development/koral!, 'Path matches development/koral');
like($render, qr!/doc/ql!, 'Path matches doc/ql');
like($render, qr!/doc/ql/cosmas2!, 'Path matches doc/ql/cosmas2');
like($render, qr!/doc/ql/poliqarp-plus!, 'Path matches doc/ql/poliqarp-plus');
like($render, qr!/doc/ql/poliqarp-plus#segments!,
     'Path matches doc/ql/poliqarp-plus#segments');
like($render, qr!/doc/ql/poliqarp-plus#complex!,
     'Path matches doc/ql/poliqarp-plus#complex');
like($render, qr!/doc/faq!, 'Path matches doc/faq');

ok($app->navi->exists('doc'));
ok(!$app->navi->exists('xy'));
is($app->navigation('xy'), '');;


my $c = $app->build_controller;
$c->stash(page => 'development');
$render = $c->navigation('doc', $navi);
like($render, qr!/doc/development!, 'Path matches doc/development');
like($render, qr!/doc/development/krill!, 'Path matches development/krill');
like($render, qr!/doc/ql!, 'Path matches doc/ql');
like($render, qr!/doc/ql/poliqarp-plus#segments!,
     'Path matches doc/ql/poliqarp-plus#segments');
like($render, qr!/doc/ql/poliqarp-plus#complex!,
     'Path matches doc/ql/poliqarp-plus#complex');
like($render, qr!class="active".*?KorAP!, 'Active value for KorAP');

$c->stash(page => 'poliqarp-plus');
$render = $c->navigation('doc', $navi);
like($render, qr!/doc/development!, 'Path matches doc/development');
like($render, qr!/doc/development/krill!, 'Path matches development/krill');
like($render, qr!/doc/ql!, 'Path matches doc/ql');
like($render, qr!/doc/ql/poliqarp-plus#segments!,
     'Path matches doc/ql/poliqarp-plus#segments');
like($render, qr!/doc/ql/poliqarp-plus#complex!,
     'Path matches doc/ql/poliqarp-plus#complex');
like($render, qr!class="active".*?Poliqarp\+!, 'Active value for Poliqarp+');


$navi = [
  {
    id => 'development',
    title => 'KorAP',
    items => [
      {
        id => 'krill',
        title => 'Krill',
      },
      {
        id => 'koral',
        title => 'Koral'
      }
    ]
  },
  {
    title => 'Query Languages',
    id => 'ql',
    class => 'folded',
    items => [
      {
        title => 'Cosmas II',
        id => 'cosmas2'
      },
      {
        'title' => 'Poliqarp+',
        'id' => 'poliqarp-plus',
        'class' => 'folded',
        items => [
          {
            "title" => "Simple Segments",
            "id" => "#segments"
          },
          {
            "title" => "Complex Segments",
            "id" => "#complex"
          }
        ]
      }
    ]
  },
  {
    id => 'faq',
    title => 'FAQ'
  }
];
$render = $c->navigation('doc', $navi);

like($render, qr!/doc/development!, 'Path matches doc/development');
like($render, qr!/doc/development/krill!, 'Path matches development/krill');
like($render, qr!/doc/ql!, 'Path matches doc/ql');
like($render, qr!/doc/ql/poliqarp-plus#segments!,
     'Path matches doc/ql/poliqarp-plus#segments');
like($render, qr!/doc/ql/poliqarp-plus#complex!,
     'Path matches doc/ql/poliqarp-plus#complex');
like($render, qr!class="folded active".*?Poliqarp\+!, 'Active and folded value for Poliqarp+');


$c->stash(page => 'cosmas2');
$render = $c->navigation('doc', $navi);

like($render, qr!\<li class=\"folded\">\s*<a href="/doc/ql\#page-top">Query Languages</a>\s*<ul class="nav nav-doc active">\s*<li class="active"><a href="/doc/ql/cosmas2\#page-top">Cosmas II</a></li>!);

delete $c->stash->{cosmas2};


# Test for translations
$navi = [
  {
    id => 'development',
    title => 'KorAP',
    items => [
      {
        id => 'krill',
        title => 'Krill',
      }
    ]
  },
  {
    id => 'faq',
    title => 'FAQ'
  }
];

$render = $app->navigation('doc', $navi);
like($render, qr!/doc/development!, 'Path matches doc/development');
like($render, qr!/doc/development/krill!, 'Path matches development/krill');
like($render, qr!<a href="/doc/development/krill(?:#[^"]+)?">Krill</a>!,
     'Path matches development/krill');
like($render, qr!<a href="/doc/faq(?:#[^"]+)?">FAQ</a>!,
     'Path matches FAQ');

# Change preferred language
$languages = [qw/de en/];

$render = $app->navigation('doc', $navi);
like($render, qr!/doc/development!, 'Path matches doc/development');
like($render, qr!/doc/development/krill!, 'Path matches development/krill');
like($render, qr!<a href="/doc/development/krill(?:#[^"]+)?">Krill</a>!,
     'Path matches development/krill');
like($render, qr!<a href="/doc/faq(?:#[^"]+)?">FAQ</a>!,
     'Path matches FAQ');

# Create settings realm
$app->navi->add(settings => (
  'OAuth', 'oauth'
));

# Create settings realm
$app->navi->add(settings => (
  'Marketplace', 'marketplace'
));

$render = $app->navigation('settings');

like($render, qr!/settings/oauth#page-top!);
like($render, qr!/settings/marketplace#page-top!);

my @list = $app->navi->list('settings');

is($list[0]->{url}, '/settings/oauth#page-top');
is($list[0]->{title}, 'OAuth');
is($list[1]->{url}, '/settings/marketplace#page-top');
is($list[1]->{title}, 'Marketplace');

# Plugins append scoped entries through ContentBlocks. Existing JSON entries
# stay in their original order; repeated rendering does not accumulate links.
$app->plugin('TagHelpers::ContentBlock');
$app->content_block('navigation.doc.corpus' => {
  inline => '<li id="plugin-later">Later</li>', position => 20
});
$app->content_block('navigation.doc.corpus' => {
  inline => '<li id="plugin-first">First</li>', position => 10
});
$app->content_block('navigation.doc' => {inline => '<li id="plugin-root">Root</li>'});

my $nav = [{id => 'corpus', title => 'Corpus'}, {id => 'faq', title => 'FAQ'}];
for (1 .. 2) {
  my $dom = Mojo::DOM->new($app->navigation('doc', $nav));
  is($dom->find('ul.nav > li#plugin-root')->size, 1, 'root extension occurs once');
  is($dom->at('ul.nav > li:first-child > ul > li:first-child')->{id},
    'plugin-first', 'scoped block positions are respected');
  is($dom->at('ul.nav > li:first-child > ul > li:last-child')->{id},
    'plugin-later', 'scoped entries stay inside an otherwise empty section');
  is($dom->at('ul.nav > li:nth-child(2) > a')->all_text, 'FAQ',
    'configured sibling stays in place');
}
is_deeply($nav, [{id => 'corpus', title => 'Corpus'}, {id => 'faq', title => 'FAQ'}],
  'navigation remains unchanged');
my @root_links = $app->navi->list('doc');
is_deeply([map { $_->{title} } @root_links], ['Corpus', 'FAQ'],
  'scoped rendering preserves the stored root navigation');

done_testing;

__END__

