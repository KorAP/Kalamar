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

      # If there is a different base - append this as a base
      # $url->query([base => $c->stash('doc_base') // '/']);
      $url->query([base => $c->url_for('doc_start')->to_abs // '/']);

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
  $mojo->helper(
    doc_link_to => sub {
      my $c = shift;
      my $title = shift;
      my $page = pop;
      my $scope = shift;
      return $c->link_to(
	$title,
	$c->url_with('doc', scope => $scope, page => $page)
      );
    }
  );


  # Documentation alert - Under Construction!
  $mojo->helper(
    doc_uc => sub {
      return shift->tag('p', 'Under Construction!')
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
    kalamar_tut_query => sub {
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





  # Create links in the tutorial that make sure the current position is preserved,
  # in case the tutorial was opened embedded
  $mojo->helper(
    kalamar_tut_link_to => sub {
      my $c = shift;
      my $title = shift;
      my $link = shift;
      my $host = $c->req->headers->header('X-Forwarded-Host');
      my $url = $c->url_for($link);

      # Link is part of the embedded tutorial
      if ($c->param('embedded')) {
	$url->query({ embedded => 1 });
	return $c->link_to(
	  $title,
	  $url,
	  onclick => qq!setTutorialPage("$url")!
	);
      };

      # Build link
      return $c->link_to($title, $url);
    }
  );



  # Create helper for queries in the tutorial
  $mojo->helper(
    kalamar_tut_query => sub {
      my ($c, $ql, $q, %param) = @_;
      my $onclick = 'top.useQuery(this)';

      my ($fail, $pass, @report) = (0,0);

      if ($c->param('testing')) {
	$c->res->headers->cache_control('max-age=1, no-cache');
      };

      # Store current tutorial position
      if ($c->param('embedded')) {
	$onclick = 'setTutorialPage(this);' . $onclick;
      }

      # Tutorial wasn't embedded - but opened for testing
 #     elsif ($c->param('testing') &&
#	       $c->kalamar_test_port &&
#		 $param{tests}) {
#
# Currently disabled

#	my $tests = $param{tests} // [];
#	my $index = $c->search(
#	  query => $q,
#	  ql => $ql,
#	  cutoff => 'true',
#	  no_cache => 1
#	);
#
#	# Get the raw results
#	my $json = decode_json($index->api_response);
#
#	# There is a response
#	if ($json) {
#	  my $json_pointer = Mojo::JSON::Pointer->new($json);
#	  foreach my $test (@$tests) {
#	    my ($type, $path, @rest) = @$test;
#
#	    # Check for equality
#	    if ($type eq 'is') {
#	      my $found = $json_pointer->get($path);
#	      if ($found && $found eq $rest[0]) {
#		$pass++;
#	      }
#	      else {
#		my $result = $path . q! isn't ! . shift @rest;
#		$result .= ' but was ' . $found if $found;
#		$result .= '; ' . join('; ', @rest);
#		push(@report, $result);
#		$fail++;
#	      };
#	    }
#
#	    # Check for inequality
#	    elsif ($type eq 'isnt') {
#	      if ($json_pointer->get($path) ne $rest[0]) {
#		$pass++;
#	      }
#	      else {
#		push(@report, $path . q! is ! . join('; ', @rest));
#		$fail++;
#	      };
#	    }
#
#	    # Check for existence
#	    elsif ($type eq 'ok') {
#	      if ($json_pointer->contains($path)) {
#		$pass++;
#	      }
#	      else {
#		push(@report, $path . q! doesn't exist; ! . join('; ', @rest));
#		$fail++;
#	      };
#	    }
#
#	    # Check for inexistence
#	    elsif ($type eq 'not_ok') {
#	      unless ($json_pointer->contains($path)) {
#		$pass++;
#	      }
#	      else {
#		push(@report, $path . q! doesn't exist; ! . join('; ', @rest));
#		$fail++;
#	      };
#	    };
#	  };
#	}
#	else {
#	  # There may be notifications here!
#	  $fail++ foreach @$tests;
#	};
#
#	# Emit hook to possible subscribers
#	# This is used for self-testing
#	# $plugin->emit_hook(kalamar_tut_query => (
#	#   query_language => $ql,
#	#   query => $q,
#	#   %param
#	# ));
 #     };

      # Escape query for html embedding
      $q = xml_escape $q;

      # There is something to talk about
      my $msg = '';
      if (($pass + $fail) > 0) {
	$msg .= '<div class="test">';
	$msg .= qq!<p class="pass">Pass: $pass</p>!;
	$msg .= qq!<p class="fail">Fail: $fail</p>! if $fail;
	foreach (@report) {
	  $msg .= qq!<p class="fail">${_}</p>!;
	};
	$msg .= '</div>';
      };

      # Return tag
      b('<pre class="query tutorial" onclick="' . $onclick . '" ' .
	  qq!data-query="$q" data-query-cutoff="! .
	    ($param{cutoff} ? 1 : 0) .
	      '"' .
		qq! data-query-language="$ql"><code>! .
		  $q .
		    '</code></pre>' . $msg);
    }
  );
