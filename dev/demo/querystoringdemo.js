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

    KorAP.restoreMinusMenuButton = { // Whenever used is at location 0
      defaultTextValue : "Back",
      onclick : function (e) {
        this._menu.hint().unReadQueries();
        //e.halt();
      }
    };

    KorAP.triggerDeleteModeButton = { // Whenever used is at location 1
      defaultTextValue : "Delete Queries",
      onclick : function (e) {
        if (this._menu.hint()._queryReadMode === "READ") {
          this._menu.hint()._deleteTheseQueries = [];
          this.content("Delete Selected Queries");
          this._menu.hint()._queryReadMode = "DELETE";


        } else if (this._menu.hint()._queryReadMode === "DELETE") {
          this._menu.hint()._deleteTheseQueries.forEach(function (query){
            KorAP.API.deleteQuery(qn,console.log);
          },undefined);
          this._menu.hint()._deleteTheseQueries = [];
          this._menu.hint()._queryReadMode = "READ";
          this.content("Delete Queries");

        } else {
          //ERROR
          console.log("What?");
        };
        this.menu("-").show();
        //e.halt();
      }
    };

    JSONListToQueryTemplates= function(JSONList) {
      var queryItemTemplates = [];
      JSONList.forEach(function(query){ //I need to see what this actually looks like!
        queryItemTemplates.push([query["qname"],query["q"],query["desc"]])
      }, undefined); //no "this" needed
      return queryItemTemplates
    };


    KorAP.SaveButton = { // Whenever used is at location 0
      onclick : function (e) {
        var query = {}
        query.q = "this._menu._hint._inputField._el.value";
        query.ql = "a";
        query.desc = "b";
        KorAP.API.putQuery("query1",query,console.log);
        this.menu("-").show();
        //e.halt();
      },
      defaultTextValue : "Save Query"
    };

    KorAP.DisplayQueriesButton = { // Whenever used is at location 1
      onclick : function (e) {
        KorAP.API.getQueryList(KorAP.Hint.readQueries,console.log);
        this.menu("-").show();
        //e.halt();
      },
      defaultTextValue : "Display Stored Queries"
    };


    KorAP.Hint.menu("-").container().addItem(KorAP.SaveButton); //must be added to a specific context menu.
    KorAP.Hint.menu("-").container().addItem(KorAP.DisplayQueriesButton); //must be added to a specific context menu.

    KorAP.Hint.readQueries = function (JSONList) {
      console.log(JSONList);
      //Need to check what JSONList looks like
      // 0: _name
      // 1: _action (query)
      // 2: _desc
      var queryItemTemplates = JSONListToQueryTemplates(JSONList);
      queryItemTemplates.push(["ExampleName","value","descr"]);
      this.menu("-").readItems(queryItemTemplates);
      this._queryReadMode = "READ"; //alternative: "DELETE"
      this._deleteTheseQueries = [];
      // add first, remove later to avoid empty lists
      this.menu("-").container().addItem(KorAP.restoreMinusMenuButton); 
      this.menu("-").container().addItem(KorAP.triggerDeleteModeButton);
      this.menu("-").container().removeItemByIndex(0); //Save Button
      this.menu("-").container().removeItemByIndex(0); //Display Button
      this.menu("-").show();
    }.bind(KorAP.Hint);

    KorAP.Hint.unReadQueries = function () {
      KorAP.log("unread");
      this.menu("-").readItems(KorAP.annotationHelper["-"]);
      this._queryReadMode = "READ"; //alternative: "DELETE"
      this._deleteTheseQueries = [];
      // add first, remove later to avoid empty lists
      this.menu("-").container().addItem(KorAP.SaveButton);
      this.menu("-").container().addItem(KorAP.DisplayQueriesButton);
      this.menu("-").container().removeItemByIndex(0); //restoreMinusMenuButton
      this.menu("-").container().removeItemByIndex(0); //triggerDeleteModeButton
      this.menu("-").show();

    }.bind(KorAP.Hint);

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
