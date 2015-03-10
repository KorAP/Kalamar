// Store Table object in global object

var splitRegex = /^([^\/]+?)(?:\/([^:]+?))?:(.+?)$/;

var textFoundry = "Foundry";
var textLayer = "Layer";


// SnippetTable constructor
function SnippetTable (snippet) {
  this.info = [];
  this.foundry = {};
  this.layer = {};
  this.pos = 0;

  this.load = function (children) {
    for (var i in children) {
      var c = children[i];

      // Create object on position unless it exists
      if (this.info[this.pos] === undefined)
	this.info[this.pos] = {};

      var found = this.info[this.pos];

      // element with title
      if (c.nodeType === 1) {
	if (c.getAttribute("title")) {
	  if (splitRegex.exec(c.getAttribute("title"))) {

	    // Fill position with info
	    var foundry, layer;
	    if (RegExp.$2) {
	      foundry = RegExp.$1;
	      layer = RegExp.$2;
	    }
	    else {
	      foundry = "base";
	      layer = RegExp.$1
	    };

	    if (found[foundry + "/" + layer] === undefined)
	      found[foundry + "/" + layer] = [];

	    found[foundry + "/" + layer].push(RegExp.$3);

	    // Set foundry
	    if (!this.foundry[foundry])
	      this.foundry[foundry] = {};
	    this.foundry[foundry][layer] = 1;

	    // Set layer
	    if (!this.layer[layer])
	      this.layer[layer] = {};
	    this.layer[layer][foundry] = 1;
	  };
	};

	// depth search
	if (c.hasChildNodes())
	  this.load(c.childNodes);
      }

      // Leaf node - store string on position and go to next string
      else if (c.nodeType === 3) {
	if (c.nodeValue.match(/[a-z0-9]/i))
	  this.info[this.pos++]["-s"] = c.nodeValue;
      };
    };
    delete this.info[this.pos];
    return this;
  };

  this.toTable = function (base) {
    var i, f, l;

    // Create HTML based on info
    var d = document;
    var table = d.createElement('table');
    var tr = d.createElement('tr');
    table.appendChild(tr);
    var th = d.createElement('th');
    th.appendChild(document.createTextNode(base === "layer" ? textLayer : textFoundry));

    // Add icon to switch sorting
    var span = document.createElement("span");

    // Add switch event
    var that = this;
    span.addEventListener("click", function (obj) {
      var x = that.toTable(base === "layer" ? "foundry" : "layer");
      table.parentNode.replaceChild(x, table);
    }, false);

    span.setAttribute("class", "switchSort");
    var icon = document.createElement("i");
    icon.setAttribute("class", "fa fa-arrows-h");
    span.appendChild(icon);
    th.appendChild(span);

    tr.appendChild(th);
    th = d.createElement('th');
    th.appendChild(document.createTextNode(base === "layer" ? textFoundry : textLayer));
    tr.appendChild(th);

    // Header line with surface strings
    for (i in this.info) {
      th = d.createElement('th');
      tr.appendChild(th);
      th.appendChild(d.createTextNode(this.info[i]["-s"]));
    };

    // Sort keys
    var baseArray = [];
    if (base === "layer") {
      for (i in this.layer) {
	baseArray.push(i);
      };
    }
    else {
      for (i in this.foundry) {
	baseArray.push(i);
      };
    };
    baseArray.sort();

    // Annotations
    for (f in baseArray) {
      f = baseArray[f];
      var thBase = d.createElement('th');
      thBase.appendChild(d.createTextNode(f));

      var rowSpan = 0;

      // Sort keys
      var subArray = [];
      if (base === "layer") {
	for (i in this.layer[f]) {
	  subArray.push(i);
	};
      }
      else {
	for (i in this.foundry[f]) {
	  subArray.push(i);
	};
      };
      subArray.sort();

      for (l in subArray) {
	l = subArray[l];
	tr = d.createElement('tr');
	table.appendChild(tr);

	if (rowSpan === 0)
	  tr.appendChild(thBase);

	th = d.createElement('th');
	tr.appendChild(th);
	th.appendChild(d.createTextNode(l));

	var infoString = base === "layer" ? l + '/' + f : f + '/' + l;

	for (t in this.info) {
	  var td = d.createElement('td');
	  tr.appendChild(td);

	  var surfaces = this.info[t][infoString];
	  if (surfaces !== undefined) {
	    for (i in surfaces) {
	      td.appendChild(d.createTextNode(surfaces[i]));
	      if (i !== surfaces.length -1) {
		td.appendChild(d.createElement("br"));
	      };
	    };
	  };
	};
	rowSpan++;
      };
      thBase.setAttribute("rowspan", rowSpan);
    };
    // return HTML object
    return table;
  };

  // Create wrapper element
  var html = document.createElement("table");
  html.innerHTML = snippet;

  // Create table object and load data from HTML
  this.load(html.childNodes);
};


function showTable (o) {
  var match = o.parentNode.parentNode;
  var table = match.getElementsByClassName("tokenInfo")[0];

  if (table.classList.contains("active")) {
    table.classList.remove("active");
    return;
  }
  else if (table.getElementsByTagName("table").length > 0) {
    table.classList.add("active");
    return;
  };


  var corpusID = match.getAttribute('data-corpus-id');
  var docID    = match.getAttribute('data-doc-id');
  var matchID  = match.getAttribute('data-match-id');
  var url = '';;
  if (document.location.pathname.indexOf('kalamar') >= 0) {
    url = '/kalamar';
  };
  url += '/corpus/' + corpusID + '/' + docID + '/' + matchID;
  var snippet;

  Ajax.getJSON(url, function (res) {
    var snippet = new SnippetTable(res['snippet']);
    table.classList.add("active");
    table.appendChild(snippet.toTable());
  });
};


