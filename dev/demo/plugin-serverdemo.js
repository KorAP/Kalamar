requirejs.config({
  baseUrl: '/js/src',
  paths : {
    'lib': '../lib'
  }
});




define(['app/en','match', 'panel/match', 'panel/result', 'plugin/server','lib/domReady','init'], function (lang, matchClass, matchPanelClass, resultPanelClass, pluginClass, domReady) {
  domReady(function () {
 
    //Load Plugin Server first 
    KorAP.Plugin = pluginClass.create();

    // Add services container to head
    document.head.appendChild(KorAP.Plugin.element());
    
    //Register result plugin
    KorAP.Plugin.register({
       'name' : 'Export',
       'desc' : 'Exports Kalamar results',
       // 'about' : 'https://localhost:5678/',
       'embed' : [{
         'panel' : 'result',
         'title' : 'Export',
         'classes' : ['export'],
         'onClick' : {
           'action' : 'addWidget',
           'template' : 'http://localhost:3003/demo/plugin-client.html',
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
     }); 

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
