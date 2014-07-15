package Korap::Plugin::KorapTagHelpers;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::ByteStream 'b';
use Mojo::Util qw/xml_escape/;

sub register {
  my ($plugin, $mojo) = @_;

  $mojo->helper(
    korap_tut_query => sub {
      my ($c, $ql, $q) = @_;
      my $onclick = 'top.useQuery(this)';
      if ($c->param('embedded')) {
	$onclick = 'setTutorialPage(this);' . $onclick;
      };
      $q = xml_escape $q;
      b('<pre class="query tutorial" onclick="' . $onclick . '" ' .
	  qq!data-query="$q" data-query-language="$ql"><code>! .
	    $q . '</code></pre>');
    }
  );

  $mojo->helper(
    korap_tut_link_to => sub {
      my $c = shift;
      my $title = shift;
      my $link = shift;
      my $url = Mojo::URL->new($link);
      if ($c->param('embedded')) {
	$url->query({ embedded => 1 });
	return $c->link_to($title, $url, onclick => 'setTutorialPage("' . $url . '")');
      };
      return $c->link_to($title, $url);
    }
  );
};

1;
