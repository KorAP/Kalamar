package Kalamar;
use Mojo::Base 'Mojolicious';
use Mojo::ByteStream 'b';
use Mojo::URL;
use Mojo::File;
use Mojo::JSON 'decode_json';
use Mojo::Util qw/url_escape/;

# Minor version - may be patched from package.json
our $VERSION = '0.29';

# Supported version of Backend API
our $API_VERSION = '1.0';

# TODO: The FAQ-Page has a contact form for new questions
# TODO: Embed query serialization
# TODO: Embed collection statistics
# TODO: Implement tab opener for matches and the tutorial
# TODO: Implement a "projects" system
# TODO: Make authentification a plugin

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

  # Load Kalamar configuration
  my $kalamar_conf = $self->config('Kalamar');

  # Check for API endpoint and set the endpoint accordingly
  if ($kalamar_conf->{api}) {

    # The api endpoint should be defined as a separated path
    # and version string
    $self->log->info(
      'Kalamar.api is deprecated in configurations '.
        'in favor of Kalamar.api_path'
      );
  }

  # Set from environment variable
  elsif ($ENV{'KALAMAR_API'}) {
    $kalamar_conf->{api} = $ENV{'KALAMAR_API'};
  }

  # API is not yet set - define
  else {

    $kalamar_conf->{api} =
      Mojo::URL->new($kalamar_conf->{api_path})->path('v' . ($kalamar_conf->{api_version} // $API_VERSION) . '/')->to_string;
  };

  # Add development path
  if ($self->mode eq 'development') {
    push @{$self->static->paths}, 'dev';
  };

  # Check search configuration

  # Set endpoint
  $self->config('Search')->{api} //= $kalamar_conf->{api};

  # Client notifications
  $self->plugin(Notifications => {
    'Kalamar::Plugin::Notifications' => 1,
    JSON => 1,
    'HTML' => 1
  });

  # Localization framework
  $self->plugin(Localize => {
    dict => {
      Q => {
        _ => sub { shift->config('Kalamar')->{'examplecorpus'} },
      }
    },
    resources => ['kalamar.dict', 'kalamar.queries.dict']
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
    'TagHelpers::MailToChiffre', # Obfuscate email addresses
    'KalamarHelpers',            # Specific Helpers for Kalamar
    'KalamarErrors',             # Specific Errors for Kalamar
    'KalamarUser',               # Specific Helpers for Kalamar Users
    'ClientIP',                  # Get client IP from X-Forwarded-For
    'ClosedRedirect',            # Redirect with OpenRedirect protection
    'TagHelpers::ContentBlock',  # Flexible content blocks
    'Piwik'                      # Integrate Piwik/Matomo Analytics
  ) {
    $self->plugin($_);
  };

  # Global caching mechanism
  $self->plugin('CHI' => {
    default => {
      driver => 'Memory',
      global => 1
    },
    user => {
      driver => 'Memory',
      global => 1
    }
  });

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

  # Set footer value
  $self->content_block(footer => {
    inline => '<%= doc_link_to "V ' . $Kalamar::VERSION . '", "korap", "kalamar" %>',
    position => 100
  });

  # Base query route
  $r->get('/')->to('search2#query')->name('index');

  # Corpus route
  $r->get('/corpus')->to('Search2#corpus_info')->name('corpus');

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
  my $text   = $doc->get('/:text_id')->to('search2#text_info')->name('text');
  my $match  = $doc->get('/:text_id/:match_id')->to('search2#match_info')->name('match');

  # User Management
  my $user = $r->any('/user')->to(controller => 'User');
  $user->post('/login')->to(action => 'login')->name('login');
  $user->get('/logout')->to(action => 'logout')->name('logout');
  # $r->any('/register')->to(action => 'register')->name('register');
  # $r->any('/forgotten')->to(action => 'pwdforgotten')->name('pwdforgotten');

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

Copyright (C) 2015-2018, L<IDS Mannheim|http://www.ids-mannheim.de/>
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
