package Mojolicious::Plugin::DowntimeCalendar::Hosts;
use Mojo::Base -base;
use Socket qw(AF_INET AF_INET6 SOCK_STREAM AI_CANONNAME NI_NUMERICHOST getaddrinfo getnameinfo inet_pton inet_ntop);
use Sys::Hostname qw(hostname);

sub normalize {
  my ($class, $host) = @_;
  return '' unless defined $host;
  $host =~ s/^\s+|\s+$//g;
  $host = lc $host;
  $host =~ s/^\[([^\]]+)\]$/$1/;
  $host =~ s/\.$//;
  for my $family (AF_INET, AF_INET6) {
    my $packed = eval { inet_pton($family, $host) };
    return inet_ntop($family, $packed) if $packed;
  }
  return $host;
}

sub discover {
  my ($class, %args) = @_;
  my @hosts = @{$args{hosts} // []};
  # An explicit identity replaces the container's private hostname and addresses.
  push @hosts, $ENV{KORAP_HOSTNAME} || hostname() unless @hosts;
  my @aliases = @hosts;
  for my $host (@hosts) {
    $host = $class->normalize($host);
    push @aliases, $1 if $host =~ /^([^. :]+)\./ && !inet_pton(AF_INET, $host);
    next unless $args{resolve};
    my ($error, @addresses) = getaddrinfo($host, undef, {socktype => SOCK_STREAM, flags => AI_CANONNAME});
    next if $error;
    for my $address (@addresses) {
      push @aliases, $address->{canonname} if $address->{canonname};
      my ($err, $ip) = getnameinfo($address->{addr}, NI_NUMERICHOST);
      push @aliases, $ip unless $err;
    }
  }
  my %seen;
  return [sort grep {length && !$seen{$_}++} map {$class->normalize($_)} @aliases];
}

sub matches {
  my ($class, $location, $hosts) = @_;
  my %hosts = map {$_ => 1} @$hosts;
  # LOCATION is plain iCalendar TEXT, already unescaped by Data::ICal.
  for my $host (split /[,;\s]+/, $location // '') {
    $host = $class->normalize($host);
    return 1 if $host eq '*' || $hosts{$host};
  }
  return 0;
}

1;
