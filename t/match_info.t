use Mojo::Base -strict;
use Test::Mojo;
use Test::More;
use Mojo::File qw/path/;


#####################
# Start Fake server #
#####################
my $mount_point = '/realapi/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo->new('Kalamar');

# Mount fake backend
# Get the fixture path
my $fixtures_path = path(Mojo::File->new(__FILE__)->dirname, 'server');
my $fake_backend = $t->app->plugin(
  Mount => {
    $mount_point =>
      $fixtures_path->child('mock.pl')
  }
);
# Configure fake backend
$fake_backend->pattern->defaults->{app}->log($t->app->log);

# Query passed
$t->get_ok('/corpus/WPD15/232/39681/p2133-2134?spans=false&foundry=*&_format=json')
  ->status_is(200)
  ->content_type_is('application/json;charset=UTF-8')
  ->json_is('/textSigle', 'WPD15/232/39681')
  ->json_like('/snippet', qr!<span class=\"context-left\">!)
  ->header_isnt('X-Kalamar-Cache', 'true')
  ;

$t->get_ok('/corpus/GOE/AGF/02286/p75682-75683?_format=json&response-pipe=glemm')
  ->status_is(200)
  ->json_is('/textSigle', 'GOE/AGF/02286')
  ->json_is('/title','Materialien zur Geschichte der Farbenlehre')
  ->json_is('/meta/responsePipes','glemm')
  ;

# TODO:
#   It's surprising, that it doesn't return a 404!
$t->get_ok('/corpus/notfound/X/X/p0-1?_format=json')
  ->status_is(200)
  ->json_is('/textSigle', 'NOTFOUND/X/X')
  ->json_is('/corpusID', undef)
  ;

$t->get_ok('/corpus/fail/x/x/p0-0?_format=json')
  ->status_is(400)
  ->json_is('/notifications/0/0', 'error')
  ->json_like('/notifications/0/1', qr!Unable to load query response from .+?response_matchinfo_fail_x_x_p0-0\.json!)
  ;

# TODO:
#   Should probably return a 4xx!
$t->get_ok('/corpus/GOE/AGF/02286/p-2-0?_format=json')
  ->status_is(400)
  ->json_is('/notifications/0/0', 'error')
  ->json_is('/notifications/0/1', '730: Invalid match identifier')
  ;

$t->get_ok('/corpus/notfound2/X/X/p0-1?_format=json')
  ->status_is(404)
  ->json_is('/notifications/0/0', 'error')
  ->json_is('/notifications/0/1', '404: Not Found')
  ;

$t->get_ok('/corpus/brokenerr/X/X/p0-1?_format=json')
  ->status_is(409)
  ->json_is('/notifications/0/0', 'error')
  ->json_is('/notifications/0/1', 'Message structure failed')
  ;

$t->get_ok('/corpus/brokenwarn/X/X/p0-1?_format=json')
  ->status_is(200)
  ->json_is('/notifications/0/0', 'warn')
  ->json_is('/notifications/0/1', '1: Warning 1')
  ->json_is('/notifications/1/0', 'error')
  ->json_is('/notifications/1/1', 'Message structure failed')
  ;

$t->get_ok('/corpus/brokenerr2/X/X/p0-1?_format=json')
  ->status_is(417)
  ->json_is('/notifications/0/0', 'error')
  ->json_is('/notifications/0/1', 'Message structure failed')
  ;

# Get from cache
$t->get_ok('/corpus/WPD15/232/39681/p2133-2134?spans=false&foundry=*&_format=json')
  ->status_is(200)
  ->json_is('/textSigle', 'WPD15/232/39681')
  ->json_like('/snippet', qr!<span class=\"context-left\">!)
  ->header_is('X-Kalamar-Cache', 'true')
  ;

# Check for validation error
$t->get_ok('/corpus/WPD15/232/39681/p2133-2134?spans=no&_format=json')
  ->status_is(400)
  ->json_is('/notifications/0/1', 'Parameter "spans" invalid')
  ;

$t->get_ok('/corpus/WPD15/232/39681/p2133-2134?spans=no&_format=html')
  ->content_type_is('text/html;charset=UTF-8')
  ->status_is(400)
  ->text_is('p.no-results', 'Unable to perform the action.')
  ->text_is('div.notify', 'Parameter "spans" invalid')
  ;

$t->get_ok('/corpus/WPD15/232/39681/p2133-2134?spans=no')
  ->content_type_is('text/html;charset=UTF-8')
  ->status_is(400)
  ->text_is('p.no-results', 'Unable to perform the action.')
  ->text_is('div.notify', 'Parameter "spans" invalid')
  ;

$t->get_ok('/corpus/WPD15/232/39681/p2133-2134?spans=no')
  ->content_type_is('text/html;charset=UTF-8')
  ->status_is(400)
  ->text_is('p.no-results', 'Unable to perform the action.')
  ->text_is('div.notify', 'Parameter "spans" invalid')
  ;


done_testing;
__END__
