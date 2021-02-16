package Kalamar::Request;
use Mojo::Base -base;
use Mojo::Promise;

has [qw!controller ua!];

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

  # Return promise
  return $self->ua->start_p($tx);
};

1;
