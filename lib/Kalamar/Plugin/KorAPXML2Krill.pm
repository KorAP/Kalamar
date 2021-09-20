package Kalamar::Plugin::KorAPXML2Krill;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Base -strict;
sub register {
  my ($plugin, $mojo) = @_;
  if (eval {
    require KorAP::XML::Krill;
    1;
  }) {
    # Add additional command path
    push(@{$mojo->commands->namespaces}, __PACKAGE__);
    return 1;
  };
  return 0;
};
1;
