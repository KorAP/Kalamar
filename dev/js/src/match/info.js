  /**
   * Information about a match.
   */
define([
  'match/infolayer',
  'match/table',
  'match/tree',
  'match/treemenu',
  'util'
], function (infoLayerClass,
	     matchTableClass,
	     matchTreeClass,
	     matchTreeMenuClass) {

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
    toggle : function () {
      if (this.opened == true) {
	this._match.element().children[0].removeChild(
	  this.element()
	);
	this.opened = false;
      }
      else {
	// Append element to match
	this._match.element().children[0].appendChild(
	  this.element()
	);
	this.opened = true;
      };
      
      return this.opened;
    },


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
    

    /**
     * Retrieve and parse snippet for tree representation
     */
    getTree : function (foundry, layer, cb) {
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
	    cb(matchTreeClass.create(matchResponse["snippet"]));
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
      
      // Element destroy
    },

    /**
     * Add a new tree view to the list
     */
    addTree : function (foundry, layer, cb) {
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

      var close = tree.appendChild(document.createElement('em'));
      close.addEventListener(
	'click', function (e) {
	  matchtree.parentNode.removeChild(matchtree);
	  e.halt();
	}
      );

      tree.classList.add('loading');

      // Get tree data async
      this.getTree(foundry, layer, function (treeObj) {

	tree.classList.remove('loading');

	// Something went wrong - probably log!!!

	if (treeObj === null) {
	  tree.appendChild(document.createTextNode('No data available.'));
	}
	else {
	  tree.appendChild(treeObj.element());
	  // Reposition the view to the center
	  // (This may in a future release be a reposition
	  // to move the root into the center or the actual
	  // match)
	  treeObj.center();
	};
	
	if (cb !== undefined)
	  cb(treeObj);

      });
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

      // Append default table
      var matchtable = document.createElement('div');
      matchtable.classList.add('matchtable', 'loading');
      info.appendChild(matchtable);

      // Create the table asynchronous
      this.getTable(undefined, function (table) {
	if (table !== null) {
	  matchtable.classList.remove('loading');
	  matchtable.appendChild(table.element());
	};
      });

      // Get spans
      var spanLayers = this._match.getSpans().sort(
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
      for (var i = 0; i < spanLayers.length; i++) {
	var span = spanLayers[i];
	
	// Add foundry/layer to menu list
	menuList.push([
	  span.foundry + '/' + span.layer,
	  span.foundry,
	  span.layer
	]);
      };

      // Create tree menu
      var treemenu = this.treeMenu(menuList);
      var span = info.appendChild(document.createElement('p'));
      span.classList.add('addtree');
      span.appendChild(document.createTextNode(loc.ADDTREE));

      var treeElement = treemenu.element();
      span.appendChild(treeElement);

      span.addEventListener('click', function (e) {
	treemenu.show();
	treemenu.focus();
      });
      
      this._element = info;

      return info;
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
