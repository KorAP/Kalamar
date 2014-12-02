package Korap::Plugin::KorapTagHelpers;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::JSON::Pointer;
use Mojo::ByteStream 'b';
use Mojo::Util qw/xml_escape/;

sub register {
  my ($plugin, $mojo) = @_;

  # Create helper for queries in the tutorial
  $mojo->helper(
    korap_tut_query => sub {
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
      elsif ($c->param('testing') &&
	       $c->korap_test_port &&
		 $param{tests}) {

	my $tests = $param{tests} // [];
	my $json = $c->search(
	  query => $q,
	  ql => $ql,
	  cutoff => 'true',
	  no_cache => 1
	);

	# There is a response
	if ($json) {
	  my $json_pointer = Mojo::JSON::Pointer->new($json);
	  foreach my $test (@$tests) {
	    my ($type, $path, @rest) = @$test;

	    # Check for equality
	    if ($type eq 'is') {
	      my $found = $json_pointer->get($path);
	      if ($found && $found eq $rest[0]) {
		$pass++;
	      }
	      else {
		my $result = $path . q! isn't ! . shift @rest;
		$result .= ' but was ' . $found if $found;
		$result .= '; ' . join('; ', @rest);
		push(@report, $result);
		$fail++;
	      };
	    }

	    # Check for inequality
	    elsif ($type eq 'isnt') {
	      if ($json_pointer->get($path) ne $rest[0]) {
		$pass++;
	      }
	      else {
		push(@report, $path . q! is ! . join('; ', @rest));
		$fail++;
	      };
	    }

	    # Check for existence
	    elsif ($type eq 'ok') {
	      if ($json_pointer->contains($path)) {
		$pass++;
	      }
	      else {
		push(@report, $path . q! doesn't exist; ! . join('; ', @rest));
		$fail++;
	      };
	    }

	    # Check for inexistence
	    elsif ($type eq 'not_ok') {
	      unless ($json_pointer->contains($path)) {
		$pass++;
	      }
	      else {
		push(@report, $path . q! doesn't exist; ! . join('; ', @rest));
		$fail++;
	      };
	    };
	  };
	}
	else {
	  # There may be notifications here!
	  $fail++ foreach @$tests;
	};

	# Emit hook to possible subscribers
	# This is used for self-testing
	# $plugin->emit_hook(korap_tut_query => (
	#   query_language => $ql,
	#   query => $q,
	#   %param
	# ));
      };

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


  # Create links in the tutorial that make sure the current position is preserved,
  # in case the tutorial was opened embedded
  $mojo->helper(
    korap_tut_link_to => sub {
      my $c = shift;
      my $title = shift;
      my $link = shift;
      my $url = Mojo::URL->new($link);

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
