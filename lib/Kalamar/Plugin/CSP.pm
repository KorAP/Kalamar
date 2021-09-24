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
  my $disabled   = delete $param->{-disable};

  if ($disabled) {
    $app->log->warn('CSP DISABLED!','NEVER USE IN PRODUCTION!');
  };

  $app->plugin('Util::RandomString' => {
    nonce => {
      alphabet => '1234567890abcdefghijklmnopqrstuvwxyz' .
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ+/',
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
  unless ($disabled) {
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
  };

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
      if ($disabled || !$c->content_block_ok('nonce_js')) {
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


__END__

=pod

=encoding utf8

=head1 NAME

Kalamar::Plugin::CSP - Define CSP rules per config

=head1 DESCRIPTION

This Mojolicious plugin allows to define CSP directives in
a configuration file and programmatically. It will add CSP to all
responses using the C<before_dispatch> hook.


=head2 register

  # Mojolicious
  $app->plugin('Kalamar::Plugin::CSP' => {
    'script-src' => '*',
    'img-src' => ['self', 'data:']
  });

  # Or in the config file
  {
    CSP => {
      'script-src' => '*',
      'img-src' => ['self', 'data:']
    }
  }

Called when registering the plugin.

All L<parameters|/PARAMETERS> can be set either as part of the configuration
file with the key C<CSP> or on registration
(that can be overwritten by configuration).


=head1 PARAMETERS

L<Kalamar::Plugin::CSP> supports all valid CSP directives as parameters.
Multiple values can be defined as arrays.

In addition, the following special parameters for
the C<CSP> configuration section in the Kalamar configuration are supported.

=over 2

=item B<-disable>

Disables all CSP. It's strongly recommended to not use this option
in a production environment.

=item B<-with_nonce>

Adds I<nonce> support, i.e. inline-support, for JavaScript.
Allows the use of the L</csp_nonce_tag>.

=back

All parameters can be set as part of the configuration
file with the key C<CSP> or on registration
(that can be overwritten by configuration).


=head1 HELPERS

=head2 csp_nonce_tag

  # Configure inline JavaScript as a content block:
  $mojo->content_block(
    'nonce_js' => {
      inline => 'console.log("Hallo")'
    }
  );

  # Embed inline JavaScript in templates:
  %= csp_nonce_tag

The nonce tag allows to embed inline JavaScript despite CSP rules.
It requires the C<-with_nonce> configuration flag.
The inline JavaScript can be formulated as a
L<Mojolicious::Plugin::TagHelpers::ContentBlock> with the block name
C<nonce_js>.


=head2 csp.add

  # Mojolicious:
  $app->csp->add('script-src', '*');

Adds a CSP rule to the configuration. This is B<no> controller helper
and should be used only before dispatch.


=head1 COPYRIGHT AND LICENSE

Copyright (C) 2021, L<IDS Mannheim|http://www.ids-mannheim.de/>
Author: L<Nils Diewald|https://www.nils-diewald.de/>

Kalamar is developed as part of the L<KorAP|https://korap.ids-mannheim.de/>
Corpus Analysis Platform at the
L<Leibniz Institute for the German Language (IDS)|https://ids-mannheim.de/>,
member of the
L<Leibniz-Gemeinschaft|http://www.leibniz-gemeinschaft.de>.

Kalamar is free software published under the
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE>.

=cut
