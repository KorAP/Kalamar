package Korap::Tutorial;
use Mojo::Base 'Mojolicious::Controller';

sub page {
  my $c = shift;

  if ($c->param('embedded')) {
    $c->layout('snippet');
    $c->stash(embedded => 1);
  }
  else {
    $c->layout('default');
  };
  $c->title('KorAP');

  my $page = $c->stash('tutorial');
  return $c->render(template => 'tutorial/' . $page);
};


1;


__END__
