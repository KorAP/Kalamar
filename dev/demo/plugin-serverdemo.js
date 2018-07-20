requirejs.config({
  baseUrl: '/js/src',
  paths : {
    'lib': '../lib'
  }
});

define(['app/en','match', 'panel/match', 'plugin/server','lib/domReady','init'], function (lang, matchClass, matchPanelClass, pluginClass, domReady) {
  domReady(function () {

    // Initialize match
    matchClass.create(
      document.getElementById('WPD-FFF.01460-p119-120')
    );

    // Load plugin server
    KorAP.Plugin = pluginClass.create();

    // Register match plugin
    KorAP.Plugin.register({
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
        }
      }]
    });

  });
});
