package Kalamar::Controller::Tutorial;
use Mojo::Base 'Mojolicious::Controller';

# Todo: Set title as defaults

sub page {
  my $c = shift;

  # Show tutorial embedded
  if ($c->param('embedded')) {
    $c->layout('snippet');
    $c->stash(embedded => 1);
  }

  # Show tutorial in full screen
  else {
    $c->layout('default');
  };

  # Title should be "KorAP"
  $c->title('KorAP');

  my $page = $c->stash('tutorial');
  return $c->render(
    template => 'tutorial/' . $page
  );
};


1;


__END__
