package Korap;
use Mojo::Base 'Mojolicious';

our $VERSION = '0.01';

# This method will run once at server start
sub startup {
  my $self = shift;

  $self->secrets(['fmhsfjgfchgsdbfgshfxztsbt32477eb45veu4vubrghfgghbtv']);

  $self->plugin('Config');
  $self->plugin('CHI');
  $self->plugin('TagHelpers::Pagination' => {
    prev => '<span><i class="fa fa-caret-left"></i></span>',
    next => '<span><i class="fa fa-caret-right"></i></span>',
    ellipsis => '<span><i class="fa fa-ellipsis-h"></i></span>',
    separator => '',
    current => '<span>{current}</span>',
    page => '<span>{page}</span>'
  });
  $self->plugin('Notifications');
  $self->plugin('Number::Commify');
  push(@{$self->plugins->namespaces}, __PACKAGE__ . '::Plugin');
  $self->plugin('KorapSearch');
  $self->plugin('KorapInfo');
  $self->plugin('KorapTagHelpers');

  $self->helper(
    date_format => sub {
      my ($c, $date) = @_;
      return $date;
    }
  );

  # Routes
  my $r = $self->routes;

  # Create search endpoint
  $r->add_shortcut(
    search => sub {
      shift->route('/search')->to('search#remote')
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

  # Tutorial
  $r->get('/tutorial')->to('tutorial#page')->name('tutorial');
  $r->get('/tutorial/(*tutorial)')->to('tutorial#page');

  my $res = $r->route('/:resource', resource => [qw/collection corpus/]);
  $res->to('search#info');
  $res->search;
  $res->route('/:corpus_id')->search;
#  $r->get(
#    '/:resource/:corpus_id/#doc_id/#match_id',
#    resource => [qw/collection corpus/])->to('search#match')->name('match');
 # /matchInfo?id=...&f=&l=&spans
};


1;

__END__

  # TODO: Write search snippet
