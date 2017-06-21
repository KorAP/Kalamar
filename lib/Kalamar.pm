package Kalamar;
use Mojo::Base 'Mojolicious';
use Mojo::ByteStream 'b';
use Mojo::File;
use Mojo::JSON 'decode_json';
use Mojo::Util qw/url_escape/;
use File::Temp qw/tmpnam/;

# Minor version - may be patched from package.json
our $VERSION = '0.21';

# TODO: Use CSRF!!!
# TODO: The FAQ-Page has a contact form for new questions
# TODO: Embed query serialization
# TODO: Embed collection statistics
# TODO: Implement tab opener for matches and the tutorial
# TODO: Make the tutorial ql sensitive
# TODO: Implement a "projects" system

# Start the application and register all routes and plugins
sub startup {
  my $self = shift;

  # Set version based on package file
  # This may introduce a SemVer patch number
  my $pkg_path = $self->home->child('package.json');
  if (-e $pkg_path->to_abs) {
    my $pkg = $pkg_path->slurp;
    $Kalamar::VERSION = decode_json($pkg)->{version};
  };

  # Lift maximum template cache
  $self->renderer->cache->max_keys(200);

  # Add additional plugin path
  push(@{$self->plugins->namespaces}, __PACKAGE__ . '::Plugin');


  # Set secrets for signed cookies
  if (-e (my $secret = $self->home->child('kalamar.secret'))) {

    # Load file and split lines for multiple secrets
    $self->secrets([b($secret->slurp)->split("\n")]);
  }

  # File not found ...
  # Kalamar needs secrets in a file to be easily deployable
  # and publishable at the same time.
  else {
    $self->log->warn('Please create a kalamar.secret file');
  };

  # Configuration framework
  $self->plugin('Config');

  $self->log->info('Mode is ' . $self->mode);

  # Specific path prefixing
  my $conf = $self->config('Kalamar');
  if ($conf && $conf->{proxy_prefix}) {

    for ($self->sessions) {
      $_->cookie_path($conf->{proxy_prefix});
      $_->cookie_name('kalamar');
      $_->secure(1);
    };

    # Set prefix in stash
    $self->defaults(prefix => $conf->{proxy_prefix});

    # Create base path
    $self->hook(
      before_dispatch => sub {
        shift->req->url->base->path($conf->{proxy_prefix} . '/');
      });
  };

  # Start fixture server
  if ($self->mode eq 'test') {

    $self->log->info('Mount test server');

    my $mount_point = '/api/v0.1/';

    $self->plugin(Mount => {
      $mount_point => $self->home->child(
        'lib/Kalamar/Apps/test_backend.pl'
      )
    });

    # Fix api endpoints
    $self->config('Kalamar')->{api} = $mount_point;
    $self->config('Search')->{api} = $mount_point;
  };

  # Client notifications
  $self->plugin(Notifications => {
    'Kalamar::Plugin::Notifications' => 1,
    JSON => 1
  });

  # Localization framework
  $self->plugin(Localize => {
    resources => ['kalamar.dict']
  });

  # Pagination widget
  $self->plugin('TagHelpers::Pagination' => {
    prev      => '<span><span>&lt;</span></span>',
    next      => '<span><span>&lt;</span></span>',
    ellipsis  => '<a class="ellipsis"><span><span>...</span></span></a>',
    separator => '',
    current   => '<span>{current}</span>',
    page      => '<span>{page}</span>'
  });

  # Load plugins
  foreach (
    'Search',                    # Abstract Search framework
    'CHI',                       # Global caching mechanism
    'TagHelpers::MailToChiffre', # Obfuscate email addresses
    'KalamarHelpers',            # Specific Helpers for Kalamar
    'KalamarUser',               # Specific Helpers for Kalamar
    'ClientIP'                   # Get client IP from X-Forwarded-For
  ) {
    $self->plugin($_);
  };


  # Configure mail exception
  if ($self->config('MailException')) {
    $self->plugin('MailException' => $self->config('MailException'));
  };

  # Configure documentation navigation
  my $navi = Mojo::File->new($self->home->child('templates','doc','navigation.json'))->slurp;
  $self->config(navi => decode_json($navi)) if $navi;

  $self->log->info('API expected at ' . $self->config->{Kalamar}->{api});

  # Establish routes with authentification
  my $r = $self->routes;

  # Check for auth support
  $self->defaults(
    auth_support => $self->config('Kalamar')->{auth_support}
  );

  # Support auth
  if ($self->stash('auth_support')) {
    $r = $r->under(
      '/' => sub {
        my $c = shift;

        if ($c->session('auth')) {
          $c->stash(auth => $c->session('auth'));
          $c->stash(user => $c->session('user'));
        };
        return 1;
      }
    );
  };

  # Base query route
  $r->get('/')->to('search#query')->name('index');

  # Collection route
  # TODO: Probably rename to /corpus
  $r->get('/collection')->to('Search#collections')->name('collections');
  $r->get('/collection/:id')->to('Search#collection')->name('collection');

  # Documentation routes
  $r->get('/doc')->to('documentation#page', page => 'korap')->name('doc_start');
  $r->get('/doc/:page')->to('documentation#page', scope => undef);
  $r->get('/doc/*scope/:page')->to('documentation#page')->name('doc');

  # Contact route
  $r->get('/contact')->to('documentation#contact');
  $r->get('/contact')->mail_to_chiffre('documentation#contact');

  # Match route
  my $corpus = $r->route('/corpus/:corpus_id');
  my $doc    = $corpus->get('/:doc_id');
  my $text   = $doc->get('/:text_id');
  my $match  = $text->get('/:match_id');
  $match->to('search#match_info')->name('match');

  # User Management
  my $user = $r->any('/user')->to(controller => 'User');
  $user->post('/login')->to(action => 'login')->name('login');
  $user->get('/logout')->to(action => 'logout')->name('logout');
#  $r->any('/register')->to(action => 'register')->name('register');
#  $r->any('/forgotten')->to(action => 'pwdforgotten')->name('pwdforgotten');

  # Default user is called 'korap'
  # $r->route('/user/:user/:collection')
};


1;


__END__

=pod

=encoding utf8

=head1 NAME

Kalamar


=head1 DESCRIPTION

L<Kalamar> is a L<Mojolicious|http://mojolicio.us/> based user interface
frontend for the L<KorAP Corpus Analysis Platform|http://korap.ids-mannheim.de/>.

B<See the README for further information!>

=head2 COPYRIGHT AND LICENSE

Copyright (C) 2015-2017, L<IDS Mannheim|http://www.ids-mannheim.de/>
Author: L<Nils Diewald|http://nils-diewald.de/>

Kalamar is developed as part of the L<KorAP|http://korap.ids-mannheim.de/>
Corpus Analysis Platform at the
L<Institute for the German Language (IDS)|http://ids-mannheim.de/>,
member of the
L<Leibniz-Gemeinschaft|http://www.leibniz-gemeinschaft.de/en/about-us/leibniz-competition/projekte-2011/2011-funding-line-2/>
and supported by the L<KobRA|http://www.kobra.tu-dortmund.de> project,
funded by the
L<Federal Ministry of Education and Research (BMBF)|http://www.bmbf.de/en/>.

Kalamar is free software published under the
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE>.

=cut
