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
    'Test::Output' => 0,
  },
  LICENSE      => 'freebsd',
  PREREQ_PM => {
    'Mojolicious' => '9.19',
    'Mojolicious::Plugin::TagHelpers::Pagination' => 0.10,
    'Mojolicious::Plugin::TagHelpers::MailToChiffre' => 0.13,
    'Mojolicious::Plugin::ClosedRedirect' => 0.15,
    'Mojolicious::Plugin::Notifications' => 1.07,
    'Mojolicious::Plugin::MailException' => 0.24,
    'Mojolicious::Plugin::Util::RandomString' => 0.09,
    'Mojolicious::Plugin::CHI' => 0.20,
    'Mojolicious::Plugin::ClientIP' => 0.02,
    'Mojolicious::Plugin::AutoSecrets' => 0.006,
    'Mojolicious::Plugin::TagHelpers::ContentBlock' => 0.11,
    'Cache::FastMmap' => 1.56,
    'Data::Serializer' => 0.65,
    'Mojo::JWT' => 0.09,

    # Required for Data::Serializer at the moment
    'JSON' => 4.03,

    # Required for older perl bundles
    'List::Util' => 1.45,

    # Required for bundled plugins
    'Mojolicious::Plugin::Piwik' => 0.28,

    # Currently on GitHub only (github.com/akron)
    'Mojolicious::Plugin::Localize' => 0.21
  },

  META_MERGE   => {
    'meta-spec' => { version => 2 },
    requires  => { perl => '5.010001' },
    resources => {
      license     => 'https://opensource.org/licenses/BSD-2-Clause',
      repository  => {
        type => 'git',
        url => 'https://github.com/KorAP/Kalamar.git',
        web => 'https://github.com/KorAP/Kalamar',
      },
      bugtracker => {
        web => 'https://github.com/KorAP/Kalamar/issues'
      }
    }
  },

  test => {
    TESTS => 't/*.t t/plugin/*.t'
  }
);
