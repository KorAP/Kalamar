use Test::More;
use Test::Mojo;
use Test::Output;

eval {
  require KorAP::XML::TEI;
  1;
} || do {
  plan skip_all => "KorAP::XML::TEI is not installed";
};

my $t = Test::Mojo->new(Kalamar => {
  Kalamar => {
    plugins => ['Tei2KorAPXML']
  }
});

my $app = $t->app;

my $cmds = $app->commands;

ok(grep/::Tei2KorAPXML/, @{$cmds->namespaces}, 'Namespace is set');

stdout_like(
  sub {
    $cmds->run('tei2korapxml','-v');
  },
  qr{cat corpus\.i5\.xml}
);

done_testing;

1;
