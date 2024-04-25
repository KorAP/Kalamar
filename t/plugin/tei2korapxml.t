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

# Added for slim-testing in Docker
use_ok('KorAP::XML::TEI::Inline');
use_ok('KorAP::XML::TEI::Header');
use_ok('KorAP::XML::TEI::Zipper');
use_ok('KorAP::XML::TEI::Tokenizer::Aggressive');
use_ok('KorAP::XML::TEI::Tokenizer::Conservative');
use_ok('KorAP::XML::TEI::Tokenizer::External');

# Only works in a java environment
# use_ok('KorAP::XML::TEI::Tokenizer::KorAP');
# my $ext = KorAP::XML::TEI::Tokenizer::KorAP->new(1);
# $ext->tokenize("Der alte Mann");
# my $str = $ext->to_string('unknown');
# like($str,qr!from="4" to="8"!);

done_testing;

1;
