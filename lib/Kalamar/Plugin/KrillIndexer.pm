package Kalamar::Plugin::KrillIndexer;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Base -strict;
sub register {
  my ($plugin, $mojo) = @_;

  my $java = `sh -c 'command -v java'`;
  chomp $java;

  if ($java eq '') {
    warn('No java executable found in PATH. ' . __PACKAGE__ . ' requires a JVM.');
    return 0;
  };

  # Add additional command path
  push(@{$mojo->commands->namespaces}, __PACKAGE__);
  return 1;
};

1;
