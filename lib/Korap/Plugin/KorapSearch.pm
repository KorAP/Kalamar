package Korap::Plugin::KorapSearch;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::ByteStream 'b';

sub register {
  my ($plugin, $mojo, $param) = @_;
  $param ||= {};

  # Load parameter from Config file
  if (my $config_param = $mojo->config('KorAP')) {
    $param = { %$config_param, %$param };
  };

  my $api = $param->{api};

  $mojo->helper(
    search => sub {
      my $c = shift;

      # Todo: If there is no callback, return the hits object!
      my $cb = pop if ref $_[-1] && ref $_[-1] eq 'CODE';

      my %param = @_;

      $c->stash(
	'search.count' =>
	  delete($param{count}) //
	    scalar($c->param('count')) //
	      $param->{count}
	    );

      $c->stash('search.startPage' =>
		  (delete($param{startPage}) //
		     scalar $c->param('p') //
		       1
		     ));

      my $query = $param{query} // scalar $c->param('q');

      return '' unless $query;

      # Get stash information
      my $count = $c->stash('search.count');
      my $start_page = $c->stash('search.startPage');

      foreach ($start_page, $count) {
	$_ = undef if (!$_ || $_ !~ /^\d+$/);
      };

      my $url = Mojo::URL->new($api);
      $url->path('resource/search');
      #if ($c->stash('resource')) {
      #$url->path($c->stash('resource'));
      #if ($c->stash('cid')) {
      #$url->path($c->stash('cid'));
      #};
      #};

      my %query = (q => $query);
      $query{ql} = scalar $c->param('ql') // 'poliqarp';
      $query{startPage} = $start_page if $start_page;
      $query{count} = $count if $count;

      $query{lctx} = 'chars';
      $query{lctxs} = 120;
      $query{rctx} = 'chars';
      $query{rctxs} = 120;

      $url->query(\%query);

      $c->stash('search.totalResults' => 0);
      $c->stash('search.itemsPerPage' => $count);

      my $ua = Mojo::UserAgent->new($url);
      $c->app->log->debug($url->to_string);
      my $tx = $ua->get($url);

      if (my $res = $tx->success) {
	my $json = $res->json;

	my $b_hit = $json->{benchmarkHitCounter};
	my $b_search = $json->{benchmarkSearchResults};

	if ($b_hit =~ s/\s+(m)?s$//) {
	  $b_hit = sprintf("%.2f", $b_hit) . ($1 ? $1 : '') . 's';
	};
	if ($b_search =~ s/\s+(m)?s$//) {
	  $b_search = sprintf("%.2f", $b_search) . ($1 ? $1 : '') . 's';
	};

	$c->stash('search.bm.hit' => $b_hit);
	$c->stash('search.bm.result' => $b_search);
	$c->stash('search.itemsPerPage' => $json->{itemsPerPage});
	if ($json->{error}) {
	  $c->notify('error' => $json->{error});
	};
	$c->stash('search.query' => $json->{request}->{query});
	$c->stash('search.hits' => $json->{matches});
	$c->stash('search.totalResults' => $json->{totalResults});
      }
      else {
	my $res = $tx->res;
	$c->notify('error' =>  $res->code . ': ' . $res->message);
      };
      my $v = $cb->();
      foreach (qw/hits totalResults bm.hit bm.result itemsPerPage error query/) {
	delete $c->stash->{'search.' . $_};
      };
      return $v;
    }
  );

  $mojo->helper(
    search_hits => sub {
      my $c = shift;
      my $cb = pop;

      if (!ref $cb || !(ref $cb eq 'CODE')) {
	$mojo->log->error("search_hits expects a code block");
	return '';
      };

      my $hits = delete $c->stash->{'search.hits'};
      my $string;
      foreach (@$hits) {
	local $_ = $_;
	$c->stash('search.hit' => $_);
	$string .= $cb->($_);
      };
      delete $c->stash->{'lucy.hit'};
      return b($string || '');
    }
  );
};

1;
