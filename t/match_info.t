use Mojo::Base -strict;
use Test::Mojo;
use Test::More;
use Mojo::File qw/path/;


#####################
# Start Fake server #
#####################
my $mount_point = '/api/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo->new('Kalamar');

# Mount fake backend
# Get the fixture path
my $fixtures_path = path(Mojo::File->new(__FILE__)->dirname, 'fixtures');
my $fake_backend = $t->app->plugin(
  Mount => {
    $mount_point =>
      $fixtures_path->child('fake_backend.pl')
  }
);
# Configure fake backend
$fake_backend->pattern->defaults->{app}->log($t->app->log);

# Query passed
$t->get_ok('/corpus2/WPD15/232/39681/p2133-2134?spans=false&foundry=*')
  ->status_is(200)
  ->json_is('/textSigle', 'WPD15/232/39681')
  ->json_like('/snippet', qr!<span class=\"context-left\">!)
  ;

$t->get_ok('/corpus2/GOE/AGF/02286/p75682-75683')
  ->status_is(200)
  ->json_is('/textSigle', 'GOE/AGF/02286')
  ->json_is('/title','Materialien zur Geschichte der Farbenlehre')
  ;

# TODO:
#   It's surprising, that it doesn't return a 404!
$t->get_ok('/corpus2/notfound/X/X/p0-1')
  ->status_is(200)
  ->json_is('/textSigle', 'NOTFOUND/X/X')
  ->json_is('/corpusID', undef)
  ;

# TODO:
#   Should probably return a 500!
$t->get_ok('/corpus2/fail/x/x/p0-0')
  ->status_is(200)
  ->json_is('/notifications/0/0', 'error')
  ->json_is('/notifications/0/1', 'Unable to load query response from /home/ndiewald/Repositories/korap-git/Kalamar/t/fixtures/response_matchinfo_fail_x_x_p0-0.json')
  ;

# TODO:
#   Should probably return a 4xx!
$t->get_ok('/corpus2/GOE/AGF/02286/p-2-0')
  ->status_is(200)
  ->json_is('/notifications/0/0', 'error')
  ->json_is('/notifications/0/1', '730: Invalid match identifier')
  ;

# TODO:
#   It's surprising, that it doesn't return a 404!
$t->get_ok('/corpus2/notfound2/X/X/p0-1')
  ->status_is(404)
  ->json_is('/notifications/0/0', 'error')
  ->json_is('/notifications/0/1', '404: Not Found')
  ;


done_testing;
__END__
