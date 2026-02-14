use Mojo::Base -strict;
use Test::More;
use Test::Mojo;

# Test vc_helper_fields default (empty)
my $t = Test::Mojo->new('Kalamar');
$t->get_ok('/')
  ->status_is(200)
  ->attr_is('body', 'data-vc-helper-fields', '');

# Test KALAMAR_VC_HELPER_FIELDS environment variable
$ENV{'KALAMAR_VC_HELPER_FIELDS'} = '+award:text,-docTitle';
$t = Test::Mojo->new('Kalamar');
$t->get_ok('/')
  ->status_is(200)
  ->attr_is('body', 'data-vc-helper-fields', '+award:text,-docTitle');
delete $ENV{'KALAMAR_VC_HELPER_FIELDS'};

# Test vc_helper_fields config option
$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    vc_helper_fields => ['+award:text', '-docTitle']
  }
});
$t->get_ok('/')
  ->status_is(200)
  ->attr_is('body', 'data-vc-helper-fields', '+award:text,-docTitle');

# Test env var takes precedence over config
$ENV{'KALAMAR_VC_HELPER_FIELDS'} = '-author';
$t = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    vc_helper_fields => ['+award:text', '-docTitle']
  }
});
$t->get_ok('/')
  ->status_is(200)
  ->attr_is('body', 'data-vc-helper-fields', '-author');
delete $ENV{'KALAMAR_VC_HELPER_FIELDS'};

done_testing;
