package Kalamar;
use Mojo::Base 'Mojolicious';
use Mojo::ByteStream 'b';
use Mojo::JSON 'decode_json';

our $VERSION;

# Start the application and register all routes and plugins
sub startup {
  my $self = shift;

  # Set version based on package file
  my $pkg = b($self->home . '/package.json')->slurp;
  $Kalamar::VERSION = decode_json($pkg)->{version};

  # Add additional plugin path
  push(@{$self->plugins->namespaces}, __PACKAGE__ . '::Plugin');

  # Set secrets for signed cookies
  if (-e (my $secret = $self->home . '/kalamar.secret')) {
    $self->secrets([
      b($secret)->slurp->split("\n")
    ]);
  };

  # Load plugins
  foreach (
    'Config',                 # Configuration framework
    'Localize',               # Localization framework
    'Notifications',          # Client notifications
    'Search',                 # Abstract Search framework
    'CHI',                    # Global caching mechanism
    'TagHelpers::Pagination', # Pagination widget
    'DocNavi',                # Navigation for documentation
    'KalamarHelpers',         # Specific Helpers for Kalamar
    'KalamarTagHelpers'       # Specific Taghelpers for Kalamar
  ) {
    $self->plugin($_);
  };

  # Configure mail exception
  $self->plugin('MailException' => $self->config('MailException'));

  # Configure documentation navigation
  my $navi = b($self->home . '/templates/doc/_nav.json')->slurp;
  $self->config(navi => decode_json($navi));

  # Establish routes
  my $r = $self->routes;

  # Base query page
  $r->get('/')->to('search#query')->name('index');

  # Documentation
  $r->get('/doc')->to('documentation#page', page => 'korap');
  $r->get('/doc/:page')->to('documentation#page', scope => undef);
  $r->get('/doc/*scope/:page')->to('documentation#page')->name('doc');
};


1;


__END__


  # Set default totle
#  $self->defaults(
#    layout => 'main',
#    title => 'KorAP - Corpus Analysis Platform'
#  );


  $self->hook(
    before_dispatch => sub {
      my $c = shift;
      my $host = $c->req->headers->header('X-Forwarded-Host');
      if ($host && $host eq 'korap.ids-mannheim.de') {
	$c->req->url->base->path('/kalamar/');
      };
    }) if $self->mode eq 'production';



  # Load plugins
  foreach (qw/
	      Number::Commify
	      /) {
    $self->plugin($_);
  };

  # $self->plugin(AssetPack => { minify => 1 });
  $self->plugin('AssetPack');
  $self->plugin('AssetPack::LibSass');

  # Add assets for AssetPack
  $self->asset(
    'kalamar.css' => (

      # Sass files
      '/sass/style.scss',
      '/sass/sidebar.scss',
      '/sass/tutorial.scss',
      '/sass/hint.scss',
      '/sass/query.scss',
      '/sass/matchinfo.scss',
      '/sass/pagination.scss',
      '/sass/kwic-4.0.scss',
      '/sass/alertify.scss',

      # CSS files
      '/css/font-awesome.min.css',
      '/css/media.css',
      '/css/highlight.css',
      $self->notifications->styles
    )
  );

  $self->asset(
    'kalamar.js' => (
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


  # Base search route
  $r->get('/')->to('search#query')->name('index');

  # Get match information
  my $corpus = $r->route('/corpus/:corpus_id');
  my $doc    = $corpus->route('/#doc_id');
  my $match = $doc->route('/:match_id')
    ->to('search#match_info')
      ->name('match');

  # Tutorial data
  $r->get('/tutorial')->to('tutorial#page', tutorial => 'index');
  $r->get('/tutorial/(*tutorial)')->to('tutorial#page')->name('tutorial');


  # Todo: The FAQ-Page has a contact form for new questions
};


1;


__END__
