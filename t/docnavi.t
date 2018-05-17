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
$app->routes->get('/doc/*scope/:page')->to(cb => sub {})->name('doc');

# Load plugin to test
$app->plugin('KalamarHelpers');

my $languages = [qw/en de/];
$app->plugin('Localize' => {
  dict => {
    Nav => {
      _ => sub { $languages },
      -en => {
        faq => 'F.A.Q.',
        '#default-foundries' => 'Default Foundries',
      },
      de => {
        faq => 'Häufige Fragen',
        '#default-foundries' => 'Standard Foundries'
      }
    }
  }
});

my $navi = [
  {
    id => 'korap',
    title => 'KorAP'
  }
];

my $render = $app->doc_navi($navi);
like($render, qr!/doc/korap!, 'Path matches doc/korap');
like($render, qr!KorAP!, 'Title matches');

$navi = [
  {
    id => 'korap',
    title => 'KorAP'
  },
  {
    id => 'krill',
    title => 'Krill'
  }
];

$render = $app->doc_navi($navi);
like($render, qr!/doc/korap!, 'Path matches doc/korap');
like($render, qr!KorAP!, 'Title matches');
like($render, qr!/doc/krill!, 'Path matches doc/krill');
like($render, qr!Krill!, 'Title matches');

$navi = [
  {
    id => 'korap',
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
    title => 'F.A.Q.'
  }
];

$render = $app->doc_navi($navi);
like($render, qr!/doc/korap!, 'Path matches doc/korap');
like($render, qr!/doc/korap/krill!, 'Path matches korap/krill');
like($render, qr!/doc/faq!, 'Path matches doc/faq');

$navi = [
  {
    id => 'korap',
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
    title => 'F.A.Q.'
  }
];

$render = $app->doc_navi($navi);
like($render, qr!/doc/korap!, 'Path matches doc/korap');
like($render, qr!/doc/korap/krill!, 'Path matches korap/krill');
like($render, qr!/doc/korap/koral!, 'Path matches korap/koral');
like($render, qr!/doc/ql!, 'Path matches doc/ql');
like($render, qr!/doc/ql/cosmas2!, 'Path matches doc/ql/cosmas2');
like($render, qr!/doc/ql/poliqarp-plus!, 'Path matches doc/ql/poliqarp-plus');
like($render, qr!/doc/ql/poliqarp-plus#segments!,
     'Path matches doc/ql/poliqarp-plus#segments');
like($render, qr!/doc/ql/poliqarp-plus#complex!,
     'Path matches doc/ql/poliqarp-plus#complex');
like($render, qr!/doc/faq!, 'Path matches doc/faq');


my $c = $app->build_controller;
$c->stash(page => 'korap');
$render = $c->doc_navi($navi);
like($render, qr!/doc/korap!, 'Path matches doc/korap');
like($render, qr!/doc/korap/krill!, 'Path matches korap/krill');
like($render, qr!/doc/ql!, 'Path matches doc/ql');
like($render, qr!/doc/ql/poliqarp-plus#segments!,
     'Path matches doc/ql/poliqarp-plus#segments');
like($render, qr!/doc/ql/poliqarp-plus#complex!,
     'Path matches doc/ql/poliqarp-plus#complex');
like($render, qr!class="active".*?KorAP!, 'Active value for KorAP');

$c->stash(page => 'poliqarp-plus');
$render = $c->doc_navi($navi);
like($render, qr!/doc/korap!, 'Path matches doc/korap');
like($render, qr!/doc/korap/krill!, 'Path matches korap/krill');
like($render, qr!/doc/ql!, 'Path matches doc/ql');
like($render, qr!/doc/ql/poliqarp-plus#segments!,
     'Path matches doc/ql/poliqarp-plus#segments');
like($render, qr!/doc/ql/poliqarp-plus#complex!,
     'Path matches doc/ql/poliqarp-plus#complex');
like($render, qr!class="active".*?Poliqarp\+!, 'Active value for Poliqarp+');


$navi = [
  {
    id => 'korap',
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
    title => 'F.A.Q.'
  }
];
$render = $c->doc_navi($navi);

like($render, qr!/doc/korap!, 'Path matches doc/korap');
like($render, qr!/doc/korap/krill!, 'Path matches korap/krill');
like($render, qr!/doc/ql!, 'Path matches doc/ql');
like($render, qr!/doc/ql/poliqarp-plus#segments!,
     'Path matches doc/ql/poliqarp-plus#segments');
like($render, qr!/doc/ql/poliqarp-plus#complex!,
     'Path matches doc/ql/poliqarp-plus#complex');
like($render, qr!class="folded active".*?Poliqarp\+!, 'Active and folded value for Poliqarp+');


# Test for translations
$navi = [
  {
    id => 'korap',
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
    title => 'F.A.Q.'
  }
];

$render = $app->doc_navi($navi);
like($render, qr!/doc/korap!, 'Path matches doc/korap');
like($render, qr!/doc/korap/krill!, 'Path matches korap/krill');
like($render, qr!<a href="/doc/korap/krill(?:#[^"]+)?">Krill</a>!,
     'Path matches korap/krill');
like($render, qr!<a href="/doc/faq(?:#[^"]+)?">F\.A\.Q\.</a>!,
     'Path matches FAQ');

# Change preferred language
$languages = [qw/de en/];

$render = $app->doc_navi($navi);
like($render, qr!/doc/korap!, 'Path matches doc/korap');
like($render, qr!/doc/korap/krill!, 'Path matches korap/krill');
like($render, qr!<a href="/doc/korap/krill(?:#[^"]+)?">Krill</a>!,
     'Path matches korap/krill');
like($render, qr!<a href="/doc/faq(?:#[^"]+)?">Häufige Fragen</a>!,
     'Path matches FAQ');


done_testing;

__END__

