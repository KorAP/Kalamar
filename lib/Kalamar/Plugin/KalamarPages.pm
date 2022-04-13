package Kalamar::Plugin::KalamarPages;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::JSON qw/decode_json true false/;
use Mojo::ByteStream 'b';
use Mojo::Util qw/xml_escape deprecated/;

our $navi = {};

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

      # The embedded link now expects at least 3 parameters:
      #   - The realm, which is identical to the named route
      #   - The title of the link
      #   - An optional scope, which is a first level path for navigation
      #   - The page to link to (accepting a fragment)
      my $realm = shift;
      my $title = shift;
      my $page = pop;
      my $scope = shift;

      ($page, my $fragment) = split '#', $page;

      my $url = $c->url_with($realm, page => $page, scope => $scope);
      my $p = $url->query;

      # Remove oauth-specific psarameters
      # (Maybe only allowing specific parameters is better though)
      $p->remove('client_id')
        ->remove('client_secret')
        ->remove('state')
        ->remove('scope')
        ->remove('redirect_uri');
      $url->fragment($fragment) if $fragment;
      $url->path->canonicalize;

      return $c->link_to(
        $title,
        $url,
        class => 'embedded-link'
      );
    }
  );

  # DEPRECATED: 2019-10-17
  $mojo->helper(
    doc_link_to => sub {
      my $c = shift;
      deprecated 'Deprecated "doc_link_to" in favor of "embedded_link_to"';
      return $c->embedded_link_to('doc', @_)
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

  # Page alert - Under Construction!
  $mojo->helper(
    under_construction => sub {
      my $c = shift;
      return $c->tag('p', $c->loc('underConstruction', 'Under Construction!'));
    }
  );

  # Page alert - Under Construction!
  # DEPRECATED: 2019-10-17
  $mojo->helper(
    doc_uc => sub {
      my $c = shift;
      deprecated 'Deprecated "doc_uc" in favor of "under_construction"';
      return $c->under_construction
    }
  );

  # Page title helper
  $mojo->helper(
    page_title => sub {
      my $c = shift;
      return $c->tag('h2' => (id => 'page-top') => $c->stash('title'))
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
        $url = $c->url_with('doc', scope => $scope, page => $page);
        $url->path->canonicalize;
      }
      else {
        $url = $c->url_for('doc_start');
      };
      return $c->link_to($cb->($c), $url);
    }
  );


  # DEPRECATED: 2019-10-24
  $mojo->helper(
    'doc.url' => sub {
      deprecated 'Deprecated "doc->url" in favor of direct usage with "url_with"';
      my $c = shift;
      my $page = pop;
      my $scope = shift;
      return $c->url_with(
        'doc',
        page => $page,
        scope => $scope
      );
    }
  );

  # Documentation navigation helper
  # DEPRECATED: 2019-10-24
  $mojo->helper(
    doc_navi => sub {
      deprecated 'Deprecated "docnavi" in favor of "navigation"';
      my $c = shift;
      return $c->navigation('doc', @_)
    }
  );

  # Navigation helper
  $mojo->helper(
    'navigation' => sub {
      my $c = shift;
      my $realm = shift;
      my $items = pop;
      my $scope = shift;

      # Take items from central list
      unless ($items) {
        $items = $navi->{$realm};

        # Realm has no entries
        return '' unless $items;
      }

      # Set realm
      else {
        $navi->{$realm} = $items;
      };

      # Create unordered list
      my $html = '<ul class="nav nav-'.$realm;
      my $men_active = 0;
      my $item_str = '';

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

          $url = $c->url_with($realm, scope => $part_scope, page => $page);

          # Canonicalize (for empty scopes)
          $url->path->canonicalize;
          $url->fragment($id);
        }

        # There is no fragment
        else {

          # The item is active
          if ($c->stash('page') && $c->stash('page') eq $_->{id}) {
            $active = 1;
            $men_active = 1;
          };

          # Generate url with query parameter inheritance
          $url = $c->url_with($realm, scope => $scope, page => $_->{id});

          # Canonicalize (for empty scopes)
          $url->path->canonicalize;
          $url->fragment('page-top');
        };

        my @classes;
        push(@classes, $_->{'class'}) if $_->{'class'};
        push(@classes, 'active') if $active;

        # New list item
        $item_str .= '<li';
        if (@classes) {
          $item_str .= ' class="' . join(' ', @classes) . '"';
        };
        $item_str .= '>';

        # Translate title
        my $title = $c->loc('Nav_' . $_->{id}, $_->{title});

        # Generate link
        $item_str .= $c->link_to($title, $url);

        # Set sub entries
        if ($_->{items} && ref($_->{items}) eq 'ARRAY') {
          $item_str .= "\n";
          my $subscope = $scope ? scalar($scope) . '/' . $_->{id} : $_->{id};
          $item_str .= $c->navigation($realm, $subscope, $_->{items});
          $item_str .= "</li>\n";
        }
        else {
          $item_str .= "</li>\n";
        };
      };

      $html .= ' active' if $men_active;
      $html .= '">'."\n";
      $html .= $item_str;
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

  # Set a navigation list to a realm
  $mojo->helper(
    'navi.set' => sub {
      my $c = shift;
      my $realm = shift;
      my $list = shift;

      $navi->{$realm} = $list;
    }
  );

  # Add an item to the realm
  $mojo->helper(
    'navi.add' => sub {
      my $c = shift;
      my $realm = shift;
      my $navi_realm = ($navi->{$realm} //= []);
      my $title = shift;
      my $id = shift;

      push @$navi_realm, {
        title => $title,
        id => $id
      }
    }
  );

  # Check for existence
  $mojo->helper(
    'navi.exists' => sub {
      my $c = shift;
      my $realm = shift;
      unless (exists $navi->{$realm}) {
        return 0 ;
      };
      return 0 unless ref $navi->{$realm} && @{$navi->{$realm}} > 0;
      return 1;
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
  %= embedded_link_to 'doc','Kalamar', 'development', 'kalamar'

Create a link to the documentation. Accepts a realm, a title, a scope, and a page.


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


=head2 navigation

Returns an HTML representation of a navigation structure
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
L<Leibniz-Gemeinschaft|http://www.leibniz-gemeinschaft.de>
and supported by the L<KobRA|http://www.kobra.tu-dortmund.de> project,
funded by the
L<Federal Ministry of Education and Research (BMBF)|http://www.bmbf.de/en/>.

Kalamar is free software published under the
L<BSD-2 License|https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE>.

=cut
