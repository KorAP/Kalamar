package Kalamar::Plugin::KorAPXML2CoNLLU;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Base -strict;
sub register {
  my ($plugin, $mojo) = @_;
  my $script = `sh -c 'command -v conllu2korapxml'`;
  if ($script ne '') {
    # Add additional command path
    push(@{$mojo->commands->namespaces}, __PACKAGE__);
    return 1;
  };
  return 0;
};
1;
