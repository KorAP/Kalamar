use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/tempfile/;

# Test the documentation
my $t = Test::Mojo->new('Kalamar');

my $temp = tempfile();

$temp->spurt(<<SCRIPT);
[{
  'name' : 'Export',
  'desc' : 'Exports Kalamar results',
  'embed' : [{
    'panel' : 'result',
    'title' : 'exports KWICs and snippets',
    'icon' : "\uf019",
    'classes' : ['button-icon','plugin'],
    'onClick' : {
      'action' : 'addWidget',
      'template' : 'http://localhost:7777/res/export.html'
    }
  }]
}]
SCRIPT

$t->app->plugin('Plugins' => {
  default_plugins => $temp->to_string
});

$t->get_ok('/')
  ->text_is('h1 span', 'KorAP - Corpus Analysis Platform')
  ->content_unlike(qr!KorAP\.Plugins\s*=\s*\[!)
  ->content_unlike(qr!<script>\/\/<\!\[CDATA\[!)
  ->content_like(qr!<script src="/js/plugins\.js!)
  ;

$t->get_ok('/js/plugins.js')
  ->status_is(200)
  ->header_is('Content-Type','application/javascript')
  ->content_like(qr!KorAP\.Plugins=!)
  ->content_like(qr!button-icon!)
  ;

done_testing;
