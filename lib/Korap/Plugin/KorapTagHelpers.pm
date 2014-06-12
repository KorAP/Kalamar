package Korap::Plugin::KorapTagHelpers;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::ByteStream 'b';
use Mojo::Util qw/xml_escape/;

sub register {
  my ($plugin, $mojo) = @_;

  $mojo->helper(
    korap_tut_query => sub {
      my ($c, $ql, $q) = @_;
      $q = xml_escape $q;
      b('<code class="query tutorial" onclick="top.useQuery(this)" ' .
	  qq!data-query="$q" data-query-language="$ql"><pre>! .
	    $q . '</pre></code>');
    }
  );
};

1;
