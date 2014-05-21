package Korap::Search;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub remote {
  my $c = shift;

  # Render template "example/welcome.html.ep" with message
  $c->render(template => 'search');
};



1;
