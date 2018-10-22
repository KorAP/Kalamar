package Kalamar::Plugin::KalamarHelpers;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::JSON qw/decode_json true false/;
use Mojo::ByteStream 'b';
use Mojo::Util qw/xml_escape/;

sub register {
  my ($plugin, $mojo) = @_;

  # Embed the korap architecture image
  $mojo->helper(
    korap_overview => sub {
      my $c = shift;
      my $scope = shift;

      my $url = $c->url_with('/img/korap-overview.svg');

      my $base = $c->url_for('index');
      if ($base->path->parts->[0]) {
        $base->path->trailing_slash(1);
      };

      # If there is a different base - append this as a base
      $url->query([base => $base // '/']);

      $url->fragment($scope);

      return $c->tag(
        'object',
        data => $url,
        type => 'image/svg+xml',
        alt  => $c->loc('korap_overview'),
        id   => 'overview'
      );
    }
  );

  # Documentation link
  # TODO: Support opener mechanism, so the link will open the embedded
  # documentation in case it's not there.
  $mojo->helper(
    doc_link_to => sub {
      my $c = shift;
      my $title = shift;
      my $page = pop;
      my $scope = shift;

      ($page, my $fragment) = split '#', $page;

      my $url = $c->url_with(
        'doc',
        scope => $scope,
        page => $page
      );

      $url->fragment($fragment) if $fragment;

      return $c->link_to(
        $title,
        $url,
        class => 'doc-link'
      );
    }
  );

  $mojo->helper(
    doc_ext_link_to => sub {
      my $c = shift;
      return $c->link_to(@_, target => '_top');
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
        $url = $c->url_for('doc', page => $page, scope => $scope);
        $url->path->canonicalize;
      }
      else {
        $url = $c->url_for('doc_start');
      };
      return $c->link_to($cb->($c), $url);
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

          $url = $c->url_with(
            'doc',
            'scope' => $part_scope,
            'page' => $page
          );

          $url->fragment($id);
        }

        # There is no fragment
        else {

          # The item is active
          if ($c->stash('page') && $c->stash('page') eq $_->{id}) {
            $active = 1;
          };

          # Generate url with query parameter inheritance
          $url = $c->url_with(
            'doc',
            'scope' => $scope,
            'page' => $_->{id}
          );

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


  # Check for test port
  $mojo->helper(
    kalamar_test_port => sub {
      my $c = shift;

      # Test port is defined in the stash
      if (defined $c->stash('kalamar.test_port')) {
        return $c->stash('kalamar.test_port');
      };

      # Check the port
      if ($c->req->url->to_abs->port == 6666 ||
            $c->app->mode =~ m/^development|test$/) {
        $c->stash('kalamar.test_port' => 1);
        return 1;
      };

      # No test port
      $c->stash('kalamar.test_port' => 0);
      return 0;
    });

  # Establish 'search_results' taghelper
  # This is based on Mojolicious::Plugin::Search
  $mojo->helper(
    search_results2 => sub {
      my $c = shift;

      # This is a tag helper for templates
      my $cb = shift;
      if (!ref $cb || !(ref $cb eq 'CODE')) {
        $c->app->log->error('search_results expects a code block');
        return '';
      };

      my $coll = $c->stash('results');

      # Iterate over results
      my $string = $coll->map(
        sub {
          # Call hit callback
          # $c->stash('search.hit' => $_);
          local $_ = $_[0];
          return $cb->($_);
        })->join;

      # Remove hit from stash
      # delete $c->stash->{'search.hit'};
      return b($string);
    }
  );

  $mojo->helper(
    'korap.api' => sub {
      return shift->config('Search')->{api};
    }
  );


  # Get a cached request from the backend
  $mojo->helper(
    cached_koral_p => sub {
      my ($c, $method, $url) = @_;

      # In case the user is not known, it is assumed,
      # the user is not logged in
      my $user = $c->stash('user');
      unless ($user) {
        $user = $c->session('user');
        if ($user) {
          $c->stash(user => $user);
        }
        else {
          $user = 'not_logged_in';
        }
      };

      # Set api request for debugging
      my $cache_str = "$method-$user-" . $url->to_string;
      $c->stash(api_request => $url->to_string);

      if ($c->no_cache) {
        return $c->user->auth_request_p($method => $url)->then(
          sub {
            my $json = shift;
            # Catch errors and warnings
            $c->stash(api_response => $json);
            return $c->catch_errors_and_warnings($json);
          }
        );
      };

      # Get koral from cache
      my $koral = $c->chi->get($cache_str);

      my $promise;

      # Cache was found
      if ($koral) {

        # Mark response as cache
        $koral->{'X-cached'} = Mojo::JSON->true;

        # The promise is already satisfied by the cache
        return Mojo::Promise->new->resolve($koral)->then(
          sub {
            my $json = shift;
            $c->notify_on_warnings($json);
            $c->stash(api_response => $json);
            return $json;
          }
        );
      };

      # Resolve request
      return $c->user->auth_request_p($method => $url)->then(
        sub {
          my $json = shift;
          # Catch errors and warnings
          $c->stash(api_response => $json);
          return $c->catch_errors_and_warnings($json);
        }
      )->then(
        # Cache on success
        sub {
          my $json = shift;
          $c->chi->set($cache_str => $json);
          $c->stash(api_response => $json);
          return $json;
        }
      );
    }
  );

};


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

=head2 doc_link_to

  %# In templates
  %= doc_link_to 'Kalamar', 'korap', 'kalamar'

Create a link to the documentation. Accepts a name, a scope, and a page.


=head2 doc_ext_link_to

  %# In templates
  %= doc_ext_link_to 'GitHub', "https://github.com/KorAP/Koral"

Creates a link to an external page, that will be opened in the top frame,
in case it's in an embedded frame (used in the tutorial).

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


=head2 kalamar_test_port

  # In controllers
  if ($c->kalamar_test_port) {
    $c->app->log->debug('Kalamar runs on test port');
  };

Returns a C<true> value in case Kalamar runs on test port C<6666>.


=head2 korap_overview

  %# In templates
  %= korap_overview 'kalamar'

Returns a modified and relatified overview svg image to be embedded
as an object in templates.


=head1 COPYRIGHT AND LICENSE

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
