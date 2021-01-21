package Kalamar;
use Mojo::Base 'Mojolicious';
use Mojo::ByteStream 'b';
use Mojo::URL;
use Mojo::File;
use Mojo::JSON 'decode_json';
use Mojo::Util qw/url_escape deprecated slugify/;
use List::Util 'none';

# Minor version - may be patched from package.json
our $VERSION = '0.41';

# Supported version of Backend API
our $API_VERSION = '1.0';

# TODO: The FAQ-Page has a contact form for new questions
# TODO: Embed query serialization
# TODO: Embed collection statistics
# TODO: Implement tab opener for matches and the tutorial
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

  # Get configuration
  my $conf = $self->config('Kalamar');
  unless ($conf) {
    $self->config(Kalamar => {});
    $conf = $self->config('Kalamar');
  };

  # Check for API endpoint and set the endpoint accordingly
  if ($conf->{api}) {

    # The api endpoint should be defined as a separated path
    # and version string
    $self->log->warn(
      'Kalamar.api is no longer supported in configurations '.
        'in favor of Kalamar.api_path'
      );
  };

  $self->sessions->cookie_name('kalamar');

  # Require HTTPS
  if ($conf->{https_only}) {

    # ... for cookie transport
    $self->sessions->secure(1);

    # For all pages
    $self->hook(
      before_dispatch => sub {
        shift->res->headers->header('Strict-Transport-Security' => 'max-age=3600; includeSubDomains');
      }
    );
  };

  # Run the app from a subdirectory
  if ($conf->{proxy_prefix}) {

    for ($self->sessions) {
      $_->cookie_path($conf->{proxy_prefix});
      $_->cookie_name('kalamar-' . slugify($conf->{proxy_prefix}));
    };

    # Set prefix in stash
    $self->defaults(prefix => $conf->{proxy_prefix});

    # Create base path
    $self->hook(
      before_dispatch => sub {
        shift->req->url->base->path($conf->{proxy_prefix} . '/');
      });
  };

  $self->hook(
    before_dispatch => sub {
      my $h = shift->res->headers;
      $h->header('X-Content-Type-Options' => 'nosniff');
      $h->header(
        'Access-Control-Allow-Methods' =>
          $h->header('Access-Control-Allow-Methods') // 'GET, POST, OPTIONS'
        );
    }
  );

  $conf->{proxy_host} //= 1;

  # Take proxy host
  if ($conf->{proxy_host}) {
    $self->hook(
      before_dispatch => sub {
        my $c = shift;
        if (my $host = $c->req->headers->header('X-Forwarded-Host')) {
          foreach ($c->req->url->base) {
            $_->host($host);
            $_->scheme(undef);
            $_->port(undef);
          };
        };
      }
    );
  };

  # API is not yet set - define the default Kustvakt api endpoint
  $conf->{api_path} //= $ENV{KALAMAR_API} || 'https://korap.ids-mannheim.de/api/';
  $conf->{api_version} //= $API_VERSION;

  # Add development path
  if ($self->mode eq 'development') {
    push @{$self->static->paths}, 'dev';
  };

  # Set proxy timeouts
  if ($conf->{proxy_inactivity_timeout}) {
    $self->ua->inactivity_timeout($conf->{proxy_inactivity_timeout});
  };
  if ($conf->{proxy_connect_timeout}) {
    $self->ua->connect_timeout($conf->{proxy_connect_timeout});
  };

  # Client notifications
  $self->plugin(Notifications => {
    'Kalamar::Plugin::Notifications' => 1,
    JSON => 1,
    HTML => 1
  });

  # Establish content security policy
  $self->plugin(CSP => {
    'default-src' => 'self',
    'style-src' => ['self','unsafe-inline'],
    'script-src' => 'self',
    'connect-src' => 'self',
    'frame-src' => '*',
    'media-src' => 'none',
    'object-src' => 'self',
    'font-src' => 'self',
    'img-src' => ['self', 'data:'],
    -with_nonce => 1
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
    next      => '<span><span>&gt;</span></span>',
    ellipsis  => '<a class="ellipsis"><span><span>...</span></span></a>',
    separator => '',
    current   => '<span>{current}</span>',
    page      => '<span>{page}</span>'
  });

  # Load plugins
  foreach (
    'TagHelpers::MailToChiffre', # Obfuscate email addresses
    'KalamarHelpers',            # Specific Helpers for Kalamar
    'KalamarPages',              # Page Helpers for Kalamar
    'KalamarErrors',             # Specific Errors for Kalamar
    'KalamarUser',               # Specific Helpers for Kalamar Users
    'ClientIP',                  # Get client IP from X-Forwarded-For
    'ClosedRedirect',            # Redirect with OpenRedirect protection
    'TagHelpers::ContentBlock',  # Flexible content blocks
  ) {
    $self->plugin($_);
  };

  my $serializer = 'JSON';

  if (my $chi = $self->config('CHI')) {
    if ($chi->{default}) {
      $chi->{default}->{serializer} = $serializer;
    };
    if ($chi->{user}) {
      $chi->{user}->{serializer} = $serializer;
    };
  };

  # Global caching mechanism
  $self->plugin('CHI' => {
    default => {
      driver => 'Memory',
      global => 1,
      serializer => $serializer
    },
    user => {
      driver => 'Memory',
      global => 1,
      serializer => $serializer
    }
  });

  # Configure mail exception
  if ($self->config('MailException')) {
    $self->plugin('MailException' => $self->config('MailException'));
  };

  # Load further plugins,
  # that can override core functions,
  # therefore order may be of importance
  if (exists $conf->{'plugins'}) {
    foreach (@{$conf->{'plugins'}}) {
      $self->plugin('Kalamar::Plugin::' . $_);
    };
  };

  # Deprecated Legacy code
  if ($self->config('Piwik') &&
        none { $_ eq 'Piwik' } @{$conf->{plugins} // []}) {

    # 2018-11-12
    deprecated 'Piwik is no longer considered a mandatory plugin';
    $self->plugin('Kalamar::Plugin::Piwik');
  };

  # Deprecated Legacy code
  if ($self->config('Kalamar')->{auth_support} &&
        none { $_ eq 'Auth' } @{$conf->{plugins} // []}) {

    # 2018-11-16
    deprecated 'auth_support configuration is deprecated in favor of Plugin loading';
    $self->plugin('Kalamar::Plugin::Auth')
  };

  # Configure documentation navigation
  my $doc_navi = Mojo::File->new($self->home->child('templates','doc','navigation.json'))->slurp;
  $doc_navi = $doc_navi ? decode_json($doc_navi) : [];

  # TODO:
  #   Use navi->add()
  if ($conf->{navi_ext}) {
    push @$doc_navi, @{$conf->{navi_ext}};
  };

  # TODO:
  #   Remove navi entry
  $self->config(doc_navi => $doc_navi);

  $self->navi->set(doc => $doc_navi);

  $self->log->info('API expected at ' . $self->korap->api);

  # Establish routes with authentification
  my $r = $self->routes;

  # Set footer value
  $self->content_block(footer => {
    inline => '<%= embedded_link_to "doc", "V ' . $Kalamar::VERSION . '", "korap", "kalamar" %>',
    position => 100
  });

  # Add nonce script
  $self->content_block(nonce_js => {
    inline => <<'NONCE_JS'
      // Remove the no-js class from the body
      document.body.classList.remove('no-js');
NONCE_JS
  });

  # Base query route
  $r->get('/')->to('search#query')->name('index');

  # Documentation routes
  $r->get('/doc')->to('documentation#page', page => 'korap')->name('doc_start');
  $r->get('/doc/:scope/:page')->to('documentation#page', scope => undef)->name('doc');

  # Settings routes
  if ($self->navi->exists('settings')) {
    $r->get('/settings')->to(
      cb => sub {
        my $c = shift;
        $c->res->headers->header('X-Robots' => 'noindex');
        return $c->render('settings');
      }
    )->name('settings_start');
    $r->get('/settings/:scope/:page')->to(
      scope => undef,
      page => undef
    )->name('settings');
  };

  # Contact route
  $r->get('/contact')->to('documentation#contact');
  $r->get('/contact')->mail_to_chiffre('documentation#contact');

  # API proxy route
  $r->any('/api/v#apiv' => [apiv => ['1.0']])->name('proxy')->to('Proxy#pass');
  $r->any('/api/v#apiv/*path' => [apiv => ['1.0']])->to('Proxy#pass');

  # Match route
  # Corpus route
  my $corpus = $r->get('/corpus')->to('search#corpus_info')->name('corpus');
  my $doc    = $r->any('/corpus/:corpus_id/:doc_id');
  my $text   = $doc->get('/:text_id')->to('search#text_info')->name('text');
  my $match  = $doc->get('/:text_id/:match_id')->to('search#match_info')->name('match');
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

Copyright (C) 2015-2021, L<IDS Mannheim|http://www.ids-mannheim.de/>
Author: L<Nils Diewald|http://nils-diewald.de/>

Kalamar is developed as part of the L<KorAP|http://korap.ids-mannheim.de/>
Corpus Analysis Platform at the
L<Leibniz Institute for the German Language (IDS)|http://ids-mannheim.de/>,
member of the
L<Leibniz-Gemeinschaft|http://www.leibniz-gemeinschaft.de>
and supported by the L<KobRA|http://www.kobra.tu-dortmund.de> project,
funded by the
L<Federal Ministry of Education and Research (BMBF)|http://www.bmbf.de/en/>.

Kalamar is free software published under the
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE>.

=cut
