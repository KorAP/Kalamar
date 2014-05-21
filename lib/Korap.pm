package Korap;
use Mojo::Base 'Mojolicious';

# This method will run once at server start
sub startup {
  my $self = shift;

  $self->plugin('Config');
  $self->plugin('TagHelpers::Pagination');

  push(@{$self->plugins->namespaces}, __PACKAGE__ . '::Plugin');
  $self->plugin('KorapSearch');
  $self->plugin('Notifications' => {
    use => 'Humane'
  });

  $self->helper(
    format_thousands => sub {
      shift;
      my ($n, @array) = @_;
      while ($n =~ /\d\d\d\d/) {
	$n =~ s/(\d\d\d)$//;
	unshift @array, $1;
      };
      unshift @array, $n;
      return join ',', @array;
    }
  );


  # Router
  my $r = $self->routes;

  $r->add_shortcut(
    search => sub {
      shift->get('/search')->to('search#remote')
    }
  );

# , resource => [qw/collection corpus/]
  $r->get('/:resource')->search;
  $r->get('/:resource/:cid', resource => [qw/collection corpus/])->search;
  $r->get('/:resource/')->search;

  # /matchInfo?id=...&f=&l=&spans
}

1;
