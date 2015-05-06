package Kalamar;
use Mojo::Base 'Mojolicious';
use Mojo::ByteStream 'b';
use Mojo::JSON 'decode_json';

our $VERSION;

# TODO: The FAQ-Page has a contact form for new questions

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
  }
  else {
    $self->log->warn('Please create a kalamar.secret file');
  };

  # Load plugins
  foreach (
    'Config',                 # Configuration framework
    'Localize',               # Localization framework
    'Notifications',          # Client notifications
    'Search',                 # Abstract Search framework
    'CHI',                    # Global caching mechanism
    'TagHelpers::Pagination', # Pagination widget
    'KalamarHelpers'          # Specific Helpers for Kalamar

  ) {
    $self->plugin($_);
  };

  # Configure mail exception
  $self->plugin('MailException' => $self->config('MailException'));

  # Configure documentation navigation
  my $navi = b($self->home . '/templates/doc/navigation.json')->slurp;
  $self->config(navi => decode_json($navi)) if $navi;

  # Establish routes
  my $r = $self->routes;

  # Base query page
  $r->get('/')->to('search#query')->name('index');

  # Documentation
  $r->get('/doc')->to('documentation#page', page => 'korap')->name('doc_start');
  $r->get('/doc/:page')->to('documentation#page', scope => undef);
  $r->get('/doc/*scope/:page')->to('documentation#page')->name('doc');

  # Match route
  my $corpus = $r->route('/corpus/:corpus_id');
  my $doc    = $corpus->get('/:doc_id');
  my $text   = $doc->get('/:text_id');
  my $match  = $text->get('/:match_id');
  $match->to('search#match_info')->name('match');
};


1;


__END__

=pod

To get started, you'll need npm. Then you can install and run grunt:

sudo npm install -g grunt-cli
npm install
grunt
