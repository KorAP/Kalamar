package Kalamar;
use Mojo::Base 'Mojolicious';
use Mojo::ByteStream 'b';
use Mojo::JSON 'decode_json';

# Minor version - may be patched from package.json
our $VERSION = '0.15';

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
  my $pkg = b($self->home . '/package.json')->slurp;
  $Kalamar::VERSION = decode_json($pkg)->{version};

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


  # Set secrets for signed cookies
  if (-e (my $secret = $self->home . '/kalamar.secret')) {

    # Load file and split lines for multiple secrets
    $self->secrets([b($secret)->slurp->split("\n")]);
  }

  # File not found ...
  # Kalamar needs secrets in a file to be easily deployable
  # and publishable at the same time.
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

=encoding utf8

=head1 NAME

Kalamar


=head1 DESCRIPTION

L<Kalamar> is a L<Mojolicious|http://mojolicio.us/> based user interface
frontend for the L<KorAP Corpus Analysis Platform|http://korap.ids-mannheim.de/>.

=head1 INSTALLATION

=head2 Generate Static Asset Files

To generate the static asset files (scripts, styles, images ...),
you need NodeJS E<gt> 0.8. This will probably need administration
rights.

  $ npm install
  $ grunt

=head2 Start Server

Kalamar uses the L<Mojolicious|http://mojolicio.us/> framework,
that expects a Perl version of at least 5.10.1.
The recommended environment is based on L<Perlbrew|http://perlbrew.pl/>
with L<App::cpanminus>.

Some perl modules are not on CPAN yet, so you need to install them from GitHub.
The easiest way to do this is using L<App:cpanminus>.
This will probably need administration rights.

  $ cpanm git://github.com/Akron/Mojolicious-Plugin-Search.git
  $ cpanm --force git://github.com/Akron/Mojolicious-Plugin-Localize.git

Then install the dependencies as always and run the test suite.
There is no need to install Kalamar on your system.

  $ perl Makefile.PL
  $ make test

Kalamar can be deployed like all
L<Mojolicious apps|http://mojolicio.us/perldoc/Mojolicious/Guides/Cookbook#DEPLOYMENT>.
The easiest way is to start the built-in server:

  $ perl script/kalamar daemon

Kalamar will then be available at C<localhost:3000> in your browser.


=head1 COPYRIGHT AND LICENSE

=head2 Bundled Software

L<ALERTIFY.js|https://fabien-d.github.io/alertify.js/> is released under the terms of the MIT License.
L<Almond|https://github.com/jrburke/almond> is released under the terms of the BSD License.
L<dagre|https://highlightjs.org/> is released under the terms
of the MIT License.
L<Highlight.js|https://highlightjs.org/> is released under the terms
of the BSD License.
L<Jasmine|https://jasmine.github.io/> is released under the terms
of the MIT License.
L<RequireJS|http://requirejs.org/> is released under the terms
of the BSD License.
L<Font Awesome|http://fontawesome.io> by Dave Gandy
is released under the terms of the L<SIL OFL 1.1|http://scripts.sil.org/OFL>.


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
