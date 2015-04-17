package Kalamar::Controller::Documentation;
use Mojo::Base 'Mojolicious::Controller';

# Show documentation page
sub page {
  my $c = shift;
  if ($c->param('embedded')) {
    $c->stash(embedded => 1);
  };

  my @path = ('doc');

  # There is a scope defined
  my $scope = $c->stash('scope');
  push(@path, $scope) if $scope;

  # Use the defined page
  my $page = $c->stash('page');
  push(@path, $page);

  $c->content_for(
    sidebar => '<nav>' . $c->doc_navi($c->config('navi')) . '</nav>'
  );

  # Render template
  return $c->render(
    sidebar_active => 1,
    main_class     => 'tutorial',
    template       => join('/', @path)
  );
};


1;


__END__
