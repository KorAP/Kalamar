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
    'Mojolicious' => '7.23',
    'Mojolicious::Plugin::TagHelpers::Pagination' => 0.06,
    'Mojolicious::Plugin::TagHelpers::MailToChiffre' => 0.09,
    'Mojolicious::Plugin::Notifications' => 0.04,
    'Mojolicious::Plugin::MailException' => 0.18,
    'Mojolicious::Plugin::CHI' => 0.09,
    'Cache::FastMmap' => 0,

    # Currently on GitHub only (github.com/akron)
    'Mojolicious::Plugin::Search' => 0.04,
    'Mojolicious::Plugin::Localize' => 0.15
  },
  test => {
    TESTS => 't/*.t'
  }
);
