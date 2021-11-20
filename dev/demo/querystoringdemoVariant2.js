requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

var hint = undefined;

require(['plugin/server','panel/query', 'hint', 'hint/foundries/cnx','lib/domReady','api'], function (pluginClass, queryPanelClass, hintClass, hintArray, domReady) {
  KorAP.hintArray = hintArray;
  KorAP.Hint = null;

  //TO BE ABLE TO USE THIS DEMO YOU MUST MANUALLY OVERRIDE LINE 9 IN hint/menu.js WITH hint/querystoringitem.js
  // This is so that this demo can be looked at in the main branch. Currently it is not easy to override the item prototype class
  // used in hint-menus. 

  //TODO: How to querynames.

  //How to add this to master:
  // All KorAP.Hint.functionname = function(...) {...} should be added to the hint class. setNumQueries should be called upon hintClass creation.
  // The buttons need to have be stored
  // in static references, so that they can be re-added in unReadQueries and readQueries. I recommend making them attributes of either hint
  // or hint.menu("-").container.
  
  domReady(function() {
    KorAP.URL="http://localhost:3000"

    KorAP.Hint = hintClass.create();

    KorAP.Hint.numStoredQueries = 0; //used for the query names.
    /**
     * Get and set the number of currently stored queries to what the server says. This is used to allow for
     * the naming process of queries to always create queries with unique names until we implement custom query
     * names.
     */
    KorAP.Hint.setNumQueries = function (retList) {
      if (arguments.length === 0){ // regular function call
        KorAP.API.getQueryList(KorAP.Hint.setNumQueries,console.log); //Ask the Server for count
      } else if (retList !== undefined) { //call by the API (Server)
        this.numStoredQueries = retList.length; //set the count thanks to server
        console.log("Set counter for number of stored queries to: " + retList.length);
      };
    }.bind(KorAP.Hint);

    KorAP.Hint.setNumQueries();

    var OwnContainerItemClass = {
      
      create : function (qname, query, desc) {
        var obj = containerItemClass.create()
          .upgradeTo(this);
          //._init();
        if (arguments.length === 3) {
          obj.qname = qname;
          obj.defaultTextValue= qname + desc;
          obj.query = query;
        };
        return obj;
      },
      onclick : function (e) {
        var m = this.menu();
        // m.hide();
        var h = m.hint();
        if ( h._hintItemMode === undefined || h._hintItemMode === "REGULAR" ) { //the same

          // Reset prefix and update the input field
          m.reset(this._action);

          e.halt();
        
          // show alt
          h.show(true);
        } else if ( h._hintItemMode === "DELETE SELECTION" ) { //see deleteButton in querystoringdemo.js

          h._deleteTheseQueries.push(this.qname);
          this.element().classList.add("selected-for-deletion"); //TODO @Nils Maybe a different type of highlighting?
          //this. //Here you see why I added the content function: easier text changing.
          e.halt();
        
          // show alt
          h.show(true);
        };
      } 
    }

    KorAP.restoreMinusMenuButton = { // Whenever used is at location 0
      defaultTextValue : "Back",
      onclick : function (e) {
        console.log("back click");
        this._menu.hint().unReadQueries();
        this.content(); //Reset to default Text
        //e.halt();
      },
      chop : function (e) {
        this.onclick(e);
      }
    };

    KorAP.triggerDeleteModeButton = { // Whenever used is at location 1
      defaultTextValue : "Delete Queries",

      onclick : function (e) {

        if (this._menu.hint()._hintItemMode === "REGULAR") {
          // make it so that selecting queries now deletes them later
          this._menu.hint()._deleteTheseQueries = [];
          this.content("Delete The Selected Queries");
          this.menu().container().item(0).content("Cancel Deletion");
          this._menu.hint()._hintItemMode = "DELETE SELECTION";

        } else if (this._menu.hint()._hintItemMode === "DELETE SELECTION") {
          // Delete stuff
          this._menu.hint()._deleteTheseQueries.forEach(function (queryname){
            KorAP.API.deleteQuery(queryname,console.log);
          },undefined);
          this._menu.hint()._deleteTheseQueries = [];
          this._menu.hint()._hintItemMode = "REGULAR";
          this.menu().container().item(0).content(); //"Back"
          this.content("Start Deleting Queries");
          KorAP.Hint.setNumQueries(); //Set value to something meaningful
          KorAP.API.getQueryList(KorAP.Hint.readQueries,console.log);

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
      if (JSONList !== undefined) {
        JSONList.forEach(function(query){ 
          queryItemTemplates.push([
            query["name"],
            query["koralQuery"] || query["q"],
            query["description"] || ""
          ])
        }, undefined); //no "this" needed
      };
      return queryItemTemplates
    };


    KorAP.SaveButton = { // Whenever used is at location 0
      onclick : function (e) {
        var query = {
          //As of now this content is completely irrelevant. Instead, all is stored thanks to the URL.
        };
        var newestQueryName = "query" + KorAP.Hint.numStoredQueries + "?q=" + this._menu._hint._inputField._el.value + "&desc=" + "ExampleDescr.";
        //console.log(newestQueryName);
        //Wenn voll CacheData löschen.
        //Die Adresse muss sein: 
        //     /query1?q=queryname?ql=...&desc=...
        // See t/plugin/query_reference.t for examples
        //putQuery will stringify it for you
        KorAP.API.putQuery(newestQueryName,query,console.log());
        KorAP.Hint.setNumQueries(); //Set value to something meaningful
        //console.log(JSON.stringify(query));
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
      //console.log(JSONList);
      //this.menu("-").readItems(JSONListToQueryTemplates(JSONList)); //other variant
      JSONList = JSONListToQueryTemplates(JSONList);
      let ii; 
      for (ii = 0; ii < JSONList.length; ii++) {
        this.menu("-").container().addItem(OwnContainerItemClass.create(JSONList[ii][0], JSONList[ii][1], JSONList[ii][2]));
      };
      this._hintItemMode = "REGULAR"; //alternative: "DELETE SELECTION"
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
      this._hintItemMode = "REGULAR"; //alternative: "DELETE SELECTION"
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
