package Korap::Tutorial;
use Mojo::Base 'Mojolicious::Controller';

sub page {
  my $c = shift;
  $c->layout('snippet');
  $c->title('KorAP');

  my $page = $c->stash('tutorial');

  $c->render(template => 'tutorial');
};

1;


__END__
