package Korap;
use Mojo::Base 'Mojolicious';
use Mojo::ByteStream 'b';

our $VERSION = '0.07';

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
	      KorapSearch
	      KorapInfo
	      KorapTagHelpers
	     /) {
    # Oro::Account
    # Oro::Account::ConfirmMail
    $self->plugin($_);
  };

  $self->plugin(AssetPack => { minify => 1 });
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
      '/js/jquery-2.0.0.min.js',
      '/js/tutorialCookie.js',
      '/js/translateTable.js',
#      '/js/translateTree.js',
      '/js/hint.js',
      '/js/highlight.pack.js',
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

  # User account management
  #  $r->route('/login')->acct('login');
  #  $r->route('/login/forgotten')->acct('forgotten');
  #  $r->route('/login/remove')->acct('remove');
  #  $r->route('/register')->acct('register');
  #  $r->route('/logout')->acct('logout');
  #  $r->route('/preferences')->acct('preferences');

  # Base search route
  $r->get('/')->to('search#remote')->name('index');

  # Tutorial data
  $r->get('/tutorial')->to('tutorial#page', tutorial => 'index');
  $r->get('/tutorial/(*tutorial)')->to('tutorial#page')->name('tutorial');

  # Collection data
  my $collection = $r->bridge('/collection');
  $collection->to('info#about_collection');
  my $collection_id = $collection->bridge('/:collection_id');
  # stats
  # $collection_id->;
  $collection_id->search;

  # Corpus data
  my $corpus_res = $r->route('/corpus');
  my $corpus = $corpus_res->route('/:corpus_id');
  # Todo: Stats
  $corpus->search->name('search_corpus');
  my $doc = $corpus->route('/#doc_id');
  $doc->search->name('search_document');

  # Match data
  my $match = $doc->route('/:match_id');
  $match->route->to('info#about_match')->name('match');
#  my $match_foundry = $match->route('/:foundry');
#  $match_foundry->route->to('info#about_match');
#  $match_foundry->route('/:layer')->to('info#about_match');

  # Utilities
  # $r->get('/util/query')->to('search#query');
};


1;
