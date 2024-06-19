use Test::More;
use strict;
use warnings;

# This is a collection of tests to trigger requirements
# that may otherwise be removed by slimming docker images.

use_ok('CHI');

my $cache = CHI->new(driver => 'Null');

ok($cache);

done_testing;
__END__
