package Kalamar::Plugin::CSP;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Base -strict;
use Mojo::Util qw!quote trim!;
use List::Util qw'uniq';

sub register {
  my ($plugin, $app, $param) = @_;

  $param ||= {};

  # Load parameter from Config file
  if (my $config_param = $app->config('CSP')) {
    $param = { %$param, %$config_param };
  };

  # Initialize directives
  my %directives = ();
  foreach (keys %$param) {
    $directives{$_} = ref $param->{$_} eq 'ARRAY' ? $param->{$_} : [$param->{$_}];
  };

  # Generate csp based on directives
  my $csp = \( generate(%directives) );

  # Add csp header
  $app->hook(
    before_dispatch => sub {
      my $c = shift;
      if ($$csp) {
        $c->res->headers->header('Content-Security-Policy' => $$csp);
      };
    }
  );

  # Add csp directives
  $app->helper(
    'csp.add' => sub {
      my ($c, $dir, $url) = @_;

      if ($c->tx->{req}) {

        # Add template to content block
        # @{$c->stash->{'csp.' . $name} ...
        $c->app->log->warn('Calling csp.add from controller not yet supported');
        return;
      }

      # Probably called from app

      # Add to static directives
      push(@{$directives{$dir} //= []}, $url);
      $csp = \(generate(%directives));
    }
  );
};


# Quote elements that need to be single quoted
sub opt_quote {
  my $s = trim(shift);
  if ($s =~ /^(?:(?:self|none|unsafe-(?:inline|eval|hashes))$|nonce-|sha(?:256|384|512)-)/) {
    return qq!'$s'!;
  };
  return $s;
};


# Generate CSP string
sub generate {
  return '' unless @_;
  my %d = @_;
  return join(';', map { $_ . ' ' . join(' ', map { opt_quote($_) } uniq @{$d{$_}}) } sort keys %d) . ';';
};

1;
