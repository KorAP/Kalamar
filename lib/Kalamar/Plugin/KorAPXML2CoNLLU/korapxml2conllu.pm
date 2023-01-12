package Kalamar::Plugin::KorAPXML2CoNLLU::korapxml2conllu;
use Mojo::Base 'Mojolicious::Command';

has description => 'Conversion of KorAP-XML zips to CoNLL-U';
has usage       => sub {
  return qx{korapxml2conllu --help};
};

sub run {
  shift;
  system('korapxml2conllu', @_);
  return 1;
};

1;
