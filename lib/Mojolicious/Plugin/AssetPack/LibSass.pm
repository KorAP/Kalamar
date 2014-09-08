package Mojolicious::Plugin::AssetPack::LibSass;
use Mojo::Base 'Mojolicious::Plugin';
use CSS::Sass;
use CSS::Minifier::XS;

sub register {
  my ($plugin, $mojo) = @_;

  my $sass = CSS::Sass->new;

  # Todo: Check if AssetPack is loaded
  # Todo: Only minify if necessary

  my $proc = $mojo->asset->preprocessors;

  $proc->remove('scss');
  $proc->add(
    scss => sub {
      my ($as, $text, $file) = @_;
      $$text = CSS::Minifier::XS::minify($sass->compile($$text));
    });
};

1;

__END__
