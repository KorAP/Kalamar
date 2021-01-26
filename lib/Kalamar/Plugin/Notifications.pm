package Kalamar::Plugin::Notifications;
use Mojo::Base 'Mojolicious::Plugin::Notifications::Engine';
use Mojo::ByteStream 'b';
use Mojo::Util qw/xml_escape quote/;
use Mojo::JSON qw/decode_json encode_json/;
use File::Spec;
use File::Basename;

# Notification method
sub notifications {
  my ($self, $c, $notify_array) = @_;

  return '' unless @$notify_array;

  my $s = '';
  foreach (@$notify_array) {
    $s .= qq{<div class="notify notify-} . $_->[0] . '"';
    $s .= ' data-type=' . quote($_->[0]);
    if (ref $_->[1] && ref $_->[1] eq 'HASH') {
      $s .= ' data-src=' . quote($_->[1]->{src}) if $_->[1]->{src};
    };
    $s .= '>' . xml_escape($_->[-1]) . "</div>\n";
  };
  return b('<noscript>' . $s . '</noscript>');

};


1;
