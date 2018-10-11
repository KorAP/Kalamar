package Kalamar::Controller::Search2;
use Mojo::Base 'Mojolicious::Controller';

has api => 'http://10.0.10.52:9000/api/';

has no_cache => 0;

has items_per_page => 25;


sub query {
  my $c = shift;

  # Validate user input
  my $v = $c->validation;

  # In case the user is not known, it is assumed, the user is not logged in
  my $user = $c->stash('user') // 'not_logged_in';

  $v->optional('q', 'trim');
  $v->optional('ql')->in(qw/poliqarp cosmas2 annis cql fcsql/);
  $v->optional('collection'); # Legacy
  $v->optional('cq', 'trim');
  # $v->optional('action'); # action 'inspect' is no longer valid
  $v->optional('snippet');
  $v->optional('cutoff')->in(qw/true false/);
  $v->optional('count')->num(1, undef);
  $v->optional('p');
  $v->optional('context');

  # Get query
  my $query = $v->param('q');

  # No query
  unless ($query) {
    return $c->render($c->loc('Template_intro', 'intro'));
  };

  my %query = ();
  $query{q}       = $v->param('q');
  $query{ql}      = $v->param('ql');
  $query{page}    = $v->param('p') if $v->param('p');
  $query{count}   = $v->param('count') // $c->items_per_page;
  $query{cq}      = $v->param('cq') // $v->param('collection');
  $query{cutoff}  = $v->param('cutoff');
  $query{context} = $v->param('context') // '40-t,40-t'; # 'base/s:p'/'paragraph'


  # Create remote request URL
  my $url = Mojo::URL->new($c->api);
  $url->query(\%query);

  # Check if total results is cached
  my $total_results;
  if (!$c->no_cache) {
    $total_results = $c->chi->get('total-' . $user . '-' . $url->to_string);
    $c->stash(total_results => $total_results);
    $c->app->log->debug('Get total result from cache');

    # Set cutoff unless already set
    $url->query({cutoff => 'true'});
  };



  # Establish 'search_results' taghelper
  # This is based on Mojolicious::Plugin::Search
  $c->app->helper(
    search_results => sub {
      my $c = shift;

      # This is a tag helper for templates
      my $cb = shift;
      if (!ref $cb || !(ref $cb eq 'CODE')) {
        $c->app->log->error('search_results expects a code block');
        return '';
      };

      # Iterate over results
      my $string = $c->stash('search.results')->map(
        sub {
          # Call hit callback
          $c->stash('search.hit' => $_);
          local $_ = $_[0];
          return $cb->($_);
        })->join;

      # Remove hit from stash
      delete $c->stash->{'search.hit'};
      return b($string);
    }
  );


  return $c->render(
    template => 'search2',
    q => $query,
    ql => scalar $v->param('ql') // 'poliqarp',
    result_size => 0,
    start_page => 1,
    total_pages => 20,
    total_results => 40,
    time_exceeded => 0,
    benchmark => 'Long ...',
    api_response => ''
  );
};


1;
