define(function () {
  "use strict";

  var svgNS = "http://www.w3.org/2000/svg";

  return {
    create : function (snippet) {
      var obj = Object.create(this)._init(snippet);
      obj._tokens = ["Der", "alte", "Mann", "ging", "über", "die", "breite", "nasse", "Straße"];
      obj._tokenElements = [];
      obj._arcs = [


        /*
         * Start and end may be spans, i.e. arrays
         */
        { start: 0, end: 1, label: "a" },
        { start: 0, end: 1, label: "b" },
        { start: 1, end: 2, label: "c" },
        { start: 0, end: 2, label: "d" },
        { start: [2,4], end: 5, label: "e" },
        { start: 4, end: [6,8], label: "f" },
        { start: [5,6], end: 7, label: "g" },
      ]
      obj.maxArc = 200; // maximum height of the bezier control point
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
      var startPos = this._tokenElements[anchor.first].getBoundingClientRect().left;
      var endPos = this._tokenElements[anchor.last].getBoundingClientRect().right;

      var y = (anchor.overlaps * -5) - 10;
      var l = this._c('path');
      l.setAttribute("d", "M " + startPos + " " + y + " L " + endPos + " " + y);
      l.setAttribute("class", "anchor");
      anchor.element = l;
      anchor.y = y;
      return l;
    },
    
    // Create an arc with a label
    // Potentially needs a height parameter for stacks
    _drawArc : function (arc) {

      var startPos, endPos;
      var startY = 0, endY = 0;

      if (arc.startAnchor !== undefined) {
        startPos = this._tokenPoint(arc.startAnchor.element)
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

      // var cHeight = middle < this.maxArc ? middle : this.maxArc;
      // TODO: take the number of tokens into account!
      var cHeight = 10 + arc.overlaps * 12 + (middle / 2);

      var x = Math.min(startPos, endPos);
      
      var arcE = "M "+ startPos + " " + startY +
          " C " + startPos + " " + (startY + endY - cHeight) +
          " " + endPos + " " + (startY + endY - cHeight) +
          " " + endPos + " " + endY;

      p.setAttribute("d", arcE);

      if (arc.label !== undefined) {
        var labelE = g.appendChild(this._c("text"));
        labelE.setAttribute("x", x + middle);
        labelE.setAttribute("y", -1 * cHeight);
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
      svg.setAttribute("width", 700);
      svg.setAttribute("height", 300);
      this._element = svg;
      return this._element;
    },

    // Add a relation with a start, an end,
    // a direction value and a label text
    addArc : function (arc) {
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
            "first": v.start[0],
            "last" : v.start[1],
            "length" : v.start[1] - v.start[0]
          };

          // Add to anchors list
          anchors.push(v.startAnchor);
          v.start = middle;
        };

        if (v.end instanceof Array) {
          var middle = Math.abs(v.end[0] - v.end[1]) + v.end[0];
          v.endAnchor = {
            "first": v.end[0],
            "last" : v.end[1],
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

      this._sortedArcs = lengthSort(sortedArcs, false);

      this._sortedAnchors = lengthSort(anchors, true);
    },
    
    show : function () {
      var svg = this._element;

      /*
       * Generate token list
       */
      var text = svg.appendChild(this._c("text"));
      text.setAttribute("y", 135);
      text.setAttribute("x", 160);

      var lastRight = 0;
      for (var node_i in this._tokens) {
        // Append svg
        var tspan = text.appendChild(this._c("tspan"));
        tspan.appendChild(document.createTextNode(this._tokens[node_i]));

        this._tokenElements.push(tspan);

        // Add whitespace!
        text.appendChild(document.createTextNode(" "));
      };

      this.arcs = svg.appendChild(this._c("g"));
      this.arcs.classList.add("arcs");

      var textBox = text.getBoundingClientRect();

      this.arcs.setAttribute(
        "transform",
        "translate(0," + textBox.y +")"
      );
      
      /*
       * TODO:
       * Before creating the arcs, the height of the arc
       * needs to be calculated to make it possible to "stack" arcs.
       * That means, the arcs need to be presorted, so massively
       * overlapping arcs are taken first.
       * On the other hand, anchors need to be sorted as well
       * in the same way.
       */
      this._sortArcs();

      var i;
      for (i in this._sortedAnchors) {
        this.arcs.appendChild(this._drawAnchor(this._sortedAnchors[i]));
      };
      
      for (i in this._sortedArcs) {
        this.arcs.appendChild(this._drawArc(this._sortedArcs[i]));
      };
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
