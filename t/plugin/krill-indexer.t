use Test::More;
use Test::Mojo;
use Test::Output;

my $java = `sh -c 'command -v java'`;
chomp $java;

if ($java eq '') {
  plan skip_all => "Java is not installed";
  return;
};

unless ($ENV{KRILL_INDEXER_PATH}) {
  plan skip_all => "Krill-Indexer is not installed";
  return;
};

my $t = Test::Mojo->new(Kalamar => {
  Kalamar => {
    plugins => ['KrillIndexer']
  }
});

my $app = $t->app;

my $cmds = $app->commands;

ok(grep/::KrillIndexer/, @{$cmds->namespaces}, 'Namespace is set');

stdout_like(
  sub {
    $cmds->run('krill-indexer');
  },
  qr{--inputDir}
);

done_testing;

1;
