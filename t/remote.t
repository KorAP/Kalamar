use Mojo::Base -strict;
use Mojo::File qw/path/;
use Test::More;
use Test::Mojo;

my $mount_point = '/api/';
$ENV{KALAMAR_API} = $mount_point;

my $t = Test::Mojo->new('Kalamar');
$t->app->defaults('auth_support' => 1);

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



if (0) {


# Check paging
$t->get_ok('/?q=Baum')
  ->text_like('h1 span', qr/KorAP: Find .Baum./i)
  # ->text_is('pre.query.serial span', 'JSON-LD Serialization for "test"')
  ->text_like('#total-results', qr/\d+$/)
  ->text_is('#pagination a[rel=self] span', 1)
  ->element_exists_not('#ql-field option[value=poliqarp][selected]')
  ->element_exists_not('#ql-field option[value=cosmas2][selected]')
  ;

# Check paging
$t->get_ok('/?q=test&p=2&ql=cosmas2')
  ->text_like('#total-results', qr/\d+$/)
  ->text_is('#pagination a[rel=self] span', 2)
  ->element_exists('#ql-field option[value=cosmas2][selected]')
  ->element_exists_not('#ql-field option[value=poliqarp][selected]')
;

# Check paging
$t->get_ok('/?q=test&p=2&ql=cosmas2')
  ->text_like('#total-results', qr/\d+$/)
  ->text_is('#pagination a[rel=self] span', 2)
  ->element_exists('#ql-field option[value=cosmas2][selected]')
  ->element_exists_not('#ql-field option[value=poliqarp][selected]')
;

# Check for authorization
#   this should just trigger a fixture - it's not serious
$t->get_ok('/?q=test&p=2&ql=cosmas3')
  ->element_exists_not('#pagination a[rel=self] span')
  ->element_exists('#search #no-results')
  ->text_like('.notify-error', qr!No entity found!)
  ;


# Check for server error
$t->get_ok('/?q=server_fail&ql=poliqarp')
  ->element_exists('.notify-error')
  ->text_is('.notify-error', '500: Internal Server Error (remote)')
  ;

};


# Check for query error
$t->get_ok('/?q=[orth=das&ql=poliqarp')
  ->element_exists('.notify-error')
  ->text_is('.notify-error', '302: Parantheses/brackets unbalanced.')
  ->content_like(qr!KorAP\.koralQuery =!)
  ->text_is('.no-results:nth-of-type(1)', 'Unable to perform the search.')
  ;

done_testing;
__END__
