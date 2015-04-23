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
          "key":"title",
          "value":"Der Birnbaum",
          "match":"match:eq"
        },
        {
          "@type":"koral:doc",
          "key":"pubPlace",
          "value":"Mannheim",
          "match":"match:eq"
        },
        {
          "@type":"koral:docGroup",
          "operation":"operation:or",
          "operands":[
            {
              "@type":"koral:doc",
              "key":"subTitle",
              "value":"Aufzucht und Pflege",
              "match":"match:eq"
            },
            {
              "@type":"koral:doc",
              "key":"subTitle",
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
      "key":"pubDate",
      "type":"type:date",
      "value":"2015-03-05",
      "match":"match:geq"
    }
  ]
};

require(['vc','lib/domReady'], function (vcClass, domReady) {

  var loc = KorAP.Locale;

  loc.AND = 'und';
  loc.OR  = 'oder';
  loc.VC_subTitle = 'Untertitel';
  loc.VC_title = 'Titel';
  loc.VC_pubDate = 'Veröffentlichungsdatum';
  loc.VC_pubPlace = 'Veröffentlichungsort';

  domReady(function() {

    // Create a new virtual collection by passing a based json object and
    // field menu information
    var vc = vcClass.create([
      ['title', 'string'],
      ['subTitle', 'string'],
      ['pubDate', 'date'],
      ['author', 'string']
    ]).fromJson(json);
    document.getElementById('vc').appendChild(vc.element());

    // show the current JSON serialization
    KorAP.showJSON = function () {
      document.getElementById("json").innerHTML = JSON.stringify(vc.root().toJson());
    };

    // show the current query serialization
    KorAP.showQuery = function () {
      document.getElementById("query").innerHTML = vc.root().toQuery();
    };

  });
});
