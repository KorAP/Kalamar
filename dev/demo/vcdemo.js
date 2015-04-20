requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

var json = {
  "@type":"koral:docGroup",
  "operation":"operation:or",
  "operands":[
    {
      "@type":"koral:docGroup",
      "operation":"operation:and",
      "operands":[
        {
          "@type":"koral:doc",
          "key":"Titel",
          "value":"Der Birnbaum",
          "match":"match:eq"
        },
        {
          "@type":"koral:doc",
          "key":"Veröffentlichungsort",
          "value":"Mannheim",
          "match":"match:eq"
        },
        {
          "@type":"koral:docGroup",
          "operation":"operation:or",
          "operands":[
            {
              "@type":"koral:doc",
              "key":"Untertitel",
              "value":"Aufzucht und Pflege",
              "match":"match:eq"
            },
            {
              "@type":"koral:doc",
              "key":"Untertitel",
              "value":"Gedichte",
              "match":"match:eq",
              "rewrites" : [
                {
                  "@type": "koral:rewrite",
                  "src" : "policy",
                  "operation" : "operation:injection",
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "@type":"koral:doc",
      "key":"Veröffentlichungsdatum",
      "type":"type:date",
      "value":"2015-03-05",
      "match":"match:geq"
    }
  ]
};

require(['vc','lib/domReady'], function (vcClass, domReady) {
  KorAP.Locale.AND = 'und';
  KorAP.Locale.OR  = 'oder';

  domReady(function() {
    var vc = vcClass.render(json, [
      ['Titel', 'title', 'string'],
      ['Untertitel', 'subTitle', 'string'],
      ['Veröffentlichungsdatum', 'pubDate', 'date'],
      ['Autor', 'author', 'string']
    ]);
    document.getElementById('vc').appendChild(vc.element());

    KorAP.showJSON = function () {
      document.getElementById("json").innerHTML = JSON.stringify(vc.root().toJson());
    };

    KorAP.showQuery = function () {
      document.getElementById("query").innerHTML = vc.root().toQuery();
    };

  });
});
