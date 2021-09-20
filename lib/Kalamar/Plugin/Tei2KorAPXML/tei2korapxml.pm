package Kalamar::Plugin::Tei2KorAPXML::tei2korapxml;
use Mojo::Base 'Mojolicious::Command';

has description => 'Conversion of TEI P5 based formats to KorAP-XML';
has usage       => sub {
  return qx{tei2korapxml --help};
};

sub run {
  shift;
  system('tei2korapxml', @_);
  return 1;
};

1;
