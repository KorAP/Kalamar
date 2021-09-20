package Kalamar::Plugin::KorAPXML2Krill::korapxml2krill;
use Mojo::Base 'Mojolicious::Command';
has description => 'Merge KorAP-XML data and create Krill documents';
has usage       => sub {
  return qx{korapxml2krill --help};
};
sub run {
  shift;
  system('korapxml2krill', @_);
  return 1;
};
1;
