package Kalamar::Plugin::Tei2KorAPXML;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Base -strict;

sub register {
  my ($plugin, $mojo) = @_;

  if (eval {
    require KorAP::XML::TEI;
    1;
  }) {

    # Add additional command path
    push(@{$mojo->commands->namespaces}, __PACKAGE__);
    return 1;
  };

  return 0;
};

1;
