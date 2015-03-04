package Korap;
use Mojo::Base 'Mojolicious';
use Mojo::ByteStream 'b';

our $VERSION = '0.13';

# Start dev with
# morbo -w lib -w templates -w public/sass -w public/js -w public/css script/korap
# morbo -m test -w lib -w templates -w public/sass -w public/js -w public/css script/korap

# Start the application and register all routes and plugins
sub startup {
  my $self = shift;

  $self->defaults(layout => 'default');

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
	      Search
	      KorapHelpers
	      KorapTagHelpers
	     /) {
    $self->plugin($_);
  };

#  $self->plugin(AssetPack => { minify => 1 });
  $self->plugin('AssetPack');
  $self->plugin('AssetPack::LibSass');
  $self->plugin('MailException' => $self->config('MailException'));

  # Add assets for AssetPack
  $self->asset(
    'korap.css' => (
      '/sass/style.scss',
      '/sass/sidebar.scss',
      '/sass/tutorial.scss',
      '/sass/hint.scss',
      '/sass/query.scss',
      '/sass/matchinfo.scss',
      '/sass/pagination.scss',
      '/sass/kwic-4.0.scss',
      '/css/media.css',
      '/css/font-awesome.min.css',
      '/css/highlight.css',
      '/sass/alertify.scss',
      $self->notifications->styles
    )
  );

  $self->asset(
    'korap.js' => (
#      '/js/d3.v3.min.js',
#      '/js/dagre-d3.min.js',
#      '/js/dagre-d3.js',
#      '/js/translateTree.js',
      '/js/tutorialCookie.js',
      '/js/translateTable.js',
      '/js/hint.js',
      '/js/highlight.pack.js',
      '/js/ajax.js',
      $self->notifications->scripts
    )
  );

  $self->helper(
    date_format => sub {
      my ($c, $date) = @_;
      return $date;
    }
  );

  # Routes
  my $r = $self->routes;

  # Base search route
  $r->get('/')->to('search#query')->name('index');

  # Get match information
  my $corpus = $r->route('/corpus/:corpus_id');
  my $doc    = $corpus->route('/#doc_id');
  my $match = $doc->route('/:match_id')->to('search#match_info')->name('match');

  # Tutorial data
  $r->get('/tutorial')->to('tutorial#page', tutorial => 'index');
  $r->get('/tutorial/(*tutorial)')->to('tutorial#page')->name('tutorial');
};


1;


__END__
