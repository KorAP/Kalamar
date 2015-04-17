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

  # Load documentation navigation
  my $navi = b($self->home . '/templates/doc/_nav.json')->slurp;

  # Add additional plugin path
  push(@{$self->plugins->namespaces}, __PACKAGE__ . '::Plugin');

  # Load plugins
  foreach (qw/Config
	      Localize
	      Notifications
	      DocNavi
	      KalamarTagHelpers/) {
    $self->plugin($_);
  };

  $self->config(navi => decode_json($navi));

  $self->plugin('MailException' => $self->config('MailException'));

  # Establish routes
  my $r = $self->routes;

  $r->get('/')->to(
    cb => sub {
      return shift->render(template => 'intro');
    });

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

  # Set secret for signed cookies
  $self->secrets([
    b($self->home . '/kalamar.secret')->slurp->split("\n")
  ]);

  $self->hook(
    before_dispatch => sub {
      my $c = shift;
      my $host = $c->req->headers->header('X-Forwarded-Host');
      if ($host && $host eq 'korap.ids-mannheim.de') {
	$c->req->url->base->path('/kalamar/');
      };
    }) if $self->mode eq 'production';

  $self->hook(before_dispatch => sub {
      my $c = shift;
      my $h = $c->res->headers;
      $h->header( 'Access-Control-Allow-Origin' => '*' );
      $h->header( 'Access-Control-Allow-Methods' => 'GET, PUT, POST, DELETE, OPTIONS' );
      $h->header( 'Access-Control-Max-Age' => 3600 );
      $h->header( 'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With' );
    });


  # Load plugins
  foreach (qw/CHI
	      TagHelpers::Pagination
	      Number::Commify
	      Search
	      KalamarHelpers
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
