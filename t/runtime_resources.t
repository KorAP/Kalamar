use strict;
use warnings;
use Test::More;
use FindBin;

# Runs in ordinary CI and again inside the image's slimming probe. The checker
# loads every registered DateTime locale and tests nl/ro/bg/cs text/collation.
my $status = system($^X, "$FindBin::Bin/../script/check-runtime");
is $status, 0, 'language resources are available';
done_testing;
