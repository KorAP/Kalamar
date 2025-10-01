use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/tempfile/;

# Test the documentation
my $t = Test::Mojo->new('Kalamar');

my $temp = tempfile();

$temp->spew(<<SCRIPT);
[{
  "name" : "Export",
  "desc" : "Exports Kalamar results",
  "embed" : [{
    "panel" : "result",
    "title" : "exports KWICs and snippets",
    "icon" : "\uf019",
    "classes" : ["button-icon","plugin"],
    "onClick" : {
      "action" : "addWidget",
      "template" : "http://localhost:7777/res/export.html"
    }
  }]
}]
SCRIPT

$t->app->plugin('Plugins' => {
  default_file => $temp->to_string,
  default => [
    'PLUGIN_STUB',
    {
      "name" => "External Resources",
      "desc" => "Get extended access from an external provider",
      "embed" => [{
        "panel" => "match",
        "title" => "Full Text",
        "classes" => ["plugin","cart"],
        "icon" => "\f07a",
        "onClick" => {
          "action" => "addWidget",
          "template" => "https://korap.ids-mannheim.de/plugin/external/",
          "permissions"=> [
            "scripts",
            "popups"
          ]
        }
      }]
    }
  ]
});

$t->get_ok('/')
  ->text_is('h1 span', 'KorAP - Corpus Analysis Platform')
  ->content_unlike(qr!KorAP\.Plugins\s*=\s*\[!)
  ->content_unlike(qr!<script>\/\/<\!\[CDATA\[!)
  ->content_like(qr!<span id="kalamar-plugins" data-plugins="/settings/plugin/list\.json"></span>!)
  ;

$t->get_ok('/settings/plugin/list.json')
  ->status_is(200)
  ->header_is('Content-Type','application/json;charset=UTF-8')
  ->content_unlike(qr!KorAP\.Plugins=!)
  ->content_unlike(qr!STUB!)
  ->content_like(qr!button-icon!)
  ->content_like(qr!exports KWICs and snippets!)
  ->content_like(qr!Get extended access from an external provider!)
  ->json_is('/0/embed/0/title','exports KWICs and snippets')
  ->json_is('/1/embed/0/title','Full Text')
  ;

done_testing;
