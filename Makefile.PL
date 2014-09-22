use 5.010001;
use strict;
use warnings;

use ExtUtils::MakeMaker;

WriteMakefile(
  VERSION_FROM => 'lib/Korap.pm',
  ABSTRACT     => 'Test Frontend for the KorAP API',
  NAME         => 'Korap',
  AUTHOR       => 'Nils Diewald',
  BUILD_REQUIRES => {
    'Test::More' => 0
  },
  LICENSE      => 'artistic_2',
  PREREQ_PM => {
    'Mojolicious' => '5.00',
#    'Mojolicious::Plugin::Oro::Account' => 0.07,
    'Mojolicious::Plugin::TagHelpers::Pagination' => 0.04,
    'Mojolicious::Plugin::Notifications' => 0.04,
    'Mojolicious::Plugin::MailException' => 0.18,
    'Mojolicious::Plugin::CHI' => 0.09,
    'Cache::FastMmap' => 0,
    'Mojolicious::Plugin::Number::Commify' => '0.022',
    'JSON::XS' => 0.0,
    'Mojolicious::Plugin::AssetPack' => 0.23,
    'JavaScript::Minifier::XS' => 0.09,
    'CSS::Minifier::XS' => 0.09,
    'CSS::Sass' => '0.8.1'
#    'Mojolicious::Plugin::Search' => 0.01,
  },
  test => {
    TESTS => 't/*.t'
  }
);
