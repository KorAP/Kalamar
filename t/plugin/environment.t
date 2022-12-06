use Test::More;
use Test::Mojo;
use Test::Output;
use Data::Dumper;

my @loaded = grep( /Kalamar\//, keys %INC);

is(scalar (@loaded), 0, 'No Kalamar libraries loaded');

$ENV{KALAMAR_PLUGINS} = 'Piwik,Auth';

my $t = Test::Mojo->new(Kalamar => {
  Kalamar => {
    plugins => ['Auth']
  }
});

my @loaded = grep( /Kalamar[\/\\]Plugin/, keys %INC);

isnt(scalar (@loaded), 0, 'Kalamar libraries loaded');

is(scalar grep( /Auth/, @loaded), 1, 'Auth plugin loaded');
is(scalar grep( /Piwik/, @loaded), 1, 'Auth plugin loaded');
is(scalar grep( /Unknown/, @loaded), 0, 'Unknown plugin not loaded');

done_testing;
__END__
