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



done_testing;

__END__

