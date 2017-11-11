/**
 * Parse a relational tree and visualize using arcs.
 *
 * @author Nils Diewald
 */

define([], function () {
  "use strict";

  var svgNS = "http://www.w3.org/2000/svg";
  var _TermRE = new RegExp("^(?:([^\/]+?)\/)?([^:]+?):(.+?)$");

  return {
    create : function (snippet) {
      return Object.create(this)._init(snippet);
    },

    // Initialize the state of the object
    _init : function (snippet) {

      // Predefine some values
      this._tokens  = [];
      this._arcs    = [];
      this._tokenElements = [];
      this._y = 0;

      // Some configurations
      this.maxArc      = 200; // maximum height of the bezier control point
      this.overlapDiff = 40;  // Difference on overlaps and minimum height for self-refernces
      this.arcDiff     = 15;
      this.anchorDiff  = 8;
      this.anchorStart = 15;
      this.tokenSep    = 30;
      this.xPadding    = 10;
      this.yPadding    = 5;

      // No snippet to process
      if (snippet == undefined || snippet == null)
        return this;

      // Parse the snippet
      var html = document.createElement("div");
      html.innerHTML = snippet;

      // Establish temporary parsing memory
      this.temp = {
        target : {}, // Remember the map id => pos        
        edges  : [], // Remember edge definitions
        pos    : 0   // Keep track of the current token position
      };

      // Start parsing from root
      this._parse(0, html.childNodes, undefined);

      // Establish edge list
      var targetMap = this.temp['target'];
      var edges = this.temp['edges'];

      // Iterate over edge lists
      // TODO:
      //   Support spans for anchors!
      for (var i in edges) {
        var edge = edges[i];

        // Check the target identifier
        var targetID = edge.targetID;
        var target = targetMap[targetID];

        if (target != undefined) {

          // Check if the source is a span anchor
          /*
          var start = edge.srcStart;
          if (start !== edge.srcEnd) {
            start = [start, edge.srcEnd];
          };
          */
          
          // Add relation
          var relation = {
            start : [edge.srcStart, edge.srcEnd],
            end : target,
            direction : 'uni',
            label : edge.label
          };
          // console.log(relation);
          this.addRel(relation);
        };
      };

      // Reset parsing memory
      this.temp = {};

      return this;
    },

    // Parse a node of the tree snippet
    _parse : function (parent, children, mark) {

      // Iterate over all child nodes
      for (var i in children) {
        var c = children[i];

        // Element node
        if (c.nodeType == 1) {

          var xmlid, target;

          // Node is an identifier
          if (c.hasAttribute('xml:id')) {

            // Remember that pos has this identifier
            xmlid = c.getAttribute('xml:id');
            this.temp['target'][xmlid] = [this.temp['pos'], this.temp['pos']];
          }

          // Node is a relation
          else if (c.hasAttribute('xlink:href')) {
            var label;

            // Get target id
            target = c.getAttribute('xlink:href').replace(/^#/, "");

            if (c.hasAttribute('xlink:title')) {
              label = this._clean(c.getAttribute('xlink:title'));
            };

            // Remember the defined edge
            var edge = {
              label    : label,
              srcStart : this.temp['pos'],
              targetID : target
            };
            this.temp['edges'].push(edge);
          };

          // Go on with child nodes
          if (c.hasChildNodes()) {
            this._parse(0, c.childNodes, mark);
          };

          if (xmlid !== undefined) {
            this.temp['target'][xmlid][1] = this.temp['pos'] -1;

            /*
            console.log('Target ' + xmlid + ' spans from ' +
                        this.temp['target'][xmlid][0] +
                        ' to ' +
                        this.temp['target'][xmlid][1]
                       );
            */
            xmlid = undefined;
          }
          else if (target !== undefined) {
            edge["srcEnd"] = this.temp['pos'] -1;

            /*
            console.log('Source spans from ' +
                        edge["srcStart"] +
                        ' to ' +
                        edge["srcEnd"]
                       );
            */
            target = undefined;
          };
        }

        // Text node
        else if (c.nodeType == 3) {

          // Check, if there is a non-whitespace token
          if (c.nodeValue !== undefined) {
            var str = c.nodeValue.trim();
            if (str !== undefined && str.length > 0) {

              // Add token to token list
              this.addToken(str);

              // Move token position
              this.temp['pos']++;
            };
          };
        }
      };
    },

    
    // Remove foundry and layer for labels
    _clean : function (title) {
      return title.replace(_TermRE, "$3");
    },

    
    // Return the number of leaf nodes
    // (not necessarily part of a relation).
    // Consecutive nodes that are not part of any
    // relation are summarized in one node.
    size : function () {
      return this._tokens.length;
    },

    
    // This is a shorthand for SVG element creation
    _c : function (tag) {
      return document.createElementNS(svgNS, tag);
    },

    // Get bounding box - with workaround for text nodes
    _rect : function (node) {
      if (node.tagName == "tspan") {
        var range = document.createRange();
        range.selectNode(node);
        var rect = range.getBoundingClientRect();
        range.detach();
        return rect;
      };
      return node.getBoundingClientRect();
    },

    // Returns the center point of the requesting token
    _tokenPoint : function (node) {
      var box = this._rect(node);
      return box.x + (box.width / 2);
    },


    // Draws an anchor
    _drawAnchor : function (anchor) {

      // Calculate the span of the first and last token, the anchor spans
      var firstBox = this._rect(this._tokenElements[anchor.first]);
      var lastBox  = this._rect(this._tokenElements[anchor.last]);

      var startPos = firstBox.left - this.offsetLeft;
      var endPos   = lastBox.right - this.offsetLeft;
      
      var y = this._y + (anchor.overlaps * this.anchorDiff) - this.anchorStart;

      var l = this._c('path');
      this._arcsElement.appendChild(l);
      l.setAttribute("d", "M " + startPos + "," + y + " L " + endPos + "," + y);
      l.setAttribute("class", "anchor");
      anchor.element = l;
      anchor.y = y;
      return l;
    },
    

    // Create an arc with an optional label
    // Potentially needs a height parameter for stacks
    _drawArc : function (arc) {

      var startPos, endPos;
      var startY = this._y;
      var endY = this._y;

      if (arc.startAnchor !== undefined) {
        startPos = this._tokenPoint(arc.startAnchor.element);
        startY = arc.startAnchor.y;
      }
      else {
        startPos = this._tokenPoint(this._tokenElements[arc.first]);
      };

      if (arc.endAnchor !== undefined) {
        endPos = this._tokenPoint(arc.endAnchor.element)
        endY = arc.endAnchor.y;
      }
      else {
        endPos = this._tokenPoint(this._tokenElements[arc.last]);
      };

      startPos -= this.offsetLeft;
      endPos -= this.offsetLeft;

      // Special treatment for self-references
      var overlaps = arc.overlaps;
      if (startPos == endPos) {
        startPos -= this.overlapDiff / 3;
        endPos   += this.overlapDiff / 3;
        overlaps += .5;
      };

      var g = this._c("g");
      g.setAttribute("class", "arc");
      var p = g.appendChild(this._c("path"));
      p.setAttribute('class', 'edge');
      
      // Attach the new arc before drawing, so computed values are available
      this._arcsElement.appendChild(g);

      // Create arc
      var middle = Math.abs(endPos - startPos) / 2;

      // TODO:
      //   take the number of tokens into account!
      var cHeight = this.arcDiff + (overlaps * this.overlapDiff) + (middle / 2);

      // Respect the maximum height
      cHeight = cHeight < this.maxArc ? cHeight : this.maxArc;

      var x = Math.min(startPos, endPos);

      //var controlY = (startY + endY - cHeight);
      var controlY = (endY - cHeight);
      
      var arcE = "M "+ startPos + "," + startY +
          " C " + startPos + "," + controlY +
          " " + endPos + "," + controlY +
          " " + endPos + "," + endY;

      p.setAttribute("d", arcE);

      if (arc.direction !== undefined) {
        p.setAttribute("marker-end", "url(#arr)");
        if (arc.direction === 'bi') {
          p.setAttribute("marker-start", "url(#arr)");
        };
      };

      if (arc.label === undefined)
        return g;
      
      /*
       * Calculate the top point of the arc for labeling using
       * de Casteljau's algorithm, see e.g.
       * http://blog.sklambert.com/finding-the-control-points-of-a-bezier-curve/
       * of course simplified to symmetric arcs ...
       */
      // Interpolate one side of the control polygon
      var middleY = (((startY + controlY) / 2) + controlY) / 2;

      // Create a boxed label
      g = this._c("g");
      g.setAttribute("class", "label");
      this._labelsElement.appendChild(g);

      var that = this;
      g.addEventListener('mouseenter', function () {
        that._labelsElement.appendChild(this);
      });

      var labelE = g.appendChild(this._c("text"));
      labelE.setAttribute("x", x + middle);
      labelE.setAttribute("y", middleY + 3);
      labelE.setAttribute("text-anchor", "middle");
      var textNode = document.createTextNode(arc.label);
      labelE.appendChild(textNode);

      var labelBox   = labelE.getBBox();
      var textWidth  = labelBox.width; // labelE.getComputedTextLength();
      var textHeight = labelBox.height; // labelE.getComputedTextLength();

      // Add box with padding to left and right
      var labelR = g.insertBefore(this._c("rect"), labelE);
      var boxWidth = textWidth + 2 * this.xPadding;
      labelR.setAttribute("x", x + middle - (boxWidth / 2));
      labelR.setAttribute("ry", 5);
      labelR.setAttribute("y", labelBox.y - this.yPadding);
      labelR.setAttribute("width", boxWidth);
      labelR.setAttribute("height", textHeight + 2 * this.yPadding);
    },

    // Get the svg element
    element : function () {
      if (this._element !== undefined)
        return this._element;

      // Create svg
      var svg = this._c("svg");

      window.addEventListener("resize", function () {
        // TODO:
        //   Only if text-size changed!
        // TODO:
        //   This is currently untested
        this.show();
      }.bind(this));

      // Define marker arrows
      var defs = svg.appendChild(this._c("defs"));
      var marker = defs.appendChild(this._c("marker"));
      marker.setAttribute("refX", 9);
      marker.setAttribute("id", "arr");
      marker.setAttribute("orient", "auto-start-reverse");
      marker.setAttribute("markerUnits","userSpaceOnUse");
      var arrow = this._c("path");
      arrow.setAttribute("transform", "scale(0.8)");
      arrow.setAttribute("d", "M 0,-5 0,5 10,0 Z");
      marker.appendChild(arrow);

      this._element = svg;
      return this._element;
    },

    // Add a relation with a start, an end,
    // a direction value and an optional label text
    addRel : function (rel) {
      this._arcs.push(rel);
      return this;
    },


    // Add a token to the list (this will mostly be a word)
    addToken : function(token) {
      this._tokens.push(token);
      return this;
    },
    
    /*
     * All arcs need to be sorted before shown,
     * to avoid nesting.
     */
    _sortArcs : function () {

      // TODO:
      //   Keep in mind that the arcs may have long anchors!
      //   1. Iterate over all arcs
      //   2. Sort all multi
      var anchors = {};
      
      // 1. Sort by length
      // 2. Tag all spans with the number of overlaps before
      //    a) Iterate over all spans
      //    b) check the latest preceeding overlapping span (lpos)
      //       -> not found: tag with 0
      //       -> found: Add +1 to the level of the (lpos)
      //    c) If the new tag is smaller than the previous element,
      //       reorder

      // Normalize start and end
      var sortedArcs = this._arcs.map(function (v) {

        // Check for long anchors
        if (v.start instanceof Array) {

          if (v.start[0] == v.start[1]) {
            v.start = v.start[0];
          }

          else {
          
            var middle = Math.ceil(Math.abs(v.start[1] - v.start[0]) / 2) + v.start[0];

            // Calculate signature to avoid multiple anchors
            var anchorSig = "#" + v.start[0] + "_" + v.start[1];
            if (v.start[0] > v.start[1]) {
              anchorSig = "#" + v.start[1] + "_" + v.start[0];
            };
            
            // Check if the anchor already exist
            var anchor = anchors[anchorSig];
            if (anchor === undefined) {
              anchor = {
                "first":   v.start[0],
                "last" :   v.start[1],
                "length" : v.start[1] - v.start[0]
              };
              anchors[anchorSig] = anchor;
              // anchors.push(v.startAnchor);
            };

            v.startAnchor = anchor;

            // Add to anchors list
            v.start = middle;
          };
        };

        if (v.end instanceof Array) {

          if (v.end[0] == v.end[1]) {
            v.end = v.end[0];
          }

          else {

            var middle = Math.abs(v.end[0] - v.end[1]) + v.end[0];

            // Calculate signature to avoid multiple anchors
            var anchorSig = "#" + v.end[0] + "_" + v.end[1];
            if (v.end[0] > v.end[1]) {
              anchorSig = "#" + v.end[1] + "_" + v.end[0];
            };

            // Check if the anchor already exist
            var anchor = anchors[anchorSig];
            if (anchor === undefined) {
              anchor = {
                "first":   v.end[0],
                "last" :   v.end[1],
                "length" : v.end[1] - v.end[0]
              };
              anchors[anchorSig] = anchor;
              // anchors.push(v.startAnchor);
            };
            
            v.endAnchor = anchor;

            // Add to anchors list
            // anchors.push(v.endAnchor);
            v.end = middle;
          };
        };

        v.first = v.start;
        v.last = v.end;

        // calculate the arch length
        if (v.start < v.end) {
          v.length = v.end - v.start;
        }
        else {
          // v.first = v.end;
          // v.last = v.start;
          v.length = v.start - v.end;
        };

        return v;
      });

      // Sort based on length
      sortedArcs.sort(function (a, b) {
        if (a.length < b.length)
          return -1;
        else
          return 1;
      });

      // Add sorted arcs and anchors
      this._sortedArcs    = lengthSort(sortedArcs, false);

      // Translate map to array (there is probably a better JS method)
      var sortedAnchors = [];
      for (var i in anchors) {
        sortedAnchors.push(anchors[i]);
      };
      this._sortedAnchors = lengthSort(sortedAnchors, true);
    },

    /**
     * Center the viewport of the canvas
     * TODO:
     *   This is identical to tree
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


    // Show the element
    show : function () {
      var svg = this._element;
      var height = this.maxArc;

      // Delete old group
      if (svg.getElementsByTagName("g")[0] !== undefined) {
        var group = svg.getElementsByTagName("g")[0];
        svg.removeChild(group);
        this._tokenElements = [];
      };

      var g = svg.appendChild(this._c("g"));

      // Draw token list
      var text = g.appendChild(this._c("text"));
      text.setAttribute('class', 'leaf');
      text.setAttribute("text-anchor", "start");
      text.setAttribute("y", height);

      // Calculate the start position
      this._y = height - (this.anchorStart);

      // Introduce some prepending whitespace (yeah - I know ...)
      var ws = text.appendChild(this._c("tspan"));
      ws.appendChild(document.createTextNode('\u00A0'));
      ws.style.textAnchor = "start";
      
      var lastRight = 0;
      for (var node_i in this._tokens) {
        // Append svg
        // var x = text.appendChild(this._c("text"));
        var tspan = text.appendChild(this._c("tspan"));
        tspan.appendChild(document.createTextNode(this._tokens[node_i]));
        tspan.setAttribute("text-anchor", "middle");
        
        this._tokenElements.push(tspan);

        // Add whitespace!
        tspan.setAttribute("dx", this.tokenSep);
      };

      // Get some global position data that may change on resize
      var globalBoundingBox = this._rect(g);
      this.offsetLeft = globalBoundingBox.left;

      // The group of arcs
      var arcs = g.appendChild(this._c("g"));
      this._arcsElement = arcs;
      arcs.classList.add("arcs");

      var labels = g.appendChild(this._c("g"));
      this._labelsElement = labels;
      labels.classList.add("labels");

      // Sort arcs if not sorted yet
      if (this._sortedArcs === undefined)
        this._sortArcs();

      // 1. Draw all anchors
      var i;
      for (i in this._sortedAnchors) {
        this._drawAnchor(this._sortedAnchors[i]);
      };

      // 2. Draw all arcs
      for (i in this._sortedArcs) {
        this._drawArc(this._sortedArcs[i]);
      };

      // Resize the svg with some reasonable margins
      var width = this._rect(text).width;
      svg.setAttribute("width", width + 20);
      svg.setAttribute("height", height + 20);
      svg.setAttribute("class", "relTree");
    }
  };

  // Sort relations regarding their span
  function lengthSort (list, inclusive) {

    /*
     * The "inclusive" flag allows to
     * modify the behaviour for inclusivity check,
     * e.g. if identical start or endpoints mean overlap or not.
     */
    
    var stack = [];

    // Iterate over all definitions
    for (var i = 0; i < list.length; i++) {
      var current = list[i];

      // Check the stack order
      var overlaps = 0;
      for (var j = (stack.length - 1); j >= 0; j--) {
        var check = stack[j];

        // (a..(b..b)..a)
        if (current.first <= check.first && current.last >= check.last) {
          overlaps = check.overlaps + 1;
          break;
        }

        // (a..(b..a)..b)
        else if (current.first <= check.first && current.last >= check.first) {

          if (inclusive || (current.first != check.first && current.last != check.first)) {
            overlaps = check.overlaps + (current.length == check.length ? 0 : 1);
          };
        }
        
        // (b..(a..b)..a)
        else if (current.first <= check.last && current.last >= check.last) {

          if (inclusive || (current.first != check.last && current.last != check.last)) {
            overlaps = check.overlaps + (current.length == check.length ? 0 : 1);
          };
        };
      };

      // Set overlaps
      current.overlaps = overlaps;

      stack.push(current);

      // Although it is already sorted,
      // the new item has to be put at the correct place
      // TODO:
      //   Use something like splice() instead
      stack.sort(function (a,b) {
        b.overlaps - a.overlaps
      });
    };

    return stack;
  };
});
