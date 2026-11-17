package Mojolicious::Plugin::DowntimeCalendar::Feed;
use Mojo::Base 'Data::ICal';

# Nextcloud emits this RFC 7986 calendar property; Data::ICal's older property
# registry otherwise warns on every successful refresh. Its value is metadata,
# not an instruction to override our configured cache policy.
sub optional_unique_properties {
  my $self = shift;
  return ($self->SUPER::optional_unique_properties, 'refresh-interval');
}

1;
