package Korap;
use Mojo::Base 'Mojolicious';

our $VERSION = '0.03';

# Start the application and register all routes and plugins
sub startup {
  my $self = shift;

  # Set secret for signed cookies
  $self->secrets(['fmhsfjgfchgsdbfgshfxztsbt32477eb45veu4vubrghfgghbtv']);

  # Add additional plugin path
  push(@{$self->plugins->namespaces}, __PACKAGE__ . '::Plugin');

  # Load plugins
  foreach (qw/Config
	      CHI
	      TagHelpers::Pagination
	      Notifications
	      Number::Commify
	      KorapSearch
	      KorapInfo
	      KorapTagHelpers/) {
    # AssetPack
    $self->plugin($_);
  };

#  $self->asset(
#    'korap.css' => (
#      'style.css',
#      'sass/hint.scss',
#      'table.css',
#      'sass/kwic-4.0.scss',
#      'fontawesome/font-awesome.min.css'
#    )
#  );

  $self->helper(
    date_format => sub {
      my ($c, $date) = @_;
      return $date;
    }
  );

  # Routes
  my $r = $self->routes;

  # Base search route
  $r->get('/')->to('search#remote')->name('index');

  # Tutorial data
  $r->get('/tutorial/(*tutorial)', { tutorial => 'start' })
    ->to('tutorial#page')->name('tutorial');

  # Collection data
  my $collection = $r->route('/collection');
  $collection->to('search#info');
  $collection->search;

  # Corpus data
  my $corpus = $r->route('/corpus');
  $corpus->search;
  $corpus->route('/:corpus_id')->search;
  $corpus->route('/:corpus_id/#doc_id')->search;
  $corpus->route('/:corpus_id/#doc_id/:match_id')
         ->to('info#about_match')->name('match');

  # Utilities
  $r->get('/util/query')->to('search#query');
};


1;
