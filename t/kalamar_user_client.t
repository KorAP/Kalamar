use Mojo::Base -strict;
use Test::Mojo;
use Test::More;
use Mojolicious::Lite;
use lib 'lib', '../lib';

my $t = Test::Mojo->new;
my $app = $t->app;

# Add additional plugin path
push(@{app->plugins->namespaces}, 'Kalamar::Plugin');

plugin 'CHI' => {
  user => {
    driver => 'Memory',
    global => 1
  }
};

plugin 'KalamarUser' => {
  api => 'http://10.0.10.51:7070/api/v0.1/'
};

post '/acct/login' => sub {
  my $c = shift;
  my $user = $c->param('user');
  my $pwd  = $c->param('pwd');
  return $c->redirect_to('index') if $c->user->login($user, $pwd);
  return $c->redirect_to;
} => 'login';


get '/' => sub {
  my $c = shift;
  my $details = $c->user->get('details');
  return $c->redirect_to('login') unless $details;
  $c->render(json => $details);
} => 'index';


get '/acct/settings' => sub {
  my $c = shift;
  my $settings = $c->user->get('settings');
  return $c->redirect_to('login') unless $settings;
  $c->render(json => $settings);
};


$t->get_ok('/')
  ->status_is(302)
  ->header_is('location', '/acct/login');

# Tests
$t->post_ok('/acct/login' => {} => form => {
  user => 'kustvakt',
  pwd => 'kustvakt2015'
})
  ->status_is(302)
  ->header_is('location', '/');

$t->get_ok('/')
  ->status_is(200)
  ->json_is('/country', 'Germany')
  ->json_is('/firstName', 'Kustvakt')
  ->json_is('/lastName', 'KorAP')
  ->json_is('/email', 'kustvakt@ids-mannheim.de')
  ;

$t->get_ok('/acct/settings')
  ->status_is(200)
  ->json_is('/queryLanguage', 'COSMAS2')
  ->json_is('/constFoundry', 'mate')
  ->json_is('/relFoundry', 'mate')
  ->json_is('/lemmaFoundry', 'tt')
  ->json_is('/POSFoundry', 'tt')
  ;

done_testing;

__END__

# print Dumper $user->user_query;
# print Dumper $user->get_collection_stat('242eea9442fcba4e4f51e4ff292eebe2aca4e7f3');
# print Dumper $user->user_settings;
print Dumper $user->collections;

#print "\n";

# my $x = 'ZGU0ZTllNTFkYzc3M2VhZmViYzdkYWE2ODI5NDc3NTk4NGQ1YThhOTMwOTNhOWYxNWMwN2M3Y2YyZmE3N2RlNQ==';
# print b($x)->b64_decode,"\n";

my $user = Kalamar::User->new->authorize_jwt('kustvakt', 'kustvakt2015');
