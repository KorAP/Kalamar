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
}]; 


define(['plugin/server', 'lib/domReady', 'app/en', 'init'], function(pluginClass, domReady) {
    domReady(function (event) {
        if (KorAP.Plugin === undefined) {
            // Load Plugin Server first
            KorAP.Plugin = pluginClass.create();
            // Add services container to head
            document.head.appendChild(KorAP.Plugin.element());
        };
        KorAP.Plugins.forEach(i => KorAP.Plugin.register(i));
    });
});
