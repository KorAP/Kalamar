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
    'Mojolicious' => '8.18',
    'Mojolicious::Plugin::TagHelpers::Pagination' => 0.07,
    'Mojolicious::Plugin::TagHelpers::MailToChiffre' => 0.10,
    'Mojolicious::Plugin::ClosedRedirect' => 0.14,
    'Mojolicious::Plugin::Notifications' => 1.03,
    'Mojolicious::Plugin::MailException' => 0.20,
    'Mojolicious::Plugin::Util::RandomString' => 0.08,
    'Mojolicious::Plugin::CHI' => 0.20,
    'Mojolicious::Plugin::ClientIP' => 0.01,
    'Cache::FastMmap' => 1.47,
    'Data::Serializer' => 0.60,
    'Mojo::JWT' => 0.05,
    'Test::Mojo::Session' => 1.05,
    'Test::Mojo::WithRoles' => 0.02,

    # Required for Data::Serializer at the moment
    'JSON' => 4.02,

    # Required for bundled plugins
    'Mojolicious::Plugin::Piwik' => 0.26,

    # Currently on GitHub only (github.com/akron)
    'Mojolicious::Plugin::Localize' => 0.20,
    'Mojolicious::Plugin::TagHelpers::ContentBlock' => 0.08,
  },
  test => {
    TESTS => 't/*.t'
  }
);
