define(function () {
  "use strict";

  var svgNS = "http://www.w3.org/2000/svg";

  return {
    create : function (snippet) {
      var obj = Object.create(this)._init(snippet);
      obj._tokens = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
      obj._tokenElements = [];
      obj._arcs = [
        { start: 0, end: 1, label: "a" },
        { start: 0, end: 1, label: "b" },
        { start: 1, end: 2, label: "c" },
        { start: 0, end: 2, label: "d" },
        { start: 1, end: 5, label: "e" },
        { start: 4, end: 8, label: "f" },
        { start: 6, end: 7, label: "g" },
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

    // Create an arc with a label
    // Potentially needs a height parameter for stacks
    _drawArc : function (arc) {

      var startPos = this._tokenPoint(this._tokenElements[arc.first]);
      var endPos = this._tokenPoint(this._tokenElements[arc.last]);

      var y = 0;
      var g = this._c("g");
      var p = g.appendChild(this._c("path"));

      // Create arc
      var middle = Math.abs(endPos - startPos) / 2;

      // var cHeight = middle < this.maxArc ? middle : this.maxArc;
      // TODO: take the number of tokens into account!
      var cHeight = 10 + arc.overlaps * 12 + (middle / 2);

      var x = Math.min(startPos, endPos);
      
      var arcE = "M "+ startPos + " " + y +
          " C " + startPos + " " + (y-cHeight) +
          " " + endPos + " " + (y-cHeight) +
          " " + endPos + " " + y;
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

      var arcStack = [];

      // Iterate over all arc definitions
      for (var i = 0; i < sortedArcs.length; i++) {
        var currentArc = sortedArcs[i];

        // Check the stack order
        var overlaps = 0;

        for (var j = (arcStack.length - 1); j >= 0; j--) {
          var checkArc = arcStack[j];

          // (a..(b..b)..a)
          if (currentArc.first <= checkArc.first && currentArc.last >= checkArc.last) {
            overlaps = checkArc.overlaps + 1;
            break;
          }

          // (a..(b..a)..b)
          else if (currentArc.first < checkArc.first && currentArc.last > checkArc.first) {
            overlaps = checkArc.overlaps + (currentArc.length == checkArc.length ? 0 : 1);
          }

          // (b..(a..b)..a)
          else if (currentArc.first < checkArc.last && currentArc.last > checkArc.last) {
            overlaps = checkArc.overlaps + (currentArc.length == checkArc.length ? 0 : 1);
          };
        };

        // Set overlaps
        currentArc.overlaps = overlaps;

        arcStack.push(currentArc);

        // Although it is already sorted,
        // the new item has to be put at the correct place
        // TODO: Use something like splice() instead
        arcStack.sort(function (a,b) {
          b.overlaps - a.overlaps
        });
      };

      return arcStack;
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
       */
      var sortedArcs = this._sortArcs();
      for (var i in sortedArcs) {
        this.arcs.appendChild(this._drawArc(sortedArcs[i]));
      };
    }
  }
});
