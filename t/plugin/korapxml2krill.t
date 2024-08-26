use strict;
use warnings;
use Test::Mojo;
use Test::Output;
use Test::More;

our %ENV;

eval {
  require KorAP::XML::Krill;
  1;
} || do {
  plan skip_all => "KorAP::XML::Krill is not installed";
  exit;
};

my $t = Test::Mojo->new(Kalamar => {
  Kalamar => {
    plugins => ['KorAPXML2Krill']
  }
});

my $app = $t->app;
my $cmds = $app->commands;

use_ok('Method::Generate::DemolishAll');

ok(grep/::KorAPXML2Krill/, @{$cmds->namespaces}, 'Namespace is set');

stdout_like(
  sub {
    $cmds->run('korapxml2krill','-v');
  },
  qr{\[archive\|extract\]}
);

unless (grep { -x "$_/unzip"} split /:/, $ENV{PATH}) {
  fail("unzip is not installed");
};

stdout_like(
  sub {
    return system('unzip','-v');
  },
  qr/UnZip/
);


done_testing;
__END__
