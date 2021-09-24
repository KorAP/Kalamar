requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

var hint = undefined;

require(['plugin/server','panel/query', 'hint','hint/foundries/cnx','lib/domReady','api'], function (pluginClass, queryPanelClass, hintClass, hintArray, domReady) {
  KorAP.hintArray = hintArray;
  KorAP.Hint = null;
  
  domReady(function() {
    KorAP.URL="http://localhost:3000"
    //console.log(KorAP.URL=http://localhost:3003);

    KorAP.Hint = hintClass.create();

    var restoreMinusMenuButton = {
      defaultTextValue : "Back",
      onclick : function (e) {
        this.menu().readItems(KorAP.annotationHelper["-"]);
        this.menu().container().removeItem(this);
      }
    }

    KorAP.Hint.readQueries = function (JSONList) {
      console.log(JSONList);
      //Need to check what JSONList looks like
      // 0: _name
      // 1: _action (query)
      // 2: _desc
      var queryItemTemplates = [];
      JSONList.forEach(function(query){ //I need to see what this actually looks like!
        queryItemTemplates.push([query["qname"],query["q"],query["desc"]])
      }, undefined); //no "this" needed
      this.menu("-").readItems(queryItemTemplates);
      this.menu("-").container().addItem(restoreMinusMenuButton);
    };

    KorAP.Hint.readQueries.bind(KorAP.Hint); //Maybe not necessary

    var SaveButton = {
      onclick : function (e) {
        var query = {}
        query.q = this._menu._hint._inputField._el.value;
        query.ql = "a";
        query.desc = "b";
        KorAP.API.putQuery("1",query,console.log);
      },
      defaultTextValue : "Save Query"
    };

    var DisplayQueriesButton = {
      onclick : function (e) {
        KorAP.API.getQueryList(KorAP.Hint.readQueries,console.log);
      },
      defaultTextValue : "Display Stored Queries"
    };


    KorAP.Hint.menu("-").container().addItem(SaveButton); //must be added to a specific context menu.
    KorAP.Hint.menu("-").container().addItem(DisplayQueriesButton); //must be added to a specific context menu.

    /**
     * Add query panel
     */
    var queryPanel = queryPanelClass.create();

    // Get input field
    var sform = document.getElementById("searchform");
    var vcView = document.getElementById('vc-view')
    if (sform && vcView) {
      // The views are below the query bar
      sform.insertBefore(queryPanel.element(),vcView);
      KorAP.Panel = KorAP.Panel || {};
      KorAP.Panel['query'] = queryPanel;
    }

    // Load plugin server
    KorAP.Plugin = pluginClass.create();
    KorAP.Plugin.register
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
      },{
        'panel' : 'query',
        'title' : 'Glemm',
        'classes' : ['glemm'],
        'onClick' : {
          "action":"toggle",
          "template" : "http://localhost:3003/demo/plugin-client.html"
        }
      }]
    });

    // Register match plugin
    KorAP.Plugin.register({
      'name' : 'Glimpse',
      'desc' : 'Shorten all queries',
      'embed' : [{
        'panel' : 'query',
        'title' : 'Glimpse',
        'classes' : ['glimpse'],
        'onClick' : {
          "action" : "toggle",
          "template" : "http://localhost:3003/demo/plugin-client.html"
        }
      }]
    });
    
    console.log(KorAP.Hint);
  });
});

function demoAlert (pos, msg) {
  if (KorAP.hint !== undefined)
    KorAP.Hint.alert(pos, msg);
}
