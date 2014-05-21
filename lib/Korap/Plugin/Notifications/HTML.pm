package Korap::Plugin::Notifications::HTML;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Collection 'c';
use Mojo::ByteStream 'b';
use Mojo::Util qw/xml_escape/;

# Nothing to register
sub register {};


# Notification method
sub notifications {
  my ($self, $c, $notify_array) = @_;

  my $html = '';
  foreach my $note (@$notify_array) {
    my $type = shift @$note;
    $html .= qq{<div class="notify-$type">};
    $html .= c(@$note)->grep(sub { !ref $_ })
                      ->map(sub { return xml_escape($_) })
                      ->join('<br />')
                      ->to_string;
    $html .= "</div>\n";
  };

  return b $html;
};


1;


__END__
