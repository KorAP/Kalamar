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
          "type" : "type:regex",
          "match":"match:contains"
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

var collections = [
  {
    "statistics":{
      "paragraphs":2034752,
      "documents":196510,
      "tokens":51545081,
      "sentences":4116282
    },
    "query":[
      {
	"@value":{
	  "@field":"korap:field#corpusID",
	  "@value":"WPD",
	  "@type":"korap:term"
	},
	"@type":"korap:meta-filter"
      }
    ],
    "name":"Wikipedia",
    "path":"Wikipedia",
    "description":"Die freie Enzyklopädie",
    "shared":false,
    "managed":true,
    "created":"2015-04-01T23:04:32.000+02:00",
    "foundries":"",
    "id":"ZGU0ZTllNTFkYzc3M2VhZmViYzdkYWE2ODI5NDc3NTk4NGQ1YThhOTMwOTNhOWYxNWMwN2M3Y2YyZmE3N2RlNQ=="
  }
];

require(['vc','lib/domReady', 'lib/highlight/highlight.pack'], function (vcClass, domReady) {

  var loc = KorAP.Locale;

/*
  loc.AND = 'und';
  loc.OR  = 'oder';
  loc.VC_subTitle = 'Untertitel';
  loc.VC_title = 'Titel';
  loc.VC_pubDate = 'Veröffentlichungsdatum';
  loc.VC_pubPlace = 'Veröffentlichungsort';
*/

  domReady(function() {

    // Create a new virtual collection by passing a based json object and
    // field menu information
    var vc = vcClass.create([
      ['title', 'string'],
      ['subTitle', 'string'],
      ['pubDate', 'date'],
      ['author', 'text']
    ]).fromJson(json);

    document.getElementById('vc').appendChild(vc.element());

    // show the current JSON serialization
    KorAP.showJSON = function () {
      var json = document.getElementById("json");
      json.innerHTML = JSON.stringify(vc.root().toJson(), null, '  ');
      hljs.highlightBlock(json);
    };

    // show the current query serialization
    KorAP.showQuery = function () {
      document.getElementById("query").innerHTML = vc.root().toQuery();
    };

    // make the current vc persistant
    KorAP.makeVCPersistant = function () {
      vc.makePersistant();
    };
  });
});
