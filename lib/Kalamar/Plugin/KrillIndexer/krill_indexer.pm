package Kalamar::Plugin::KrillIndexer::krill_indexer;
use Mojo::Base 'Mojolicious::Command';

has description => 'Index KorAP data using Krill';
has usage       => sub {
  my $indexer = $ENV{KRILL_INDEXER};
  return "\n" . qx{java -jar $indexer} if $indexer;
  return "\nThe jar file for the indexer can be set using\n" .
    "the environment variable KRILL_INDEXER\n";
};

sub run {
  shift;
  my $indexer = $ENV{KRILL_INDEXER};
  unless ($indexer) {
    warn
      'KRILL_INDEXER not set';
    return 0;
  };

  print join(',', 'java', 'jar', $indexer, @_);
  system('java', '-jar', $indexer, @_);
  return 1;
};

1;
