package Korap::Plugin::KorapSearch;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::ByteStream 'b';

# TODO: This will probably be an engine for M::P::Search

sub register {
  my ($plugin, $mojo, $param) = @_;
  $param ||= {};

  # Load parameter from Config file
  if (my $config_param = $mojo->config('KorAP')) {
    $param = { %$param, %$config_param };
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

      # Blocking request
      # TODO: Make non-blocking
      my $tx = $ua->get($url);

      # Request successful
      if (my $res = $tx->success) {
	my $json = $res->json;

	# Reformat benchmark counter
	my $b_hit    = $json->{benchmarkHitCounter};
	my $b_search = $json->{benchmarkSearchResults};
	if ($b_hit =~ s/\s+(m)?s$//) {
	  $b_hit = sprintf("%.2f", $b_hit) . ($1 ? $1 : '') . 's';
	};
	if ($b_search =~ s/\s+(m)?s$//) {
	  $b_search = sprintf("%.2f", $b_search) . ($1 ? $1 : '') . 's';
	};

	for ($c->stash) {
	  $_->{'search.bm.hit'}       = $b_hit;
	  $_->{'search.bm.result'}    = $b_search;
	  $_->{'search.itemsPerPage'} = $json->{itemsPerPage};
	  $_->{'search.query'}        = $json->{request}->{query};
	  $_->{'search.hits'}         = $json->{matches};
	  $_->{'search.totalResults'} = $json->{totalResults};
	};

	if ($json->{error}) {
	  $c->notify('error' => $json->{error});
	};
      }

      # Request failed
      else {
	my $res = $tx->res;
	$c->notify('error' =>  $res->code . ': ' . $res->message);
      };

      # Run embedded template
      my $v = $cb->();

      # Delete useless stash keys
      foreach (qw/hits totalResults bm.hit bm.result itemsPerPage error query/) {
	delete $c->stash->{'search.' . $_};
      };
      return $v;
    }
  );


  # Establish 'search_hits' helper
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

      # Iterate over all hits
      foreach (@$hits) {
	local $_ = $_;
	$c->stash('search.hit' => $_);
	$string .= $cb->($_);
      };

      # Delete unnecessary stash values
      delete $c->stash->{'search.hit'};
      return b($string || '');
    }
  );
};


1;
