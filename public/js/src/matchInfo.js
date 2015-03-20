/**
 * Visualize annotations.
 *
 * @author Nils Diewald
 */
/*
  - Scroll with a static left legend.
  - Highlight (at least mark as bold) the match
  - Scroll to match vertically per default
 */
var KorAP = KorAP || {};

(function (KorAP) {
  "use strict";

  // Default log message
  KorAP.log = KorAP.log || function (type, msg) {
    console.log(type + ": " + msg);
  };

  KorAP._AvailableRE = new RegExp("^([^\/]+?)\/([^=]+?)(?:=(spans|rels|tokens))?$");
  KorAP._TermRE = new RegExp("^(?:([^\/]+?)\/)?([^:]+?):(.+?)$");
  KorAP._matchTerms  = ["corpusID", "docID", "textID"];

  // API requests
  KorAP.API = KorAP.API || {};
  // TODO: Make this async
  KorAP.API.getMatchInfo = KorAP.API.getMatchInfo || function () { return {} };

  KorAP.MatchInfo = {

    /**
     * Create a new annotation object.
     * Expects an array of available foundry/layer=type terms.
     * Supported types are 'spans', 'tokens' and 'rels'.
     */
    create : function (match, available) {
      if (arguments.length < 2)
	throw new Error("Missing parameters");

      return Object.create(KorAP.MatchInfo)._init(match, available);
    },

    _init : function (match, available) {
      this._match = KorAP.Match.create(match);
      this._available = {
	tokens : [],
	spans : [],
	rels : []
      };
      for (var i = 0; i < available.length; i++) {
	var term = available[i];
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
     * Get table object.
     */
    getTable : function (tokens) {
      var focus = [];

      // Get all tokens
      if (tokens === undefined) {
	focus = this.getTokens();
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

      return null;
    },

    // Parse snippet for table visualization
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
	this._tree = KorAP.MatchTree.create(matchResponse["snippet"]);
	return this._tree;
      };

      return null;
 
    }
  };

  KorAP.Match = {
    create : function (match) {
      return Object.create(KorAP.Match)._init(match);
    },
    _init : function (match) {
      for (var i in KorAP._matchTerms) {
	var term = KorAP._matchTerms[i];
	if (match[term] !== undefined) {
	  this[term] = match[term];
	}
	else {
	  this[term] = undefined;
	}
      };
      return this;
    },
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

      return table;
    }
  };

  /**
   * Visualize span annotations as a tree.
   */
  // http://java-hackers.com/p/paralin/meteor-dagre-d3
  KorAP.MatchTree = {

    create : function (snippet) {
      return Object.create(KorAP.MatchTree)._init(snippet);
    },

    nodes : function () {
      return this._next;
    },

    _init : function (snippet) {
      this._next = new Number(0);

      // Create html for traversal
      var html = document.createElement("div");
      html.innerHTML = snippet;
      this._graph = new dagreD3.Digraph();

      // This is a new root
      this._graph.addNode(
	this._next++,
	{ "nodeclass" : "root" }
      );

      // Parse nodes from root
      this._parse(0, html.childNodes);

      // Root node has only one child - remove
      if (Object.keys(this._graph._outEdges[0]).length === 1)
	  this._graph.delNode(0);

      // Initialize d3 renderer for dagre
      this._renderer = new dagreD3.Renderer();
      /*
      var oldDrawNodes = this._renderer.drawNodes();
      this._renderer.drawNodes(
	function (graph, root) {
	  var svgNodes = oldDrawNodes(graph, root);
	  svgNodes.each(
	    function (u) {
	      d3.select(this).classed(graph.node(u).nodeClass, true);
	    }
	  );
	}
      );
*/
      // Disable pan and zoom
      this._renderer.zoom(false);

      html = undefined;
      return this;
    },

    // Remove foundry and layer for labels
    _clean : function (title) {
      return title.replace(KorAP._TermRE, RegExp.$1);
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

	    this._graph.addNode(id, {
	      "nodeclass" : "middle",
	      "label" : title
	    });
	    this._graph.addEdge(null, parent, id);

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
	    this._graph.addNode(id, {
	      "nodeclass" : "leaf",
	      "label" : c.nodeValue
	    });

	    this._graph.addEdge(null, parent, id);
	  };
      };
      return this;
    },

    element : function () {
      this._element = document.createElement('div');
      var svg = document.createElement('svg');
      this._element.appendChild(svg);
      var svgGroup = svg.appendChild(document.createElement('svg:g'));

      svgGroup = d3.select(svgGroup);

      console.log(svgGroup);
      var layout = this._renderer.run(this._graph, svgGroup);
/*
      var w = layout.graph().width;
      var h = layout.graph().height;
      this._element.setAttribute("width", w + 10);
      this._element.setAttribute("height", h + 10);
      svgGroup.attr("transform", "translate(5, 5)");
*/
      return this._element;
    }
  };

}(this.KorAP));
