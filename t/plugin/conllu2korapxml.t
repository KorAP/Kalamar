use Test::More;
use Test::Mojo;
use Test::Output;

my $script = `sh -c 'command -v conllu2korapxml'`;

if ($script eq '') {
  plan skip_all => "KorAP::XML::Krill is not installed";
  exit;
};

my $t = Test::Mojo->new(Kalamar => {
  Kalamar => {
    plugins => ['KorAPXML2CoNLLU']
  }
});
my $app = $t->app;
my $cmds = $app->commands;
ok(grep/::KorAPXML2CoNLLU/, @{$cmds->namespaces}, 'Namespace is set');
stdout_like(
  sub {
    $cmds->run('conllu2korapxml','-v');
  },
  qr{zca15\.tree_tagger\.conllu}
);
stdout_like(
  sub {
    $cmds->run('korapxml2conllu','-v');
  },
  qr{zca15\.tree_tagger\.zip}
);
done_testing;
1;
