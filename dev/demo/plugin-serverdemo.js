requirejs.config({
  baseUrl: '/js/src',
  paths : {
    'lib': '../lib'
  }
});


KorAP.Plugins = [{
  'name' : 'Export',
  'desc' : 'Exports Kalamar results',
  // 'about' : 'https://localhost:5678/',
  'embed' : [{
    'panel' : 'result',
    'title' : 'Export',
    'icon' : "\uf019",
    'classes' : [ 'button-icon', 'plugin', 'export' ],
    'onClick' : {
      'action' : 'addWidget',
      'active' : true,
      'template' : 'http://localhost:3003/demo/plugin-client.html',
      "permissions": [
        "forms",
        "scripts",
        "downloads"
      ],
    }
  },{
    'panel' : 'result',
    'title' : 'Glemm',
    'onClick' : {
      'action' : 'toggle',
      'state' : 'glemm',
      'template' : 'http://localhost:3003/demo/plugin-client.html',
    }
  }]
},{
  'name' : 'Example New',
  'desc' : 'Some content about cats',
  // 'about' : 'https://localhost:5678/',
  'embed' : [{
    'panel' : 'match',
    'title' : 'Translate',
    'classes' : ['translate'],
    'onClick' : {
      'action' : 'addWidget',
      'template' : 'http://localhost:3003/demo/plugin-client.html',
      "permissions": [
        "forms",
        "scripts",
        "downloads"
      ]
    },
  }]
},{
    "name": "Koral-Mapper",
    "desc": "Mapping Service",
    "embed": [
      {
        "classes": [
          "termmapper"
        ],
      	"onClick" : {
          "action"     : "setWidget",
          "active" : false,
          "template"   : "http://localhost:5725",
          "permissions": ["forms", "scripts", "downloads"]
        },
        "panel": "query",
        "title": "Map"
      }
    ]
}]; 


define(['plugin/server', 'pipe', 'lib/domReady', 'app/en', 'init'], function(pluginClass, pipeClass, domReady) {
    domReady(function (event) {
        if (KorAP.Plugin === undefined) {
            // Load Plugin Server first
            KorAP.Plugin = pluginClass.create();
            // Add services container to head
            document.head.appendChild(KorAP.Plugin.element());
        };

        if (KorAP.Pipe === undefined) {
            KorAP.Pipe = pipeClass.create("pipe");
            let searchF = document.getElementById("searchform");
            searchF.appendChild(KorAP.Pipe.element());

            KorAP.ResponsePipe = pipeClass.create("response-pipe");
            searchF.appendChild(KorAP.ResponsePipe.element());
        };

        KorAP.Plugins.forEach(i => KorAP.Plugin.register(i));
    });
});
