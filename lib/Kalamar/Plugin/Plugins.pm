package Kalamar::Plugin::Plugins;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::JSON 'decode_json';
use Mojo::File 'path';

# Register the plugin
sub register {
  my ($plugin, $app, $param) = @_;

  # Load parameter from config file
  if (my $config_param = $app->config('Kalamar-Plugins')) {
    $param = { %$param, %$config_param };
  };

  my @json_array = ();

  # Legacy support
  $param->{default_file} //= $param->{default_plugins};

  # There are default plugins to be registered
  if ($param->{default_file}) {

    # Read default plugins file
    my $default = path($param->{default_file});

    # Use correct working directory
    $default = $app->home->child($default) unless $default->is_abs;

    @json_array = @{ decode_json $default->slurp };
  };

  # There are default plugins to be registered
  if ($param->{default}) {
    if (ref $param->{default} ne 'ARRAY') {
      push @json_array, $param->{default};
    }

    else {
      push @json_array, @{$param->{default}};
    };
  };

  @json_array = grep { $_ ne 'PLUGIN_STUB' } @json_array;

  # If any scripts are defined
  if (@json_array > 0) {

    # TODO:
    #   Add user registered plugins as a path

    # TODO:
    #   Add sources to CORS.

    # Add default plugins, if exist
    $app->routes->get('/settings/plugin/list.json')->to(
      cb => sub {
        my $c = shift;
        $c->res->headers->cache_control('no-cache');
        $c->render(
          json => \@json_array
        );
      }
    )->name('plugin_list');

    $app->content_block(
      scripts => {
        inline => q!<span id="kalamar-plugins" ! .
        q!data-plugins="<%== url_for 'plugin_list' %>"></span>!
      }
    );
  };
};


1;


__END__

=pod

=encoding utf8

=head1 NAME

Kalamar::Plugin::Plugins - Register plugins in the user interface

=head1 DESCRIPTION

L<Kalamar::Plugin::Plugins> is an interface to register embedded plugins
in the Kalamar user interface.

B<WARNING! This is early software and not ready to use!>

=head1 CONFIGURATION

L<Kalamar::Plugin::Plugins> supports the following parameter for the
C<Kalamar-Plugins> configuration section in the Kalamar configuration:

=over 2

=item B<default_file>

Path for default plugins (mandatory to all users) to register in the
frontend.

=item B<default>

Array of default plugins (mandatory to all users) to register in the
frontend.

=back

=head2 COPYRIGHT AND LICENSE

Copyright (C) 2021-2025, L<IDS Mannheim|http://www.ids-mannheim.de/>
Author: L<Nils Diewald|http://nils-diewald.de/>

Kalamar is developed as part of the L<KorAP|http://korap.ids-mannheim.de/>
Corpus Analysis Platform at the
L<Leibniz Institute for the German Language (IDS)|http://ids-mannheim.de/>,
member of the
L<Leibniz-Gemeinschaft|http://www.leibniz-gemeinschaft.de>
and supported by the L<KobRA|http://www.kobra.tu-dortmund.de> project,
funded by the
L<Federal Ministry of Education and Research (BMBF)|http://www.bmbf.de/en/>.

Kalamar is free software published under the
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE>.

=cut
