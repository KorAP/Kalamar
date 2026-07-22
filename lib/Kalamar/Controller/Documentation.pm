package Kalamar::Controller::Documentation;
use Mojo::Base 'Mojolicious::Controller';

# Show documentation page
sub page {
  my $c = shift;

  if ($c->param('embedded')) {
    $c->stash(embedded => 1);
  };

  my @path = ('doc');

  # There is a scope defined
  my $scope = $c->stash('scope');
  push(@path, $scope) if $scope;

  # Use the defined page
  my $page = $c->stash('page');
  push(@path, $page);

  # Set navigation to sidebar
  $c->content_block(
    sidebar => {
      inline => '<nav>' . $c->navigation('doc', $c->config('doc_navi')) . '</nav>'
    }
  );

  # Render template
  $c->stash(sidebar_active => 1);
  $c->stash(main_class => 'page tutorial shifted');
  $c->stash(documentation => 1);
  $c->stash('robots' => 'index,follow');

  # 1. Built-in template, localized via the Localize "Template" dictionary
  #    (e.g. doc/faq -> de/doc/faq for German).
  my $render = $c->render_maybe(
    template => $c->loc('Template_' . join('_', @path), join('/', @path))
  );

  # 2. Localized custom template by directory: a German visitor gets
  #    custom/de/doc/... when that file exists, so instances can ship one
  #    Markdown/EP file per language side by side without a dict entry.
  #    The visitor's language preferences are tried in order (e.g. de-de,
  #    then de); English is the default and handled by step 3.
  unless ($render) {
    my $tries = 0;
    for my $locale (@{$c->localize->locale}) {
      last if $locale =~ /^en(?:-|$)/;
      # The locale is derived from a client-supplied Accept-Language header,
      # so only let well-formed language tags reach the template path.
      next unless $locale =~ /^[a-z]{2,3}(?:-[a-z0-9]+)?\z/i;
      last if ++$tries > 6;
      $render = $c->render_maybe(template => join('/', 'custom', $locale, @path))
        and last;
    };
  };

  # 3. Default (English) custom template.
  $render ||= $c->render_maybe(
    template => $c->loc('Template_' . join('_', 'custom', @path), join('/', 'custom', @path))
  );
  return $render if $render;

  # Legacy links
  if ($scope) {
    if ($scope eq 'korap') {
      return $c->redirect_to('doc', scope => 'development');
    };
  } elsif ($page eq 'korap') {
    return $c->redirect_to('doc', page => 'development');
  };

  return $c->reply->not_found;
};


# Contact us
sub contact {
  my $c = shift;

  $c->res->headers->header('X-Robots', 'noindex');

  $c->render(
    template => $c->loc('contact', 'doc/contact')
  );
};


1;


__END__

=pod

=encoding utf8

=head1 NAME

Kalamar::Controller::Documentation


=head1 DESCRIPTION

L<Kalamar::Controller::Documentation> is the controller class for
documentation related endpoints in Kalamar.


=head1 METHODS

L<Kalamar::Controller::Documentation> inherits all methods from
L<Mojolicious::Controller> and implements the following new ones.

=head2 page

  /doc/*scope/:page

Action for all documentation pages.
The following query parameters are supported:

=over 2

=item B<embedded>

A boolean value, indicating if the documentation is embedded in the
user interface or on a separated website.

=back

The following path parameters are supported:

=over 2

=item B<scope>

A top level directory entry for documentation data (like C<KorAP> or C<Query Languages>).

=item B<page>

The requested page in the scope.

=back


=head2 contact

Action for a contact page. Doesn't do anything more meaningful at the moment but
will probably contain a form field for feedback in the future.


=head1 COPYRIGHT AND LICENSE

Copyright (C) 2015-2021, L<IDS Mannheim|http://www.ids-mannheim.de/>
Author: L<Nils Diewald|http://nils-diewald.de/>

Kalamar is developed as part of the L<KorAP|http://korap.ids-mannheim.de/>
Corpus Analysis Platform at the Leibniz Institute for the German Language
(L<IDS|http://ids-mannheim.de/>),
funded by the
L<Leibniz-Gemeinschaft|http://www.leibniz-gemeinschaft.de>
and supported by the L<KobRA|http://www.kobra.tu-dortmund.de> project,
funded by the Federal Ministry of Education and Research
(L<BMBF|http://www.bmbf.de/en/>).

Kalamar is free software published under the
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE>.

=cut
