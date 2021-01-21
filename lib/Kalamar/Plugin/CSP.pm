package Kalamar::Plugin::CSP;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Base -strict;
use Mojo::Util 'quote';

sub register {
  my ($plugin, $app, $param) = @_;

  my %directives = ();

  foreach (keys %$param) {
    $directives{$_} = ref $param->{$_} eq 'ARRAY' ? $param->{$_} : [$param->{$_}];
  };

  my $csp = generate(%directives);

  $app->hook(
    before_dispatch => sub {
      my $c = shift;
      if ($csp) {
        $c->res->headers->header('Content-Security-Policy' => $csp);
      };
    }
  );
};


# Quote elements that need to be single quoted, see
# 
sub opt_quote {
  if ($_[0] =~ /^(?:(?:self|none|unsafe-(?:inline|eval|hashes))$|nonce-|sha(?:256|384|512)-)/) {
    return qq!'$_[0]'!;
  };
  return $_[0];
};


sub generate {
  return '' unless @_;
  my %d = @_;
  return join(';', map { $_ . ' ' . join(' ', map { opt_quote($_) } @{$d{$_}}) } sort keys %d) . ';';
};

1;
