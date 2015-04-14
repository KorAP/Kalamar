/**
 * Visualize span annotations as a tree using Dagre.
 */
define(['lib/dagre'], function (dagre) {
  "use strict";

  var svgXmlns = "http://www.w3.org/2000/svg";
  var _TermRE = new RegExp("^(?:([^\/]+?)\/)?([^:]+?):(.+?)$");

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

  return {
    create : function (snippet) {
      return Object.create(this)._init(snippet);
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
      return title.replace(_TermRE, "$3");
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
	  rect.setAttributeNS(null, 'rx', 5);
	  rect.setAttributeNS(null, 'ry', 5);
	  rect.setAttributeNS(null, 'width', v.width);
	  rect.setAttributeNS(null, 'height', v.height);

	  if (v.class === 'root' && v.label === undefined) {
	    rect.setAttributeNS(null, 'width', v.height);
	    rect.setAttributeNS(null, 'x', v.x - v.height / 2);
	    rect.setAttributeNS(null, 'class', 'empty');
	  };

	  // Add label
	  if (v.label !== undefined) {
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
	  };

	  canvas.appendChild(group);
	}
      );

      return this._element;
    }
  };
});
