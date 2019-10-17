package Kalamar::Plugin::KalamarPages;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::JSON qw/decode_json true false/;
use Mojo::ByteStream 'b';
use Mojo::Util qw/xml_escape deprecated/;


# TODO:
#   Add documentation plugin to programmatically
#   create documentation navigation as a content_block
#   so custom routes to custom templates can easily
#   be configured
sub register {
  my ($plugin, $mojo) = @_;

  # Documentation link
  # TODO: Support opener mechanism, so the link will open the embedded
  # documentation in case it's not there.
  $mojo->helper(
    embedded_link_to => sub {
      my $c = shift;
      my $title = shift;
      my $page = pop;
      my $scope = shift;

      ($page, my $fragment) = split '#', $page;

      my $url = $c->doc->url($scope, $page);
      $url->fragment($fragment) if $fragment;

      return $c->link_to(
        $title,
        $url,
        class => 'doc-link'
      );
    }
  );

  # DEPRECATED: 2019-10-17
  $mojo->helper(
    doc_link_to => sub {
      my $c = shift;
      deprecated 'Deprecated "doc_link_to" in favor of "embedded_link_to"';
      return $c->embedded_link_to(@_)
    }
  );

  # Link to an external page
  $mojo->helper(
    ext_link_to => sub {
      my $c = shift;
      return $c->link_to(@_, target => '_top');
    }
  );

  # DEPRECATED: 2019-10-17
  $mojo->helper(
    doc_ext_link_to => sub {
      my $c = shift;
      deprecated 'Deprecated "doc_ext_link_to" in favor of "ext_link_to"';
      return $c->ext_link_to(@_);
    }
  );

  # Documentation alert - Under Construction!
  $mojo->helper(
    doc_uc => sub {
      my $c = shift;
      return $c->tag('p', $c->loc('underConstruction'));
    }
  );

  $mojo->helper(
    doc_opener => sub {
      my $c = shift;
      my $cb = pop;
      my $page = pop;
      my $scope = shift;
      my $url;
      if ($page) {
        $url = $c->doc->url($scope, $page);
        $url->path->canonicalize;
      }
      else {
        $url = $c->url_for('doc_start');
      };
      return $c->link_to($cb->($c), $url);
    }
  );


  $mojo->helper(
    'doc.url' => sub {
      my $c = shift;
      my $page = pop;
      my $scope = shift;
      if ($scope) {
        return $c->url_with(
          'doc2',
          page => $page,
          scope => $scope
        );
      };

      return $c->url_with(
        'doc1',
        page => $page
      );
    }
  );

  # Documentation navigation helper
  $mojo->helper(
    doc_navi => sub {
      my $c = shift;
      my $items = pop;
      my $scope = shift;

      # Create unordered list
      my $html = '<ul class="nav">'."\n";

      # Embed all link tags
      foreach (@$items) {

        my ($active, $url) = 0;

        # There is a fragment!
        if (index($_->{id}, '#') == 0) {

          my $part_scope = scalar($scope);
          $part_scope =~ s!\/([^\/]+)$!!;
          my $page = $1;
          my $id = $_->{id};
          $id =~ s/^#//;

          $url = $c->doc->url($part_scope, $page);
          $url->fragment($id);
        }

        # There is no fragment
        else {

          # The item is active
          if ($c->stash('page') && $c->stash('page') eq $_->{id}) {
            $active = 1;
          };

          # Generate url with query parameter inheritance
          $url = $c->doc->url($scope, $_->{id});

          # Canonicalize (for empty scopes)
          $url->path->canonicalize;
          $url->fragment('tutorial-top');
        };

        my @classes;
        push(@classes, $_->{'class'}) if $_->{'class'};
        push(@classes, 'active') if $active;


        # New list item
        $html .= '<li';
        if (@classes) {
          $html .= ' class="' . join(' ', @classes) . '"';
        };
        $html .= '>';

        # Translate title
        my $title = $c->loc('Nav_' . $_->{id}, $_->{title});

        # Generate link
        $html .= $c->link_to($title, $url);

        # Set sub entries
        if ($_->{items} && ref($_->{items}) eq 'ARRAY') {
          $html .= "\n";
          my $subscope = $scope ? scalar($scope) . '/' . $_->{id} : $_->{id};
          $html .= $c->doc_navi($subscope, $_->{items});
          $html .= "</li>\n";
        }
        else {
          $html .= "</li>\n";
        };
      };
      return $html . "</ul>\n";
    }
  );


  # Create helper for queries in the tutorial
  $mojo->helper(
    doc_query => sub {
      my ($c, $ql, $q, %param) = @_;

      # Query is not supported in the corpus
      if ($q =~ s/^\*\*\s*//) {
        # Escape query for html embedding
        $q = xml_escape $q;

        return b(
          '<pre class="query tutorial unsupported">' .
            "<code>$q</code>" .
            '<span title="' . $c->loc('notAvailInCorpus') . '">*</span>' .
            '</pre>');
      };

      # Escape query for html embedding
      $q = xml_escape $q;

      # Return tag
      b('<pre class="query tutorial" ' .
          qq!data-query="$q" data-query-cutoff="! .
          ($param{cutoff} ? 1 : 0) .
          '"' .
          qq! data-query-language="$ql">! .
          '<code>' . $q . '</code>' .
          '</pre>'
        );
    }
  );

}

1;



__END__

=pod

=encoding utf8

=head1 NAME

Kalamar::Plugin::KalamarHelpers


=head1 DESCRIPTION

L<Kalamar::Plugin::KalamarHelpers> makes Kalamar specific
helpers for Mojolicious available.


=head1 HELPERS

=head2 embedded_link_to

  %# In templates
  %= embedded_link_to 'Kalamar', 'korap', 'kalamar'

Create a link to the documentation. Accepts a name, a scope, and a page.


=head2 ext_link_to

  %# In templates
  %= ext_link_to 'GitHub', "https://github.com/KorAP/Koral"

Creates a link to an external page, that will be opened in the top frame,
in case it's in an embedded frame.

=head2 doc_uc

  %# In templates
  %= doc_uc

Generates an C<Under Construction> notification.


=head2 doc_opener

Currently not used.


=head2 doc_navi

Returns an HTML representation of the documentation navigation,
based on active navigation items.


=head2 doc_query

  %# In templates
  %= doc_query poliqarp => 'Baum'

Creates an interactive query view for documentation purposes.


=head1 COPYRIGHT AND LICENSE

Copyright (C) 2015-2019, L<IDS Mannheim|http://www.ids-mannheim.de/>
Author: L<Nils Diewald|http://nils-diewald.de/>

Kalamar is developed as part of the L<KorAP|http://korap.ids-mannheim.de/>
Corpus Analysis Platform at the
L<Leibniz Institute for the German Language (IDS)|http://ids-mannheim.de/>,
member of the
L<Leibniz-Gemeinschaft|http://www.leibniz-gemeinschaft.de/en/about-us/leibniz-competition/projekte-2011/2011-funding-line-2/>
and supported by the L<KobRA|http://www.kobra.tu-dortmund.de> project,
funded by the
L<Federal Ministry of Education and Research (BMBF)|http://www.bmbf.de/en/>.

Kalamar is free software published under the
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE>.

=cut
