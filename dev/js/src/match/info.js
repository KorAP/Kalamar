/**
 * Information about a match.
 */
define([
  'match/infolayer',
  'match/table',
  'match/tree',
  'match/reference', // rename to meta
  'match/relations',
  'match/treemenu',
  'match/querycreator',
  'util'
], function (infoLayerClass,
	           matchTableClass,
	           matchTreeClass,
	           matchRefClass,
             matchRelClass,
	           matchTreeMenuClass,
             matchQueryCreator) {
  
  // Override 
  KorAP.API.getMatchInfo = KorAP.API.getMatchInfo || function () {
    KorAP.log(0, 'KorAP.API.getMatchInfo() not implemented')
    return {};
  };

  var loc = KorAP.Locale;

  return {

    /**
     * Create new match object
     */
    create : function (match) {
      return Object.create(this)._init(match);
    },

    /**
     * Initialize object
     */
    _init : function (match) {
      this._match = match;
      this.opened = false;
      return this;
    },

    /**
     * Get match object
     */
    match : function () {
      return this._match;
    },


    /**
     * Open the information view,
     * if closed, otherwise close.
     */
    /*
    toggle : function () {

      var elem = this._match.element();

      if (this.opened == true) {        
        elem.removeChild(
          this.element()
        );
        this.opened = false;
      }
      else {
        // Append element to match
        elem.appendChild(
          this.element()
        );
        this.opened = true;
      };
      
      return this.opened;
    },
    */


    /**
     * Retrieve and parse snippet for table
     * representation
     */
    getTable : function (tokens, cb) {
      var focus = [];

      // Get all tokens
      if (tokens === undefined) {
        focus = this._match.getTokens();
      } 

      // Get only some tokens
      else {
        
        // Push newly to focus array
        for (var i = 0; i < tokens.length; i++) {
          var term = tokens[i];
          try {
            // Create info layer objects
            var layer = infoLayerClass.create(term);
            layer.type = "tokens";
            focus.push(layer);
          }
          catch (e) {
            continue;
          };
        };
      };
      
      // No tokens chosen
      if (focus.length == 0)
        cb(null);

      // Get info (may be cached)
      KorAP.API.getMatchInfo(
        this._match,
        { 'spans' : false, 'layer' : focus },
        
        // Callback for retrieval
        function (matchResponse) {

          if (matchResponse === undefined)
            cb(null);

          // Get snippet from match info
          if (matchResponse["snippet"] !== undefined) {
            this._table = matchTableClass.create(matchResponse["snippet"]);
            cb(this._table);
          };
        }.bind(this)
      );

      /*
      // Todo: Store the table as a hash of the focus
      return null;
      */
    },


    getMeta : function (metaInfo, cb) {
      
    },
    

    /**
     * Retrieve and parse snippet for tree representation
     */
    getTree : function (foundry, layer, type, cb) {
      var focus = [];
      
      // TODO: Support and cache multiple trees
      KorAP.API.getMatchInfo(
        this._match, {
          'spans' : true,
          'foundry' : foundry,
          'layer' : layer
        },
        function (matchResponse) {
          // Get snippet from match info
          if (matchResponse["snippet"] !== undefined) {
            // Todo: This should be cached somehow

            if (type === "spans") {
              cb(matchTreeClass.create(matchResponse["snippet"]));
            }
            else if (type === "rels") {
              cb(matchRelClass.create(matchResponse["snippet"]));              
            }

            // Unknown tree type
            else {
              cb(null);
            };
          }
          else {
            cb(null);
          };
        }.bind(this)
      );
    },

    /**
     * Destroy this match information view.
     */
    destroy : function () {

      // Remove circular reference
      if (this._treeMenu !== undefined)
	      delete this._treeMenu["info"];
      
      this._treeMenu.destroy();
      this._treeMenu = undefined;
      this._match = undefined;
      this._matchCreator = undefined;      
      // Element destroy
    },

    /**
     * Add a new tree view to the list
     */
    addTree : function (foundry, layer, type, cb) {
      var matchtree = document.createElement('div');
      matchtree.classList.add('matchtree');
      
      var h6 = matchtree.appendChild(document.createElement('h6'));
      h6.appendChild(document.createElement('span'))
	      .appendChild(document.createTextNode(foundry));
      h6.appendChild(document.createElement('span'))
	      .appendChild(document.createTextNode(layer));      

      var tree = matchtree.appendChild(
        document.createElement('div')
      );
      
      this._element.insertBefore(matchtree, this._element.lastChild);

      var actions = tree.appendChild(document.createElement('ul'));
      actions.classList.add('action', 'image');
      var close = actions.appendChild(document.createElement('li'));
      close.className = 'close';
      close.appendChild(document.createElement('span'));
      close.addEventListener(
        'click', function (e) {
          matchtree.parentNode.removeChild(matchtree);
          e.halt();
        }
      );

      tree.classList.add('loading');

      // Get tree data async
      this.getTree(foundry, layer, type, function (treeObj) {

        tree.classList.remove('loading');

        // Something went wrong - probably log!!!

        if (treeObj === null) {
          tree.appendChild(document.createTextNode('No data available.'));
        }
        else {
          tree.appendChild(treeObj.element());
          treeObj.show();
          // Reposition the view to the center
          // (This may in a future release be a reposition
          // to move the root into the center or the actual
          // match)

          // This is currently not supported by relations
          if (type === "spans") {
            var dl = document.createElement('li');
            dl.className = 'download';
            dl.addEventListener(
              'click', function (e) {

                var a = document.createElement('a');
                a.setAttribute('href-lang', 'image/svg+xml');
                a.setAttribute('href', 'data:image/svg+xml;base64,'+treeObj.toBase64());
                a.setAttribute('download', 'tree.svg');
                a.target = '_blank';
                a.setAttribute('rel', 'noopener noreferrer');
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a)
                e.halt();
              }
            );
            
            actions.appendChild(dl);
          };
          
          treeObj.center();
        };
  
        if (cb !== undefined)
          cb(treeObj);
      });
    },


    addMeta : function () {
      var matchmeta = document.createElement('div');
      // matchRefClass.create();

      // TODO: This is part of the getMeta!
      var metaInfo = this._match.element().getAttribute('data-info');

      if (metaInfo)
        metaInfo = JSON.parse(metaInfo);

      // There is metainfo
      if (metaInfo) {

        // Add metainfo to matchview
        var metaElem = matchRefClass.create(this._match).element(metaInfo);
        this.element().appendChild(metaElem);

        console.log(this.element());
      };
    },

    // Add table
    addTable : function () {

      var info = this.element();

      // Append default table
      var matchtable = document.createElement('div');
      matchtable.classList.add('matchtable', 'loading');
      info.appendChild(matchtable);

      // Create the table asynchronous
      this.getTable(undefined, function (table) {

        if (table !== null) {
          matchtable.appendChild(table.element());
	      };
	      matchtable.classList.remove('loading');

        // Add query creator
        this._matchCreator = matchQueryCreator.create(info);
      });

      
      info.appendChild(this.addTreeMenu());
    },


    addTreeMenu : function () {

      // Join spans and relations
      var treeLayers = []
      var spans = this._match.getSpans();
      var rels = this._match.getRels();
      var i;
      for (i in spans) {
        treeLayers.push(spans[i]);
      };
      for (i in rels) {
        treeLayers.push(rels[i]);
      };

      // Get spans
      treeLayers = treeLayers.sort(
        function (a, b) {
          if (a.foundry < b.foundry) {
            return -1;
          }
          else if (a.foundry > b.foundry) {
            return 1;
          }
          else if (a.layer < b.layer) {
            return -1;
          }
          else if (a.layer > b.layer) {
            return 1;
          };
          return 0;
        });
      
      var menuList = [];
      
      // Show tree views
      for (var i = 0; i < treeLayers.length; i++) {
        var span = treeLayers[i];
        
        // Add foundry/layer to menu list
        menuList.push([
          span.foundry + '/' + span.layer,
          span.foundry,
          span.layer,
          span.type
        ]);
      };

      // Create tree menu
      var treemenu = this.treeMenu(menuList);
      var span = document.createElement('p');
      span.classList.add('addtree');
      span.appendChild(document.createTextNode(loc.ADDTREE));

      var treeElement = treemenu.element();
      span.appendChild(treeElement);

      span.addEventListener('click', function (e) {
        treemenu.show();
        treemenu.focus();
      });

      return span;
    },

    /**
     * Create match information view.
     */
    element : function () {
      
      if (this._element !== undefined)
        return this._element;
      
      // Create info table
      var info = document.createElement('div');
      info.classList.add('matchinfo');
      
      this._element = info;

      return this._element;
    },

    
    /**
     * Get tree menu.
     * There is only one menu rendered
     * - no matter how many trees exist
     */
    treeMenu : function (list) {
      if (this._treeMenu !== undefined)
        return this._treeMenu;
      
      return this._treeMenu = matchTreeMenuClass.create(this, list);
    }
  };
});
