package Kalamar::Plugin::Plugins;
use Mojo::Base 'Mojolicious::Plugin';

# Register the plugin
sub register {
  my ($plugin, $app, $param) = @_;

  # Load parameter from config file
  if (my $config_param = $app->config('Kalamar-Plugins')) {
    $param = { %$param, %$config_param };
  };

  # There are default plugins to be registered
  if ($param->{default_plugins}) {

    # Read default plugins file
    my $default = Mojo::File->new($param->{default_plugins});
    my $json_array = $default->slurp;

    # If any scripts are defined
    if ($json_array) {

      # Add default plugins, if exist

      # TODO:
      #   Return json only and load from javascript!
      $app->routes->get('/js/plugins.js')->to(
        cb => sub {
          my $c = shift;
          $c->res->headers->cache_control('no-cache');
          # $c->res->headers->content_type('application/javascript;charset=UTF-8');
          $c->render(
            format => 'js',
            text => 'KorAP.Plugins=' . $json_array
          );
        }
      )->name('plugins');

      $app->content_block(
        scripts => {
          inline => '<script src="' . $app->url_for('plugins') . '"></script>'
        }
      );
    };
  };

  # TODO:
  #   Add user registered plugins as a path

  # TODO:
  #   Add sources to CORS.
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

=item B<default_plugins>

Path for default plugins (mandatory for all users) to register in the
frontend.

=back

=head2 COPYRIGHT AND LICENSE

Copyright (C) 2020, L<IDS Mannheim|http://www.ids-mannheim.de/>
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
