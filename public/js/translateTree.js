var cleanRegex = /^([^\/]+?\/)?[^\:]+?\:/;

var renderer = new dagreD3.Renderer();
var oldDrawNodes = renderer.drawNodes();
renderer.drawNodes(
  function (graph, root) {
    var svgNodes = oldDrawNodes(graph, root);
    svgNodes.each(function(u) {
      d3.select(this).classed(graph.node(u).nodeclass, true);
    });
    return svgNodes;
  });

// Disable pan and zoom
renderer.zoom(false);

function SnippetTree (graph) {
  this.next = new Number(0);
  this.graph = graph;

  // Fix title
  this.cleanTitle = function (title) {
    return title.replace(cleanRegex, "");
  };

  // This is a new root
  this.graph.addNode(this.next++,{
    nodeclass: "root"
  })

  // Add the children to the node
  this.parseChildren = function (parent, children) {
    for (var i in children) {
      var c = children[i];

      // Element node
      if (c.nodeType == 1) {

	// Get title from html
	if (c.getAttribute("title")) {
	  var title = this.cleanTitle(c.getAttribute("title"));

	  // Add child node
	  var id = this.next++;
	  this.graph.addNode(id, {
	    nodeclass : "middle",
	    label : title
	  });
	  this.graph.addEdge(null, parent, id);

	  // Check for next level
	  if (c.hasChildNodes())
	    this.parseChildren(id, c.childNodes);
	}

	// Step further
	else if (c.hasChildNodes())
	  this.parseChildren(parent, c.childNodes);
      }

      // Text node
      else if (c.nodeType == 3)
	if (c.nodeValue.match(/[-a-z0-9]/i)) {
	  // Add child node
	  var id = this.next++;
	  this.graph.addNode(id, {
	    nodeclass : "leaf",
	    label : c.nodeValue
	  });
	  this.graph.addEdge(null, parent, id);
	};
    };
    return this;
  };
};

function translateTree (snippet) {
  var html = document.createElement("tree");
  html.innerHTML = snippet;
  var st = new SnippetTree(new dagreD3.Digraph());
  st.parseChildren(0, html.childNodes);
  var g = st.graph;

  // Root node has only one child
  if (Object.keys(g._outEdges[0]).length === 1)
    g.delNode(0);
  return g;
};

function showTree (o, foundry, layer) {
  var match = o.parentNode.parentNode;

  var tree = d3.select(match).select("div > div.treeInfo");

  if (tree.classed("active")) {
    tree.classed("active", false);
    return;
  }
  else if (!tree.select("svg").empty()) {
    tree.classed("active", true);
    return;
  };

  var corpusID = match.getAttribute('data-corpus-id');
  var docID    = match.getAttribute('data-doc-id');
  var matchID  = match.getAttribute('data-match-id');
  var url      =
    '/corpus' +
    '/' + corpusID +
    '/' + docID +
    '/' + matchID +
    '?foundry=' + foundry +
    '&layer=' + layer +
    '&spans=true';

  jQuery.getJSON(url, function (res) {
    var svg = tree.append("svg");
    var svgGroup = svg.append("svg:g");
    var treething = translateTree(res['snippet']);

    var layout = renderer.run(treething, svgGroup);

    svg.attr("width", layout.graph().width + 40)
      .attr("height", layout.graph().height + 40);

    tree.classed("active", true);
  });
};
