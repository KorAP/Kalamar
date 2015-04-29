package Kalamar::Plugin::KalamarTagHelpers;
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
      $url->query([base => $c->stash('doc_base') // '/']);

      $url->fragment($scope);

      return $c->tag('object',
	data => $url,
	type => 'image/svg+xml',
	alt  => $c->loc('korap_overview'),
	id   => 'overview'
      );
    }
  );



  $mojo->helper(
    doc_link_to => sub {
      my $c = shift;
      my $title = shift;
      my $page = pop;
      my $scope = shift;
      return $c->link_to($title, $c->url_with('doc', scope => $scope, page => $page));
    }
  );

  $mojo->helper(
    doc_uc => sub {
      return shift->tag('p', 'Under Construction!')
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
};

1;


__END__




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
