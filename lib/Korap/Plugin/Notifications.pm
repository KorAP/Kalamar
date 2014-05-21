package Korap::Plugin::Notifications;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Util qw/camelize/;

our $TYPE_RE = qr/^[-a-zA-Z_]+$/;

# Todo: Support multiple notification center,
#       so the notifications can be part of
#       json as well as XML
# Possibly use 'n!.a' for flash as this will be in the cookie!

sub register {
  my ($plugin, $mojo, $param) = @_;

  $param ||= {};

  # Load parameter from Config file
  if (my $config_param = $mojo->config('Notifications')) {
    $param = { %$config_param, %$param };
  };

  my $debug = $mojo->mode eq 'development' ? 1 : 0;

  my $center = camelize(delete $param->{use} // __PACKAGE__ . '::HTML');

  if (index($center,'::') < 0) {
    $center = __PACKAGE__ . '::' . $center;
  };

  my $center_plugin = $mojo->plugins->load_plugin($center);
  $center_plugin->register($mojo, $param);

  # Add notifications
  $mojo->helper(
    notify => sub {
      my $c = shift;
      my $type = shift;

      return if $type !~ $TYPE_RE || (!$debug && $type eq 'debug');

      my $array;

      # New notifications
      if ($array = $c->stash('notify.array')) {
	push @$array, [$type => @_];
      }

      # Notifications already set
      else {
	$c->stash->{'notify.array'} = [[$type => @_]];
      };
    }
  );

  # Make notifications flash in case of a redirect
  $mojo->hook(
    after_dispatch => sub {
      my ($c) = @_;
      if ($c->stash('notify.array') && $c->res->is_status_class(300)) {
	$c->flash('notify.array' => delete $c->stash->{'notify.array'});
      };
    }
  );

  # Embed notification display
  $mojo->helper(
    notifications => sub {
      my $c = shift;

      my @notify_array;

      # Get flash notifications
      my $flash = $c->flash('notify.array');
      if ($flash && ref $flash eq 'ARRAY') {

	# Ensure that no harmful types are injected
	push @notify_array, grep { $_->[0] =~ $TYPE_RE } @$flash;

	$c->flash('notify.array' => undef);
      };

      # Get stash notifications
      if ($c->stash('notify.array')) {
	push @notify_array, @{ delete $c->stash->{'notify.array'} };
      };

      # Nothing to do
      return '' unless @notify_array or @_;

      # Forward messages to notification center
      $center_plugin->notifications($c, \@notify_array, @_);
    }
  );
};


1;


__END__

=head2 notify

  $c->notify(error => 'Something went wrong');
  $c->notify(error => { timeout => 4000 } => 'Something went wrong');

=head2 notifications

  %= include_notification_center
  %= include_notification_center qw/warn error success/

The notification won't be included in case no notifications are
in the queue and no parameters are passed.



% if (flash('fine') || flash('alert') || stash('fine') || stash('alert')) {
%= javascript '/js/humane.min.js'
%= javascript begin
  humane.baseCls = 'humane-libnotify';
%   if (flash('fine') || stash('fine')) {
  humane.log("<%= l(flash('fine') || stash('fine')) %>", {
    timeout: 3000,
    clickToClose: true,
    addnCls: 'humane-libnotify-success'
  });
%   };
%   if (flash('alert') || stash('alert')) {
  humane.log("<%= l(flash('alert') || stash('alert')) %>", {
    timeout: 3000,
    clickToClose: true,
    addnCls: 'humane-libnotify-error'
  });
%   };
%= end
% };
