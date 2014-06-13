var cleanRegex = /^([^\/]+?\/)?[^\:]+?\:/;
var splitRegex = /^(.+?):([^:]+?)$/;

// SnippetTree constructor
function SnippetTree (obj) {
  this.children = [];
  this.data = obj;

  // Replace title
  this.cleanTitle = function (title) {
    return title.replace(cleanRegex, "");
  };

  // Add new child to tree
  this.addChild = function (childData) {
    var c = new SnippetTree (childData);
    this.children.push(c);
    return c;
  };

  // Recursively parse children
  this.parseChildren = function (children) {
    for (var i in children) {
      var c = children[i];
      if (c.nodeType === 1) {
	if (c.getAttribute("title")) {
	  var title = this.cleanTitle(c.getAttribute("title"));
	  var childTree = this.addChild({ type : title });
	  if (c.hasChildNodes())
	    childTree.parseChildren(c.childNodes);
	}
	else if (c.hasChildNodes())
	  this.parseChildren(c.childNodes);
      }
      else if (c.nodeType === 3)
	if (c.nodeValue.match(/[-a-z0-9]/i)) {
	  this.addChild({
	    type : "leaf",
	    word : c.nodeValue
	  });
	};
    };
    return this;
  };
};


// SnippetTable constructor
function SnippetTable (obj) {
  this.info = [];
  this.overall = {};
  this.pos = 0;
  this.load = function (children) {
    for (var i in children) {
      var c = children[i];

      // element with title
      if (c.nodeType === 1) {
	if (c.getAttribute("title")) {
	  if (splitRegex.exec(c.getAttribute("title"))) {

	    // Create object on position unless it exists
	    if (!this.info[this.pos]) {
	      this.info[this.pos] = {};
	    };

	    // Fill position with info
	    this.info[this.pos][RegExp.$1] = RegExp.$2;
	    this.overall[RegExp.$1] = 1;
	  };
	};

	// depth search
	if (c.hasChildNodes())
	  this.load(c.childNodes);
      }

      // Leaf node - store string on position and go to next string
      else if (c.nodeType === 3)
	if (c.nodeValue.match(/[-a-z0-9]/i))
	  this.info[this.pos++]["-s"] = c.nodeValue;
    };
    return this;
  };
};


// Make tree from snippet
function translateTree (snippet) {
  var html = document.createElement("tree");
  html.innerHTML = snippet;
  return new SnippetTree({ type : "ROOT" }).parseChildren(html.childNodes);
};


// Make table from snippet
function translateTable (snippet) {
  // Create wrapper element
  var html = document.createElement("table");
  html.innerHTML = snippet;

  // Create table object and load data from HTML
  var info = new SnippetTable();
  info.load(html.childNodes);

  // Sort keys
  var overallArray = [];
  for (i in info.overall) {
    overallArray.push(i);
  };
  overallArray.sort();

  // Create HTML based on info
  var d = document;
  var table = d.createElement('table');
  var tr = d.createElement('tr');
  table.appendChild(tr);
  var th = d.createElement('th');
  tr.appendChild(th);

  // Header line with surface strings
  for (i in info.info) {
    th = d.createElement('th');
    tr.appendChild(th);
    th.appendChild(d.createTextNode(info.info[i]["-s"]));
  };

  // Annotations
  for (i in overallArray) {
    i = overallArray[i];

    tr = d.createElement('tr');
    table.appendChild(tr);
    th = d.createElement('th');
    tr.appendChild(th);
    th.appendChild(d.createTextNode(i));
    for (t in info.info) {
      var td = d.createElement('td');
      tr.appendChild(td);
      if (info.info[t][i] !== undefined)
	td.appendChild(d.createTextNode(info.info[t][i]));
    };
  };

  // return HTML object
  return table;
};
