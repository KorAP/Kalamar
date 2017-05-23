define(function () {
  "use strict";

  var svgNS = "http://www.w3.org/2000/svg";

  return {
    create : function (snippet) {
      var obj = Object.create(this)._init(snippet);
      obj._tokens = [];
      obj._arcs = []
      obj._tokenElements = [];
      obj._y = 0;

      // Some configurations
      obj.maxArc = 200; // maximum height of the bezier control point
      obj.overlapDiff = 20;
      obj.arcDiff = 15;
      obj.anchorDiff = 6;
      obj.anchorStart = 15;
      obj.tokenSep = 30;
      return obj;
    },
    
    _init : function (snippet) {
      /*
      var html = document.createElement("div");
      html.innerHTML = snippet;
      */
      return this;
    },

    // This is a shorthand for SVG element creation
    _c : function (tag) {
      return document.createElementNS(svgNS, tag);
    },

    // Returns the center point of the requesting token
    _tokenPoint : function (node) {
      var box = node.getBoundingClientRect();
      return box.x + (box.width / 2);
    },

    _drawAnchor : function (anchor) {
      var firstBox = this._tokenElements[anchor.first].getBoundingClientRect();
      var lastBox = this._tokenElements[anchor.last].getBoundingClientRect();

      var startPos = firstBox.left;
      var endPos = lastBox.right;

      var y = this._y + (anchor.overlaps * this.anchorDiff) - this.anchorStart;

      var l = this._c('path');
      l.setAttribute("d", "M " + startPos + "," + y + " L " + endPos + "," + y);
      l.setAttribute("class", "anchor");
      anchor.element = l;
      anchor.y = y;
      return l;
    },
    
    // Create an arc with a label
    // Potentially needs a height parameter for stacks
    _drawArc : function (arc) {

      var startPos, endPos;
      var startY = this._y, endY = this._y;

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

      var g = this._c("g");
      var p = g.appendChild(this._c("path"));

      // Create arc
      var middle = Math.abs(endPos - startPos) / 2;

      // TODO: take the number of tokens into account!
      var cHeight = this.arcDiff + arc.overlaps * this.overlapDiff + (middle / 2);

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

      /*
       * Calculate the top point of the arc for labeling using
       * de Casteljau's algorithm, see e.g.
       * http://blog.sklambert.com/finding-the-control-points-of-a-bezier-curve/
       * of course simplified to symmetric arcs ...
       */
      // Interpolate one side of the control polygon
      // var controlInterpY1 = (startY + controlY) / 2;
      // var controlInterpY2 = (controlInterpY1 + controlY) / 2;
      var middleY = (((startY + controlY) / 2) + controlY) / 2;

      // WARNING!
      // This won't respect span anchors, adjusting startY and endY!

      if (arc.label !== undefined) {
        var labelE = g.appendChild(this._c("text"));
        labelE.setAttribute("x", x + middle);
        labelE.setAttribute("y", middleY + 3);
        labelE.setAttribute("text-anchor", "middle");
        labelE.appendChild(document.createTextNode(arc.label));
      };
      return g;
    },

    element : function () {
      if (this._element !== undefined)
        return this._element;

      // Create svg
      var svg = this._c("svg");

      window.addEventListener("resize", function () {
        // TODO: Only if text-size changed!
        this.show();
      }.bind(this));
      
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
    // a direction value and a label text
    addRel : function (rel) {
      this._arcs.push(rel);
      return this;
    },


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
      var anchors = [];
      
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
          var middle = Math.ceil(Math.abs(v.start[1] - v.start[0]) / 2) + v.start[0];

          v.startAnchor = {
            "first":   v.start[0],
            "last" :   v.start[1],
            "length" : v.start[1] - v.start[0]
          };

          // Add to anchors list
          anchors.push(v.startAnchor);
          v.start = middle;
        };

        if (v.end instanceof Array) {
          var middle = Math.abs(v.end[0] - v.end[1]) + v.end[0];
          v.endAnchor = {
            "first":   v.end[0],
            "last" :   v.end[1],
            "length" : v.end[1] - v.end[0]
          };

          // Add to anchors list
          anchors.push(v.endAnchor);
          v.end = middle;
        };

        // calculate the arch length
        if (v.start < v.end) {
          v.first = v.start;
          v.last = v.end;
          v.length = v.end - v.start;
        }
        else {
          v.first = v.end;
          v.last = v.start;
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

      this._sortedArcs    = lengthSort(sortedArcs, false);
      this._sortedAnchors = lengthSort(anchors, true);
    },
    
    show : function () {
      var svg = this._element;
      var height = this.maxArc;

      /*
      svg.setAttribute("width", 700);
      svg.setAttribute("height", 300);
      */

      // Delete old group
      if (svg.getElementsByTagName("g")[0] !== undefined) {
        var group = svg.getElementsByTagName("g")[0];
        svg.removeChild(group);
        this._tokenElements = [];
      };

      var g = svg.appendChild(this._c("g"));

      /*
       * Generate token list
       */
      var text = g.appendChild(this._c("text"));
      text.setAttribute("text-anchor", "start");
      text.setAttribute("y", height);

      this._y = height - (this.anchorStart);

      var ws = text.appendChild(this._c("tspan"));
      ws.appendChild(document.createTextNode('\u00A0'));
      ws.style.textAnchor = "start";
      
      var lastRight = 0;
      for (var node_i in this._tokens) {
        // Append svg
        var tspan = text.appendChild(this._c("tspan"));
        tspan.appendChild(document.createTextNode(this._tokens[node_i]));
        tspan.setAttribute("text-anchor", "middle");
        
        this._tokenElements.push(tspan);

        // Add whitespace!
        //var ws = text.appendChild(this._c("tspan"));
        //ws.appendChild(document.createTextNode(" "));
        // ws.setAttribute("class", "rel-ws");
        tspan.setAttribute("dx", this.tokenSep);
      };

      var arcs = g.appendChild(this._c("g"));
      arcs.classList.add("arcs");

      /*
      var textBox = text.getBoundingClientRect();

      arcs.setAttribute(
        "transform",
        "translate(0," + textBox.y +")"
      );
      */
      
      /*
       * TODO:
       * Before creating the arcs, the height of the arc
       * needs to be calculated to make it possible to "stack" arcs.
       * That means, the arcs need to be presorted, so massively
       * overlapping arcs are taken first.
       * On the other hand, anchors need to be sorted as well
       * in the same way.
       */
      if (this._sortedArcs === undefined) {
        this._sortArcs();
      };

      var i;
      for (i in this._sortedAnchors) {
        arcs.appendChild(this._drawAnchor(this._sortedAnchors[i]));
      };
      
      for (i in this._sortedArcs) {
        arcs.appendChild(this._drawArc(this._sortedArcs[i]));
      };

      var width = text.getBoundingClientRect().width;
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);
      svg.setAttribute("class", "relTree");

      // svg.setAttribute("viewbox", "0 0 500 200");
      /*
        console.log(size.width);
        console.log(size.height);
      */
    }
  };

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
      // TODO: Use something like splice() instead
      stack.sort(function (a,b) {
        b.overlaps - a.overlaps
      });
    };

    return stack;
  };
});
