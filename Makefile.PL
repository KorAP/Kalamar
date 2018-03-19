use 5.010001;
use strict;
use warnings;

use ExtUtils::MakeMaker;

WriteMakefile(
  VERSION_FROM => 'lib/Kalamar.pm',
  ABSTRACT     => 'Mojolicious-based Frontend for KorAP',
  NAME         => 'Kalamar',
  AUTHOR       => 'Nils Diewald',
  BUILD_REQUIRES => {
    'Test::More' => 0
  },
  LICENSE      => 'bsd_2',
  PREREQ_PM => {
    'Mojolicious' => '7.66',
    'Mojolicious::Plugin::TagHelpers::Pagination' => 0.06,
    'Mojolicious::Plugin::TagHelpers::MailToChiffre' => 0.09,
    'Mojolicious::Plugin::ClosedRedirect' => 0.13,
    'Mojolicious::Plugin::Notifications' => 1.01,
    'Mojolicious::Plugin::MailException' => 0.20,
    'Mojolicious::Plugin::CHI' => 0.15,
    'Mojolicious::Plugin::ClientIP' => 0.01,
    'Cache::FastMmap' => 0,
    'Mojo::JWT' => 0.05,

    # Currently on GitHub only (github.com/akron)
    'Mojolicious::Plugin::Search' => 0.07,
    'Mojolicious::Plugin::Localize' => 0.16,
  },
  test => {
    TESTS => 't/*.t'
  }
);
