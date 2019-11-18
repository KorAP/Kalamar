requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

var hint = undefined;

require(['plugin/server','panel/query', 'hint','hint/foundries/cnx','lib/domReady'], function (pluginClass, queryPanelClass, hintClass, hintArray, domReady) {
  KorAP.hintArray = hintArray;
  KorAP.Hint = null;
  
  domReady(function() {

    KorAP.Hint = hintClass.create();

    /**
     * Add query panel
     */
    var queryPanel = queryPanelClass.create();

    // Get input field
    var sbar = document.getElementById("searchbar");
    if (sbar) {
      // The views are below the query bar
      sbar.appendChild(queryPanel.element());
      KorAP.Panel = KorAP.Panel || {};
      KorAP.Panel['query'] = queryPanel;
    }

    // Load plugin server
    KorAP.Plugin = pluginClass.create();

    // Register match plugin
    KorAP.Plugin.register({
      'name' : 'Example New',
      'desc' : 'Some content about cats',
      'embed' : [{
        'panel' : 'query',
        'title' : 'Translate',
        'classes' : ['translate'],
        'onClick' : {
          "template" : "http://localhost:3003/demo/plugin-client.html"
        }
      }]
    });
  });
});

function demoAlert (pos, msg) {
  if (KorAP.hint !== undefined)
    KorAP.Hint.alert(pos, msg);
}
