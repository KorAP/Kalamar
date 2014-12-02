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

console.log("Match: " + match);

  var tree = d3.select(match).select("div > div.treeInfo");

console.log("Tree: " + tree);

  if (tree.classed("active")) {
    tree.classed("active", false);
    return;
  }
  else if (!tree.select("svg").empty()) {
    tree.classed("active", true);
    return;
  };

  var corpusID = match.getAttribute('data-corpus-id');
console.log(corpusID);

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

  var wrapper = new String("<span class=\"context-left\"></span><span class=\"match\"><span title=\"xip/c:MC\"><span title=\"xip/c:TOP\"><span title=\"xip/c:PP\"><span title=\"xip/c:PREP\">Mit</span> <span title=\"xip/c:NP\"><span title=\"xip/c:DET\">dieser</span> <span title=\"xip/c:NPA\"><span title=\"xip/c:NOUN\">Methode</span></span></span></span> <span title=\"xip/c:VERB\">ist</span> <span title=\"xip/c:NP\"><span title=\"xip/c:PRON\">es</span></span> <span title=\"xip/c:AP\"><span title=\"xip/c:ADV\">nun</span> <span title=\"xip/c:ADJ\">möglich</span></span> <span title=\"xip/c:ADV\">z. B.</span> <span title=\"xip/c:NPA\"><span title=\"xip/c:NP\"><span title=\"xip/c:NOUN\">Voice</span></span></span> (<span title=\"xip/c:INS\"><span title=\"xip/c:NPA\"><span title=\"xip/c:NP\"><span title=\"xip/c:NOUN\">Sprache</span></span></span></span>) <span title=\"xip/c:VERB\">bevorzugt</span> <span title=\"xip/c:PP\"><span title=\"xip/c:PREP\">in</span> <span title=\"xip/c:NP\"><span title=\"xip/c:PRON\">der</span></span> <span title=\"xip/c:NPA\"><span title=\"xip/c:NP\"><span title=\"xip/c:NOUN\">Bridge</span></span></span></span> <span title=\"xip/c:INFC\"><span title=\"xip/c:INS\"><span title=\"xip/c:VERB\">weiterzugeben</span></span></span></span></span></span><span class=\"context-right\"></span>");

    var svg = tree.append("svg");
    var svgGroup = svg.append("svg:g");

  var treething = translateTree(wrapper);
console.log(treething);  

    var layout = renderer.run(treething, svgGroup);
    // 10 pixel padding
    var w = layout.graph().width;
    var h = layout.graph().height;
    svg.attr("width", w + 10);
    svg.attr("height", h + 10);
    svgGroup.attr("transform", "translate(5, 5)");
    tree.classed("active", true);

/*

  jQuery.getJSON(url, function (res) {
    var svg = tree.append("svg");
    var svgGroup = svg.append("svg:g");
    var treething = translateTree(res['snippet']);
    var layout = renderer.run(treething, svgGroup);
    // 10 pixel padding
    var w = layout.graph().width;
    var h = layout.graph().height;
    svg.attr("width", w + 10);
    svg.attr("height", h + 10);
    svgGroup.attr("transform", "translate(5, 5)");
    tree.classed("active", true);
  });

*/
};
