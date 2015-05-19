package Kalamar;
use Mojo::Base 'Mojolicious';
use Mojo::ByteStream 'b';
use Mojo::JSON 'decode_json';

# Sync with package.json
our $VERSION = '0.15.0';

# TODO: The FAQ-Page has a contact form for new questions

# Start the application and register all routes and plugins
sub startup {
  my $self = shift;

  # Set version based on package file
  # my $pkg = b($self->home . '/package.json')->slurp;
  # $Kalamar::VERSION = decode_json($pkg)->{version};

  # Add additional plugin path
  push(@{$self->plugins->namespaces}, __PACKAGE__ . '::Plugin');

  # korap.ids-mannheim.de specific path prefixing
  $self->hook(
    before_dispatch => sub {
      my $c = shift;
      my $host = $c->req->headers->header('X-Forwarded-Host');
      if ($host && $host eq 'korap.ids-mannheim.de') {
	$c->req->url->base->path('/kalamar/');
	$c->stash(prefix => '/kalamar');
      };
    }) if $self->mode eq 'production';


  # Cache static assets
  # (not necessary, as long as shipped by nginx or Apache)
  $self->hook(
    after_static => sub {
      my $res = shift->res;
      if ($res->code) {
	$res->headers->cache_control('public, max-age=172800');
      };
    });

  # Set secrets for signed cookies
  if (-e (my $secret = $self->home . '/kalamar.secret')) {

    # Load file and split lines for multiple secrets
    $self->secrets([b($secret)->slurp->split("\n")]);
  }
  else {
    $self->log->warn('Please create a kalamar.secret file');
  };

  # Load plugins
  foreach (
    'Config',                    # Configuration framework
    'Localize',                  # Localization framework
    'Notifications',             # Client notifications
    'Search',                    # Abstract Search framework
    'CHI',                       # Global caching mechanism
    'MailException',              # Alert via Email on exception
    'TagHelpers::Pagination',    # Pagination widget
    'TagHelpers::MailToChiffre', # Obfuscate email addresses
    'KalamarHelpers',            # Specific Helpers for Kalamar
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

  # Base query route
  $r->get('/')->to('search#query')->name('index');

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
};


1;


__END__

=pod

The static files are generated using Grunt.
To get started with Grunt, you need NodeJS > 0.8 ..., you'll need npm. Then you can install and run grunt:

sudo npm install -g grunt-cli
npm install
grunt


Some perl modules are not on github yet, so you need to install them from github using cpanm:

  cpanm git://github.com/Akron/Mojolicious-Plugin-Localize.git


  perl Makefile.PL
  make test

  morbo script/kalamar


=head1 COPYRIGHT AND LICENSE

=head2 Bundled Software

C<ALERTIFY.js> is released under the terms of the MIT License.
C<Almond> is released under the terms of the BSD License.
C<dagre> is released under the terms of the MIT License.
C<Highlight.js> is released under the terms of the BSD License.
C<Jasmine> is released under the terms of the MIT License.
C<RequireJS> is released under the terms of the BSD License.


=head2 Original Software

Copyright (C) 2015, L<IDS Mannheim|http://www.ids-mannheim.de/>
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
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE).

=cut
