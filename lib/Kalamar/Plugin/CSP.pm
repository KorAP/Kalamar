package Kalamar::Plugin::CSP;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::Base -strict;
use Mojo::Util qw!quote trim!;
use List::Util qw'uniq';
use Mojo::ByteStream 'b';

sub register {
  my ($plugin, $app, $param) = @_;

  $param ||= {};

  # Load parameter from Config file
  if (my $config_param = $app->config('CSP')) {
    $param = { %$param, %$config_param };
  };

  my $with_nonce = delete $param->{-with_nonce};

  $app->plugin('Util::RandomString' => {
    nonce => {
      alphabet => '1234567890abcdefghijklmnopqrstuvwxyz' .
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#?(){}<>+-*',
      length   => 20
    }
  });

  unless ($app->renderer->helpers->{'content_block'}) {
    $app->plugin('TagHelpers::ContentBlock');
  };

  # Initialize directives
  my %directives = ();
  foreach (keys %$param) {
    $directives{$_} = ref $param->{$_} eq 'ARRAY' ? $param->{$_} : [$param->{$_}];
  };

  # Add nonce rule for JS
  if ($with_nonce) {
    push(@{$directives{'script-src'} //= []}, 'nonce-{{nonce_js}}');
  };

  # Generate csp based on directives
  my $csp = \( generate(%directives) );

  # Add csp header
  $app->hook(
    before_dispatch => sub {
      my $c = shift;
      if ($$csp) {
        my $line = $$csp;
        if ($with_nonce) {
          $c->stash('csp.nonce' => my $nonce = $c->random_string('nonce'));
          $line =~ s/\'nonce-\{\{nonce_js\}\}\'/\'nonce-$nonce\'/;
        };
        $c->res->headers->header('Content-Security-Policy' => $line);
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

      # TODO:
      #   Probably called from app

      # TODO:
      #   Check for compliance!

      # Add to static directives
      push(@{$directives{$dir} //= []}, $url);
      $csp = \(generate(%directives));
    }
  );

  $app->helper(
    csp_nonce_tag => sub {
      my $c = shift;
      unless ($c->content_block_ok('nonce_js')) {
        return '';
      };

      if ($with_nonce) {
        return b(
          '<script nonce="' . $c->stash('csp.nonce') .
            qq'">//<![CDATA[\n' . $c->content_block('nonce_js') .
            "\n//]]></script>");
      }
      return b('<!-- inline js permitted -->');
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
