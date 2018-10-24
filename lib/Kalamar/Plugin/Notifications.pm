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

  # Start JavaScript snippet
  my $js .= qq{<script>//<![CDATA[\n};
  $js .= "KorAP.Notifications = [];\n";
  my $noscript = "<noscript>";

  # Add notifications
  foreach (@$notify_array) {
    $js .= 'KorAP.Notifications.push([';
    $js .= quote($_->[0]) . ',' . quote($_->[-1]);
    if (ref $_->[1] && ref $_->[1] eq 'HASH') {
      $js .= ',' . quote($_->[1]->{src}) if $_->[1]->{src};
    };
    $js .= "]);\n";

    $noscript .= qq{<div class="notify notify-} . $_->[0] . '">' .
      xml_escape($_->[-1]) .
	"</div>\n";
  };

  return b($js . "//]]>\n</script>\n" . $noscript . '</noscript>');
};


1;
