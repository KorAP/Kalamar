requirejs.config({
  baseUrl: '/js/src',
  paths : {
    'lib': '../lib'
  }
});

define(['app/en','buttongroup', 'plugin/server','lib/domReady','init','hint/foundries/cnx'], function (lang, buttonGroupClass, pluginClass, domReady) {
  domReady(function () {

    KorAP.Plugin = pluginClass.create();

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

    
    var btns = buttonGroupClass.create();
    document.getElementById('buttons').appendChild(btns.element());

    // Are there plugin buttons defined
    var matchButtons = KorAP.Plugin.buttonGroup("match");
    if (matchButtons) {

      // Add all matchbuttons in order
      for (i in matchButtons) {
        btns.add.apply(btns, matchButtons[i]);
      }
    };  
  });
});
