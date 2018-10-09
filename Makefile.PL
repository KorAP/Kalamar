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
  LICENSE      => 'freebsd',
  PREREQ_PM => {
    'Mojolicious' => '7.78',
    'Mojolicious::Plugin::TagHelpers::Pagination' => 0.06,
    'Mojolicious::Plugin::TagHelpers::MailToChiffre' => 0.09,
    'Mojolicious::Plugin::ClosedRedirect' => 0.14,
    'Mojolicious::Plugin::Notifications' => 1.01,
    'Mojolicious::Plugin::MailException' => 0.20,
    'Mojolicious::Plugin::CHI' => 0.15,
    'Mojolicious::Plugin::ClientIP' => 0.01,
    'Mojolicious::Plugin::Piwik' => 0.20,
    'Cache::FastMmap' => 0,
    'Mojo::JWT' => 0.05,

    # Currently on GitHub only (github.com/akron)
    'Mojolicious::Plugin::Search' => 0.08,
    'Mojolicious::Plugin::Localize' => 0.20,
    'Mojolicious::Plugin::TagHelpers::ContentBlock' => 0.08,
  },
  test => {
    TESTS => 't/*.t'
  }
);
