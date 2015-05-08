package Kalamar::Plugin::KalamarHelpers;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::JSON 'decode_json';
use Mojo::JSON::Pointer;
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
      $url->query([base => $base->to_abs // '/']);

      $url->fragment($scope);

      return $c->tag('object',
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
      return shift->tag('p', 'Under Construction!')
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
      my $html = "<ul>\n";

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


	# Generate link
	$html .= $c->link_to($_->{title}, $url);

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
};


1;


__END__

