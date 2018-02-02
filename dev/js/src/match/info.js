/**
 * Information about a match.
 */
define([
  'match/infolayer',
  'match/table',
  'match/tree',
  'match/meta',
  'match/relations',
  'match/querycreator',
  'util'
], function (infoLayerClass,
	           matchTableClass,
	           matchTreeClass,
	           matchMetaClass,
             matchRelClass,
             matchQueryCreator) {
  
  // Override 
  KorAP.API.getMatchInfo = KorAP.API.getMatchInfo || function () {
    KorAP.log(0, 'KorAP.API.getMatchInfo() not implemented')
    return {};
  };

  const loc = KorAP.Locale;
  const d = document;

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
    getTableData : function (tokens, cb) {
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


    getMetaData : function (metaInfo, cb) {
      // ...
    },
    

    /**
     * Retrieve and parse snippet for tree representation
     */
    getTreeData : function (foundry, layer, type, cb) {
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
      /*
      if (this._treeMenu !== undefined)
	      delete this._treeMenu["info"];
      
      this._treeMenu.destroy();
      this._treeMenu = undefined;
      */
      this._match = undefined;
      this._matchCreator = undefined;      
      // Element destroy
    },


    /**
     * Add a new tree view to the list
     */
    showTree : function (foundry, layer, type, cb) {
      var matchtree = d.createElement('div');
      matchtree.classList.add('matchtree');

      // Add title line
      var h6 = matchtree.addE('h6');
      h6.addE('span').addT(foundry);
      h6.addE('span').addT(layer);      

      var tree = matchtree.addE('div');
      
      this._element.insertBefore(matchtree, this._element.lastChild);

      // Add close action button
      var actions = tree.addE('ul');
      actions.classList.add('action', 'image');
      var close = actions.addE('li');
      close.className = 'close';
      close.addE('span');
      close.addEventListener(
        'click', function (e) {
          matchtree.parentNode.removeChild(matchtree);
          e.halt();
        }
      );

      tree.classList.add('loading');

      // Get tree data async
      this.getTreeData(foundry, layer, type, function (treeObj) {

        tree.classList.remove('loading');

        // Something went wrong - probably log!!!

        if (treeObj === null) {
          tree.addT('No data available.');
        }
        else {
          tree.appendChild(treeObj.element());
          treeObj.show();

          // Reposition the view to the center
          // (This may in a future release be a reposition
          // to move the root to the actual match)

          // This is currently not supported by relations
          if (type === "spans") {
            var dl = d.createElement('li');
            dl.className = 'download';
            dl.addEventListener(
              'click', function (e) {
                var a = treeObj.downloadLink();
                d.body.appendChild(a);
                a.click();
                d.body.removeChild(a)
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


    // Add meta information to match
    showMeta : function () {
      var matchmeta = d.createElement('div');

      // TODO: This is part of the getMeta!
      var metaInfo = this._match.element().getAttribute('data-info');

      if (metaInfo)
        metaInfo = JSON.parse(metaInfo);

      // There is metainfo
      if (metaInfo) {

        // Add metainfo to matchview
        var metaElem = matchMetaClass.create(this._match).element(metaInfo);
        var elem = this.element();

        elem.insertBefore(
          metaElem,
          elem.firstChild
        );
      };
    },


    // Add table
    showTable : function () {

      var info = this.element();

      // Append default table
      var matchtable = d.createElement('div');
      matchtable.classList.add('matchtable', 'loading');
      info.appendChild(matchtable);

      // Create the table asynchronous
      this.getTableData(undefined, function (table) {

        if (table !== null) {
          matchtable.appendChild(table.element());
	      };

        // Load data
        matchtable.classList.remove('loading');

        // Add query creator
        this._matchCreator = matchQueryCreator.create(info);
      });
    },


    /**
     * Create match information view.
     */
    element : function () {
      
      if (this._element !== undefined)
        return this._element;
      
      // Create info table
      var info = d.createElement('div');
      info.classList.add('matchinfo');
      
      this._element = info;

      return this._element;
    }
  };
});
