package Kalamar::Plugin::KorAPXML2CoNLLU;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Base -strict;

sub register {
  my ($plugin, $mojo) = @_;

  return 0 unless check_existence();

  # Add additional command path
  push(@{$mojo->commands->namespaces}, __PACKAGE__);
  return 1;
};

sub check_existence {
  my $script = `sh -c 'command -v conllu2korapxml'`;

  return 0 if $script eq '';

  my $version = qx{conllu2korapxml -v};

  if ($version =~ m!v(\d+)\.(\d+)\.(\d+)!) {
    if ($1 < 1 && ($2 < 6 || $2 == 6 && $3 < 1)) {
      warn('conllu2korapxml needs to be at least v0.6.1');
      return 0;
    };
  };

  return 1;
};

1;
