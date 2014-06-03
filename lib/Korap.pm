package Korap;
use Mojo::Base 'Mojolicious';

our $VERSION = '0.01';

# This method will run once at server start
sub startup {
  my $self = shift;

  $self->plugin('Config');
  $self->plugin('TagHelpers::Pagination' => {
    prev => '<span><i class="fa fa-caret-left"></i></span>',
    next => '<span><i class="fa fa-caret-right"></i></span>',
    ellipsis => '<span>&hellip;</span>',
    separator => '',
    current => '<span>{current}</span>',
    page => '<span>{page}</span>'
  });
  $self->plugin('Notifications');
  $self->plugin('Number::Commify');

  push(@{$self->plugins->namespaces}, __PACKAGE__ . '::Plugin');
  $self->plugin('KorapSearch');

  # Routes
  my $r = $self->routes;

  # Create search endpoint
  $r->add_shortcut(
    search => sub {
      shift->get('/search')->to('search#remote')
    }
  );

  $r->get('/')->to(
    cb => sub {
      my $c = shift;
      $c->render(
	text =>
	  'Go to '.
	    $c->link_to('search', '/collection/search'));
    }
  );

  $r->get('/util/query')->to('search#query');

  $r->get('/:resource' => [qw/collection corpus/])->to('search#info');

  # resource => [qw/collection corpus/]
  $r->get('/:resource')->search;
  $r->get('/:resource/:cid', resource => [qw/collection corpus/])->search;
  $r->get('/:resource/')->search;
  # /matchInfo?id=...&f=&l=&spans
};


1;
