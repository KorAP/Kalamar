package Korap::Plugin::Notifications::Humane;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::ByteStream 'b';
use Mojo::JSON;
use File::Spec;
use File::Basename;

has json => sub {
  state $json = Mojo::JSON->new
};

has [qw/base_class base_timeout/];

# Register plugin
sub register {
  my ($plugin, $mojo, $param) = @_;

  # Set config
  $plugin->base_class(   $param->{base_class}   // 'libnotify' );
  $plugin->base_timeout( $param->{base_timeout} // 3000 );

  # Add static path to JavaScript
  push @{$mojo->static->paths},
    File::Spec->catdir( File::Basename::dirname(__FILE__), 'Humane' );
};


# Notification method
sub notifications {
  my ($self, $c, $notify_array, @classes) = @_;

  my $base_class = $self->base_class;

  my %rule;
  while ($classes[0] && index($classes[0], '-') == 0) {
    $rule{shift @classes} = 1;
  };

  return unless @$notify_array || @classes;

  my $js = '';
  unless ($rule{-no_include}) {
    $js .= $c->javascript('/humane.min.js');
  };

  unless ($rule{-no_css}) {
    $js .= $c->stylesheet("/$base_class.css");;
  };

  # Start JavaScript snippet
  $js .= qq{<script>\n} .
    qq!var notify=humane.create({baseCls:'humane-$base_class',timeout:! .
      $self->base_timeout . ",clickToClose:true});\n";

  my ($log, %notify) = ('');

  # Add notifications
  foreach (@$notify_array) {
    $notify{$_->[0]} = 1;
    $log .= '.' . $_->[0] . '(' . $self->json->encode($_->[1])  . ')';
  };
  $log = "notify$log;\n" if $log;

  # Ceate notification classes
  foreach (sort(keys %notify), @classes) {
    $js .= "notify.$_=notify.spawn({addnCls:'humane-$base_class-$_'});\n";
  };

  return b($js . $log . '</script>');
};


1;


__END__
