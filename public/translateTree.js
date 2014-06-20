var cleanRegex = /^([^\/]+?\/)?[^\:]+?\:/;

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

  // Recursively parse children
  this.parseChildren2 = function (children) {
    for (var i in children) {
      var c = children[i];
      if (c.nodeType === 1) {
	if (c.getAttribute("title")) {
	  var title = this.cleanTitle(c.getAttribute("title"));
	  var childTree = this.addChild({ type : title });
	  if (c.hasChildNodes())
	    childTree.parseChildren2(c.childNodes);
	}
	else if (c.hasChildNodes())
	  this.parseChildren2(c.childNodes);
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


  this.toTable = function () {
    
  };

  var tree = document.createElement('tree');
  html.innerHTML = snippet;
  this.parseChildren2(html.childNodes);
};

// Make tree from snippet
function translateTree (snippet) {
  var html = document.createElement("tree");
  html.innerHTML = snippet;
  return new SnippetTree({ type : "ROOT" }).parseChildren(html.childNodes);
};


