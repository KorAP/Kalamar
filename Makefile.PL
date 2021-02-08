use 5.016;
use strict;
use warnings;

use ExtUtils::MakeMaker;

WriteMakefile(
  VERSION_FROM => 'lib/Kalamar.pm',
  ABSTRACT     => 'Mojolicious-based Frontend for KorAP',
  NAME         => 'Kalamar',
  AUTHOR       => 'Nils Diewald',
  BUILD_REQUIRES => {
    'Test::More' => 0,
    'Test::Mojo::Session' => 1.06,
    'Test::Mojo::WithRoles' => 0.02,
  },
  LICENSE      => 'freebsd',
  PREREQ_PM => {
    'Mojolicious' => '8.42',
    'Mojolicious::Plugin::TagHelpers::Pagination' => 0.08,
    'Mojolicious::Plugin::TagHelpers::MailToChiffre' => 0.11,
    'Mojolicious::Plugin::ClosedRedirect' => 0.15,
    'Mojolicious::Plugin::Notifications' => 1.06,
    'Mojolicious::Plugin::MailException' => 0.24,
    'Mojolicious::Plugin::Util::RandomString' => 0.09,
    'Mojolicious::Plugin::CHI' => 0.20,
    'Mojolicious::Plugin::ClientIP' => 0.02,
    'Cache::FastMmap' => 1.56,
    'Data::Serializer' => 0.65,
    'Mojo::JWT' => 0.09,

    # Required for Data::Serializer at the moment
    'JSON' => 4.03,

    # Required for bundled plugins
    'Mojolicious::Plugin::Piwik' => 0.28,

    # Currently on GitHub only (github.com/akron)
    'Mojolicious::Plugin::Localize' => 0.21,
    'Mojolicious::Plugin::TagHelpers::ContentBlock' => 0.09,
  },
  test => {
    TESTS => 't/*.t'
  }
);
