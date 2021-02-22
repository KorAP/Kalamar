package Kalamar::Request;
use Mojo::Promise;

has [qw!controller ua on_start!];

# on_build() accepts a callback returning a promise, that
# will either force direct start of the request (in case the second
# parameter passt in the promise is C<1>) or allowing the
# on_start() parameter to trigger.

has url => sub {
  my $self = shift;
  if (@_) {
    $self->{url} = Mojo::URL->new(shift);
    return $self;
  };
  return $self->{url};
};

has method => sub {
  my $self = shift;
  if (@_) {
    $self->{method} = uc(shift);
    return $self;
  };
  return $self->{method} // 'GET';
};

# Set a start routine that will overwrite start_p
sub set_start_routine {
  my $self = shift;
  if (ref $_[0] eq 'SUB') {
    $self->{_callback} = shift;
  }
  else {
    warn 'Expected subroutine';
  }
}

# Get or set parameters for the transaction
sub param {
  my $self = shift;
  if (scalar(@_) > 0) {
    if (defined $_[0]) {
      $self->{param} = [@_];
    }
    else {
      $self->{param} = undef;
    }
    return $self;
  };
  return $self->{param} // [];
};


sub on_start {
  my $self = shift;
  $self->{_on_start} //= [];
  push @{$self->{_on_start}}, shift;
};


# Start transaction and return a promise
sub start {
  my $self = shift;

  # TODO: Better return a rejected promise
  unless ($self->url) {
    return Mojo::Promise->reject('No URL defined');
  };

  unless ($self->controller) {
    return Mojo::Promise->reject('No controller defined');
  };

  unless ($self->ua) {
    return Mojo::Promise->reject('No useragent defined');
   };

  my @param = ($self->method, $self->url);
  push @param, @{$self->param} if scalar(@{$self->param}) > 0;

  my $tx = $self->ua->build_tx(@param);

  my $c = $self->controller;

  # Set X-Forwarded for
  if ($c->app->renderer->helpers->{'client_ip'}) {
    $tx->req->headers->header(
      'X-Forwarded-For' => $c->client_ip
    );
  };

  # Emit Hook to alter request
  $c->app->plugins->emit_hook(
    before_korap_request => ($c, $tx)
  );

  my $start = $self->{_on_start};

  my $p = Mojo::Promise->resolve($tx, {});
  foreach (@$start) {
    $p = $p->then($_)
  };

  my $ua = $start->ua;
  return $p->then(
    sub {
      my ($tx, $obj) = @_;

      my $skip = $obj->{skip};

      # Default start routine
      return $ua->start_p($tx)->then(
        sub {
          my $tx = shift;
          return Mojo::Promise->resolve($tx, { skip => $skip });
        }
      );
    }
  );

  # Overwritten start routine
  if ($self->{_then}) {
    return $p->then($self->{_then});
  };

  return $p;
};

1;
