package Kalamar::Plugin::KorAPXML2CoNLLU::conllu2korapxml;
use Mojo::Base 'Mojolicious::Command';

has description => 'Conversion of KorAP-XML CoNLL-U to KorAP-XML zips';
has usage       => sub {
  return qx{conllu2korapxml --help};
};

sub run {
  shift;
  system('conllu2korapxml', @_);
  return 1;
};

1;
