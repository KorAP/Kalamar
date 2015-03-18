/**
 * Make annotations visible.
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

  KorAP._AvailableRE = new RegExp("^([^\/]+?)\/([^=]+?)(?:=(spans|rels|tokens))?$");
  KorAP._TermRE = new RegExp("^([^\/]+?)(?:\/([^:]+?))?:(.+?)$");
  KorAP._matchTerms  = ["corpusID", "docID", "textID"];

  // API requests
  KorAP.API = KorAP.API || {};
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
      var matchResponse = KorAP.API.getMatchInfo(
	this._match,
	{ 'spans' : true, 'layer' : focus }
      );

      // Get snippet from match info
      if (matchResponse["snippet"] !== undefined) {
	this._table = KorAP.InfoTable.create(matchResponse["snippet"]);
	return this._table;
      };

      return null;
    }

    /*
    // Parse snippet for table visualization
    getTree : function (foundry, layer) {
    },
    */
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


  KorAP.InfoTable = {
    create : function (snippet) {
      return Object.create(KorAP.InfoTable)._init(snippet);
    },
    _init : function (snippet) {
      // Create html for traversal
      var html = document.createElement("div");
      html.innerHTML = snippet;

      this._pos = 0;
      this._token = [];
      this._info = [];
      this._foundry = [];
      this._layer = [];

      // Parse the snippet
      this._parse(html.childNodes);      

      this._layer = undefined;
      this._foundry = undefined;

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
	    if (!this._foundry[foundry])
	      this._foundry[foundry] = {};
	    this._foundry[foundry][layer] = 1;

	    // Set layer
	    if (!this._layer[layer])
	      this._layer[layer] = {};
	    this._layer[layer][foundry] = 1;
	  };

	  // depth search
	  if (c.hasChildNodes())
	    this._parse(c.childNodes);
	}

	// Leaf node - store string on position and go to next string
	else if (c.nodeType === 3) {
	  if (c.nodeValue.match(/[a-z0-9]/i))
	    this._token[this._pos++] = c.nodeValue;
	};
      };

      delete this._info[this._pos];
    },
    element : function () {
      var ce = document.createElement;
      // First the legend table
      /*
      var table = ce('table');
      var row = ce('tr');
      table.appendChild(tr);
      */      
    }
  };

  
  /*
    KorAP.InfoFoundryLayer = {};
    KorAP.InfoTree = {};
    KorAP.InfoTable = {};
  */
}(this.KorAP));
