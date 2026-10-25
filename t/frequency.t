use Mojo::Base -strict;
use Test::Mojo;
use Test::More;
use Mojo::File qw/path/;

# Result metadata must describe the server-resolved count, including a total
# restored from cache when the latest snippet response has no total of its own.
$ENV{KALAMAR_API} = '/realapi/';
my $t = Test::Mojo->new('Kalamar');
my $mount = $t->app->plugin(Mount => {
  '/realapi/' => path(__FILE__)->dirname->child('server', 'mock.pl')
});
my $backend = $mount->pattern->defaults->{app};
my $statistics_requests = 0;
$backend->hook(before_dispatch => sub {
  my $c = shift;
  $statistics_requests++ if $c->req->url->path =~ /statistics$/;
  my $query = $c->param('q') // '';
  return unless $query =~ /^(memory|incompletezero|exactzero)$/;
  my $response = $c->load_response('query_timeout_o0_c25');
  my $json = $response->{json};
  delete $json->{warnings};
  delete $json->{meta}->{timeExceeded};
  $json->{meta}->{totalResults} = $query eq 'memory' ? 12347 : 0;
  $json->{meta}->{memoryExceeded} = Mojo::JSON::true unless $query eq 'exactzero';
  $json->{matches} = [] unless $query eq 'memory';
  if (($c->param('cutoff') // '') eq 'true') {
    $json->{meta}->{totalResults} = -1;
    delete $json->{meta}->{memoryExceeded};
  }
  $c->render(%$response);
});

$t->get_ok('/?q=baum')->status_is(200)
  ->element_exists('#resultinfo[data-hit-count="51"][data-count-state="exact"]');
$t->get_ok('/?q=baum')->status_is(200)
  ->element_exists('#resultinfo[data-hit-count="51"][data-count-state="exact"]');
$t->get_ok('/?q=baum&cutoff=true')->status_is(200)
  ->element_exists('#resultinfo[data-hit-count="-1"][data-count-state="unknown"]');

for (1 .. 2) {
  $t->get_ok('/?q=timeout')->status_is(200)
    ->element_exists('#resultinfo[data-hit-count="4274841"][data-count-state="lower-bound"]');
  $t->get_ok('/?q=memory')->status_is(200)
    ->element_exists('#resultinfo[data-hit-count="12347"][data-count-state="lower-bound"]');
  $t->get_ok('/?q=incompletezero')->status_is(200)
    ->element_exists('#resultinfo[data-hit-count="0"][data-count-state="lower-bound"]');
  $t->get_ok('/?q=exactzero')->status_is(200)
    ->element_exists('#resultinfo[data-hit-count="0"][data-count-state="exact"]');
}

is($statistics_requests, 0, 'Search does not request optional corpus statistics');
# The browser receives an opaque context key, never an access token. The
# same account/token must be stable across pages; another account or token
# must invalidate a remembered corpus size (including anonymous/login changes).
my ($user, $auth) = ('', '');
$t->app->hook(before_dispatch => sub {
  my $c = shift;
  $c->stash(user => $user);
  $c->session(auth => $auth);
});
my @scopes;
for my $context (['', ''], ['', ''], ['alice', 'Bearer test-token-a'],
                 ['alice', 'Bearer test-token-b'], ['bob', 'Bearer test-token-b']) {
  ($user, $auth) = @$context;
  $t->get_ok('/')->status_is(200);
  my $scope = $t->tx->res->dom->at('body')->attr('data-statistics-scope');
  like($scope, qr/^[0-9a-f]{64}$/, 'Opaque statistics context');
  push @scopes, $scope;
  $t->content_unlike(qr/Bearer test-token/);
}
is($scopes[0], $scopes[1], 'Anonymous scope is stable across searches');
isnt($scopes[1], $scopes[2], 'Login changes the scope');
isnt($scopes[2], $scopes[3], 'Token change invalidates the scope');
isnt($scopes[3], $scopes[4], 'Account change invalidates the scope');
$t->get_ok('/doc')->status_is(200)
  ->element_exists('body[data-statistics-scope=""]');
done_testing;
