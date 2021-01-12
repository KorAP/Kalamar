use Mojo::Base -strict;
use Mojo::File 'path';
use Test::More;
use Test::Mojo;

#####################
# Start Fake server #
#####################
my $mount_point = '/realapi/';
$ENV{KALAMAR_API} = $mount_point;

# Test app
my $t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    plugins => ['Auth','QueryReference']
  }
});

# Mount fake backend
# Get the fixture path
my $fixtures_path = path(Mojo::File->new(__FILE__)->dirname, '..', 'server');
my $fake_backend = $t->app->plugin(
  Mount => {
    $mount_point =>
      $fixtures_path->child('mock.pl')
  }
);
# Configure fake backend
$fake_backend->pattern->defaults->{app}->log($t->app->log);

$t->put_ok('/query/baum')
  ->status_is(400)
  ->json_like('/errors/0/message', qr!unable!i)
  ;

$t->put_ok('/query/baum?q=[orth=Baum]&desc=Eine Baum-Query')
  ->status_is(201)
  ->content_is('')
  ;

$t->put_ok('/query/frage?q=[orth=Frage]&desc=Eine Frage-Query&ql=poliqarp')
  ->status_is(201)
  ->content_is('')
  ;

$t->put_ok('/query/baum?q=[orth=Baum]&desc=Eine Baum-Query')
  ->status_is(400)
  ->json_like('/errors/0/message', qr!unable!i)
  ;

$t->get_ok('/query')
  ->status_is(200)
  ->json_is('/0/name', 'baum')
  ->json_is('/1/name', 'frage')
  ;

$t->get_ok('/query/frage')
  ->status_is(200)
  ->json_is('/name', 'frage')
  ->json_is('/description', 'Eine Frage-Query')
  ->json_is('/koralQuery', '[orth=Frage]')
  ->json_is('/q', '[orth=Frage]')
  ->json_is('/ql', 'poliqarp')
  ;

$t->delete_ok('/query/frage')
  ->status_is(200)
  ->content_is('')
  ;

$t->delete_ok('/query/frage2')
  ->status_is(200)
  ->content_is('')
  ;

$t->get_ok('/query')
  ->status_is(200)
  ->json_is('/0/name', 'baum')
  ->json_hasnt('/1')
  ;

$t->get_ok('/query/frage')
  ->status_is(404)
  ->json_is('/errors/0/message', 'Query reference not found')
  ;

$t->get_ok('/query/baum')
  ->status_is(200)
  ->json_is('/name', 'baum')
  ->json_is('/description', 'Eine Baum-Query')
  ->json_is('/koralQuery', '[orth=Baum]')
  ->json_is('/q', '[orth=Baum]')
  ->json_is('/ql', undef)
  ;

##
## Real API requests
##
$t->get_ok('/realapi/v1.0')
  ->status_is(200)
  ->content_is('Fake server available')
  ;

# Login
my $csrf = $t->get_ok('/')
  ->status_is(200)
  ->tx->res->dom->at('input[name=csrf_token]')->attr('value')
  ;

$t->post_ok('/user/login' => form => {
  handle => 'test',
  pwd => 'pass',
  csrf_token => $csrf
})
  ->status_is(302)
  ->content_is('')
  ->header_is('Location' => '/');

$t->put_ok('/query2/xyzp?q=Test&desc=Beispiel')
  ->status_is(201)
  ->content_is('')
  ;

done_testing();
