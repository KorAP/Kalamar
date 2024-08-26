use Test::More;
use Test::Mojo;
use Test::Output;
use Kalamar::Plugin::KorAPXML2CoNLLU;

unless (Kalamar::Plugin::KorAPXML2CoNLLU::check_existence()) {
  plan skip_all => "KorAP::XML::ConLLU is not installed";
  exit;
};

use_ok('Log::Any::Adapter::Stderr');
use_ok('Log::Any::Adapter::Stdout');
use_ok('Log::Any::Adapter::Null');
use_ok('Log::Any::Adapter::Multiplex');
use_ok('Log::Any::Adapter::Syslog');
use_ok('Log::Any::Adapter::Test');

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
