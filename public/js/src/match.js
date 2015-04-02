/**
 * Get information on matches,
 * generate annotation tables and trees.
 *
 * @author Nils Diewald
 */
// require menu.js, dagre
/*
 * - Highlight (at least mark as bold) the match
 * - Scroll to match vertically per default
 */
var KorAP = KorAP || {};

(function (KorAP) {
  "use strict";

  var svgXmlns = "http://www.w3.org/2000/svg";

  // Default log message
  KorAP.log = KorAP.log || function (type, msg) {
    console.log(type + ": " + msg);
  };

  // Localization values
  var loc   = (KorAP.Locale = KorAP.Locale || {} );
  loc.ADDTREE  = loc.ADDTREE  || 'Add tree view';
  loc.SHOWINFO = loc.SHOWINFO || 'Show information';
  loc.CLOSE    = loc.CLOSE    || 'Close';

  KorAP._AvailableRE = new RegExp("^([^\/]+?)\/([^=]+?)(?:=(spans|rels|tokens))?$");
  KorAP._TermRE      = new RegExp("^(?:([^\/]+?)\/)?([^:]+?):(.+?)$");
  KorAP._matchTerms  = ['corpusID', 'docID', 'textID', 'matchID', 'available'];

  // API requests
  KorAP.API = KorAP.API || {};

  // TODO: Make this async
  KorAP.API.getMatchInfo = KorAP.API.getMatchInfo || function () { return {} };


  /**
   * Match object
   */
  KorAP.Match = {

    /**
     * Create a new annotation object.
     * Expects an array of available foundry/layer=type terms.
     * Supported types are 'spans', 'tokens' and 'rels'.
     */
    create : function (match) {
      return Object.create(KorAP.Match)._init(match);
    },

    /**
     * Initialize match.
     */
    _init : function (match) {
      this._element = null;

      // No match defined
      if (arguments.length < 1 ||
	  match === null ||
	  match === undefined) {
	throw new Error('Missing parameters');
      }

      // Match defined as a node
      else if (match instanceof Node) {
	this._element  = match;

	// Circular reference !!
	match["_match"] = this;

	this.corpusID  = match.getAttribute('data-corpus-id'),
	this.docID     = match.getAttribute('data-doc-id'),
	this.textID    = match.getAttribute('data-text-id'),
	this.matchID   = match.getAttribute('data-match-id')

	// List of available annotations
	this.available = match.getAttribute('data-available-info').split(' ');
      }

      // Match as an object
      else {

	// Iterate over allowed match terms
	for (var i in KorAP._matchTerms) {
	  var term = KorAP._matchTerms[i];
	  if (match[term] !== undefined) {
	    this[term] = match[term];
	  }
	  else {
	    this[term] = undefined;
	  }
	};
      };

      this._available = {
	tokens : [],
	spans  : [],
	rels   : []
      };

      // Iterate over info layers
      for (var i = 0; i < this.available.length; i++) {
	var term = this.available[i];

	// Create info layer objects
	try {
	  var layer = KorAP.InfoLayer.create(term);
	  this._available[layer.type].push(layer);
	}
	catch (e) {
	  continue;
	};
      };

      return this;
    },


    /**
     * Return a list of parseable tree annotations.
     */
    getSpans : function () {
      return this._available.spans;
    },


    /**
     * Return a list of parseable token annotations.
     */
    getTokens : function () {
      return this._available.tokens;
    },


    /**
     * Return a list of parseable relation annotations.
     */
    getRels : function () {
      return this._available.rels;
    },

    /**
     * Open match
     */
    open : function () {

      // Add actions unless it's already activated
      var element = this._element;

      // There is an element to open
      if (this._element === undefined || this._element === null)
	return false;

      // The element is already opened
      if (element.classList.contains('active'))
	return false;
      
      // Add active class to element
      element.classList.add('active');

      // Create action buttons
      var ul = document.createElement('ul');
      ul.classList.add('action', 'right');
      element.appendChild(ul);

      // Use localization
      var loc = KorAP.Locale;

      // Add close button
      var close = document.createElement('li');
      close.appendChild(document.createElement('span'))
	.appendChild(document.createTextNode(loc.CLOSE));
      close.classList.add('close');
      close.setAttribute('title', loc.CLOSE);

      // Add info button
      var info = document.createElement('li');
      info.appendChild(document.createElement('span'))
	.appendChild(document.createTextNode(loc.SHOWINFO));
      info.classList.add('info');
      info.setAttribute('title', loc.SHOWINFO);

      var that = this;

      // Close match
      close.addEventListener('click', function (e) {
	e.halt();
	that.close()
      });

      // Add information, unless it already exists
      info.addEventListener('click', function (e) {
	e.halt();
	that.info().toggle();
      });

      ul.appendChild(close);
      ul.appendChild(info);

      return true;
    },

    /**
     * Close info view
     */
    close : function () {
      this._element.classList.remove('active');

/*
      if (this._info !== undefined) {
	this._info.destroy();
      };
*/
    },


    /**
     * Get and open associated match info.
     */
    info : function () {

      // Create match info
      if (this._info === undefined)
	this._info = KorAP.MatchInfo.create(this);

      // There is an element to append
      if (this._element === undefined ||
	  this._element === null)
	return this._info;

      // Info is already activated
      if (this._info._element !== undefined)
	return this._info;

      return this._info;
    },


    /**
     * Get match element.
     */
    element : function () {

      // May be null
      return this._element;
    }
  };



  /**
   * Information about a match.
   */
  KorAP.MatchInfo = {

    /**
     * Create new object
     */
    create : function (match) {
      return Object.create(KorAP.MatchInfo)._init(match);
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
     * Retrieve and parse snippet for table representation
     */
    getTable : function (tokens) {
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
	    var layer = KorAP.InfoLayer.create(term);
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
	return;

      // Get info (may be cached)
      // TODO: Async
      var matchResponse = KorAP.API.getMatchInfo(
	this._match,
	{ 'spans' : false, 'layer' : focus }
      );

      // Get snippet from match info
      if (matchResponse["snippet"] !== undefined) {
	this._table = KorAP.MatchTable.create(matchResponse["snippet"]);
	return this._table;
      };

      // Todo: Store the table as a hash of the focus

      return null;
    },


    /**
     * Retrieve and parse snippet for tree representation
     */
    getTree : function (foundry, layer) {
      var focus = [];

      // TODO: Async
      var matchResponse = KorAP.API.getMatchInfo(
	this._match, {
	  'spans' : true,
	  'foundry' : foundry,
	  'layer' : layer
	}
      );

      // TODO: Support and cache multiple trees

      // Get snippet from match info
      if (matchResponse["snippet"] !== undefined) {
	// Todo: This should be cached somehow
	return KorAP.MatchTree.create(matchResponse["snippet"]);
      };

      return null;
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
    addTree : function (foundry, layer) {
      var treeObj = this.getTree(foundry, layer);

      // Something went wrong - probably log!!!
      if (treeObj === null)
	return;

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
      tree.appendChild(treeObj.element());
      this._element.insertBefore(matchtree, this._element.lastChild);

      var close = tree.appendChild(document.createElement('em'));
      close.addEventListener(
	'click', function (e) {
	  matchtree.parentNode.removeChild(matchtree);
	  e.halt();
	}
      );

      // Reposition the view to the center
      // (This may in a future release be a reposition
      // to move the root into the center or the actual
      // match)
      treeObj.center();
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
      matchtable.classList.add('matchtable');
      matchtable.appendChild(this.getTable().element());
      info.appendChild(matchtable);

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
	treemenu.show('');
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

      return this._treeMenu = KorAP.MatchTreeMenu.create(this, list);
    }
  };



  /**
   *
   * Alternatively pass a string as <tt>base/s=span</tt>
   *
   * @param foundry
   */
  KorAP.InfoLayer = {
    create : function (foundry, layer, type) {
      return Object.create(KorAP.InfoLayer)._init(foundry, layer, type);
    },
    _init : function (foundry, layer, type) {
      if (foundry === undefined)
	throw new Error("Missing parameters");

      if (layer === undefined) {
	if (KorAP._AvailableRE.exec(foundry)) {
	  this.foundry = RegExp.$1;
	  this.layer = RegExp.$2;
	  this.type = RegExp.$3;
	}
	else {
	  throw new Error("Missing parameters");
	};
      }
      else {
	this.foundry = foundry;
	this.layer = layer;
	this.type = type;
      };

      if (this.type === undefined)
	this.type = 'tokens';

      return this;
    }
  };


  KorAP.MatchTable = {
    create : function (snippet) {
      return Object.create(KorAP.MatchTable)._init(snippet);
    },
    _init : function (snippet) {
      // Create html for traversal
      var html = document.createElement("div");
      html.innerHTML = snippet;

      this._pos = 0;
      this._token = [];
      this._info = [];
      this._foundry = {};
      this._layer = {};

      // Parse the snippet
      this._parse(html.childNodes);      

      html.innerHTML = '';
      return this;
    },

    length : function () {
      return this._pos;
    },

    getToken : function (pos) {
      if (pos === undefined)
	return this._token;
      return this._token[pos];
    },

    getValue : function (pos, foundry, layer) {
      return this._info[pos][foundry + '/' + layer]
    },

    getLayerPerFoundry : function (foundry) {
      return this._foundry[foundry]
    },

    getFoundryPerLayer : function (layer) {
      return this._layer[layer];
    },

    // Parse the snippet
    _parse : function (children) {

      // Get all children
      for (var i in children) {
	var c = children[i];

	// Create object on position unless it exists
	if (this._info[this._pos] === undefined)
	  this._info[this._pos] = {};

	// Store at position in foundry/layer as array
	var found = this._info[this._pos];

	// Element with title
	if (c.nodeType === 1) {
	  if (c.getAttribute("title") &&
	      KorAP._TermRE.exec(c.getAttribute("title"))) {

	    // Fill position with info
	    var foundry, layer, value;
	    if (RegExp.$2) {
	      foundry = RegExp.$1;
	      layer   = RegExp.$2;
	    }
	    else {
	      foundry = "base";
	      layer   = RegExp.$1
	    };

	    value = RegExp.$3;

	    if (found[foundry + "/" + layer] === undefined)
	      found[foundry + "/" + layer] = [];

	    // Push value to foundry/layer at correct position
	    found[foundry + "/" + layer].push(RegExp.$3);

	    // Set foundry
	    if (this._foundry[foundry] === undefined)
	      this._foundry[foundry] = {};
	    this._foundry[foundry][layer] = 1;

	    // Set layer
	    if (this._layer[layer] === undefined)
	      this._layer[layer] = {};
	    this._layer[layer][foundry] = 1;
	  };

	  // depth search
	  if (c.hasChildNodes())
	    this._parse(c.childNodes);
	}

	// Leaf node
	// store string on position and go to next string
	else if (c.nodeType === 3) {
	  if (c.nodeValue.match(/[a-z0-9]/i))
	    this._token[this._pos++] = c.nodeValue;
	};
      };

      delete this._info[this._pos];
    },


    /**
     * Get HTML table view of annotations.
     */
    element : function () {
      if (this._element !== undefined)
	return this._element;

      // First the legend table
      var d = document;
      var table = d.createElement('table');

      // Single row in head
      var tr = table.appendChild(d.createElement('thead'))
	.appendChild(d.createElement('tr'));

      // Add cell to row
      var addCell = function (type, name) {
	var c = this.appendChild(d.createElement(type))
	if (name === undefined)
	  return c;

	if (name instanceof Array) {
	  for (var n = 0; n < name.length; n++) {
	    c.appendChild(d.createTextNode(name[n]));
	    if (n !== name.length - 1) {
	      c.appendChild(d.createElement('br'));
	    };
	  };
	}
	else {
	  c.appendChild(d.createTextNode(name));
	};
      };

      tr.addCell = addCell;

      // Add header information
      tr.addCell('th', 'Foundry');
      tr.addCell('th', 'Layer');

      // Add tokens
      for (var i in this._token) {
	tr.addCell('th', this.getToken(i));
      };

      var tbody = table.appendChild(
	d.createElement('tbody')
      );

      var foundryList = Object.keys(this._foundry).sort();

      for (var f = 0; f < foundryList.length; f++) {
	var foundry = foundryList[f];
	var layerList =
	  Object.keys(this._foundry[foundry]).sort();

	for (var l = 0; l < layerList.length; l++) {
	  var layer = layerList[l];
	  tr = tbody.appendChild(
	    d.createElement('tr')
	  );
	  tr.setAttribute('tabindex', 0);
	  tr.addCell = addCell;

	  tr.addCell('th', foundry);
	  tr.addCell('th', layer);

	  for (var v = 0; v < this.length(); v++) {
	    tr.addCell(
	      'td',
	      this.getValue(v, foundry, layer) 
	    );
	  };
	};
      };

      return this._element = table;
    }
  };


  /**
   * Visualize span annotations as a tree using Dagre.
   */
  KorAP.MatchTree = {

    create : function (snippet) {
      return Object.create(KorAP.MatchTree)._init(snippet);
    },

    nodes : function () {
      return this._next;
    },

    _addNode : function (id, obj) {
      obj["width"] = 55;
      obj["height"] = 20;
      this._graph.setNode(id, obj)
    },

    _addEdge : function (src, target) {
      this._graph.setEdge(src, target);
    },

    _init : function (snippet) {
      this._next = new Number(0);

      // Create html for traversal
      var html = document.createElement("div");
      html.innerHTML = snippet;
      var g = new dagre.graphlib.Graph({
	"directed" : true	
      });
      g.setGraph({
	"nodesep" : 35,
	"ranksep" : 15,
	"marginx" : 40,
	"marginy" : 10
      });
      g.setDefaultEdgeLabel({});

      this._graph = g;

      // This is a new root
      this._addNode(
	this._next++,
	{ "class" : "root" }
      );

      // Parse nodes from root
      this._parse(0, html.childNodes);

      // Root node has only one child - remove
      if (g.outEdges(0).length === 1)
	g.removeNode(0);

      html = undefined;
      return this;
    },

    // Remove foundry and layer for labels
    _clean : function (title) {
      return title.replace(KorAP._TermRE, "$3");
    },

    // Parse the snippet
    _parse : function (parent, children) {
      for (var i in children) {
	var c = children[i];

	// Element node
	if (c.nodeType == 1) {

	  // Get title from html
	  if (c.getAttribute("title")) {
	    var title = this._clean(c.getAttribute("title"));

	    // Add child node
	    var id = this._next++;

	    this._addNode(id, {
	      "class" : "middle",
	      "label" : title
	    });
	    this._addEdge(parent, id);

	    // Check for next level
	    if (c.hasChildNodes())
	      this._parse(id, c.childNodes);
	  }

	  // Step further
	  else if (c.hasChildNodes())
	    this._parse(parent, c.childNodes);
	}

	// Text node
	else if (c.nodeType == 3)

	  if (c.nodeValue.match(/[-a-z0-9]/i)) {

	    // Add child node
	    var id = this._next++;
	    this._addNode(id, {
	      "class" : "leaf",
	      "label" : c.nodeValue
	    });

	    this._addEdge(parent, id);
	  };
      };
      return this;
    },

    /**
     * Center the viewport of the canvas
     */
    center : function () {
      if (this._element === undefined)
	return;

      var treeDiv = this._element.parentNode;

      var cWidth = parseFloat(window.getComputedStyle(this._element).width);
      var treeWidth = parseFloat(window.getComputedStyle(treeDiv).width);
      // Reposition:
      if (cWidth > treeWidth) {
	var scrollValue = (cWidth - treeWidth) / 2;
	treeDiv.scrollLeft = scrollValue;
      };
    },

    // Get element
    element : function () {
      if (this._element !== undefined)
	return this._element;

      var g = this._graph;

      dagre.layout(g);

      var canvas = document.createElementNS(svgXmlns, 'svg');
      this._element = canvas;

      canvas.setAttribute('height', g.graph().height);
      canvas.setAttribute('width', g.graph().width);

      // Create edges
      g.edges().forEach(
	function (e) {
	  var src = g.node(e.v);
	  var target = g.node(e.w);
	  var p = document.createElementNS(svgXmlns, 'path');
	  p.setAttributeNS(null, "d", _line(src, target));
	  p.classList.add('edge');
	  canvas.appendChild(p);
	});

      // Create nodes
      g.nodes().forEach(
	function (v) {
	  v = g.node(v);
	  var group = document.createElementNS(svgXmlns, 'g');
	  group.classList.add(v.class);

	  // Add node box
	  var rect = group.appendChild(document.createElementNS(svgXmlns, 'rect'));
	  rect.setAttributeNS(null, 'x', v.x - v.width / 2);
	  rect.setAttributeNS(null, 'y', v.y - v.height / 2);
	  rect.setAttributeNS(null, 'width', v.width);
	  rect.setAttributeNS(null, 'height', v.height);
	  rect.setAttributeNS(null, 'rx', 5);
	  rect.setAttributeNS(null, 'ry', 5);

	  // Add label
	  var text = group.appendChild(document.createElementNS(svgXmlns, 'text'));
	  text.setAttributeNS(null, 'x', v.x - v.width / 2);
	  text.setAttributeNS(null, 'y', v.y - v.height / 2);
	  text.setAttributeNS(
	    null,
	    'transform',
	    'translate(' + v.width/2 + ',' + ((v.height / 2) + 5) + ')'
	  );
	  var tspan = document.createElementNS(svgXmlns, 'tspan');
	  tspan.appendChild(document.createTextNode(v.label));
	  text.appendChild(tspan);
	  canvas.appendChild(group);
	}
      );

      return this._element;
    }
  };

  /**
   * Menu item for tree view choice.
   */
  KorAP.MatchTreeItem = {
    create : function (params) {
      return Object.create(KorAP.MenuItem)
	.upgradeTo(KorAP.MatchTreeItem)._init(params);
    },
    content : function (content) {
      if (arguments.length === 1) {
	this._content = content;
      };
      return this._content;
    },

    // The foundry attribute
    foundry : function () {
      return this._foundry;
    },

    // The layer attribute
    layer : function () {
      return this._layer;
    },

    // enter or click
    onclick : function (e) {
      var menu = this.menu();
      menu.hide();
      e.halt();
      if (menu.info() !== undefined)
	menu.info().addTree(this._foundry, this._layer);
    },
    
    _init : function (params) {
      if (params[0] === undefined)
	throw new Error("Missing parameters");

      this._name    = params[0];
      this._foundry = params[1];
      this._layer   = params[2];
      this._content = document.createTextNode(this._name);
      this._lcField = ' ' + this.content().textContent.toLowerCase();
      return this;
    }
  };


  /**
   * Menu to choose from for tree views.
   */
  KorAP.MatchTreeMenu = {
    create : function (info, params) {
      var obj = Object.create(KorAP.Menu)
	.upgradeTo(KorAP.MatchTreeMenu)
	._init(KorAP.MatchTreeItem, undefined, params);
      obj.limit(6);

      obj._info = info;

      // This is only domspecific
      obj.element().addEventListener('blur', function (e) {
	this.menu.hide();
      });

      return obj;
    },
    info :function () {
      return this._info;
    }
  };


  // Create path for node connections 
  function _line (src, target) {
    var x1 = src.x,
        y1 = src.y,
        x2 = target.x,
        y2 = target.y - target.height / 2;

    // c 0,0 -10,0
    return 'M ' + x1 + ',' + y1 + ' ' + 
      'C ' + x1 + ',' + y1 + ' ' + 
      x2 + ',' + (y2 - (y2 - y1) / 2)  + ' ' + 
      x2 + ',' + y2;
  };

}(this.KorAP));
