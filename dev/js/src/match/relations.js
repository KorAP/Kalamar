define(function () {
  "use strict";

  var svgNS = "http://www.w3.org/2000/svg";

  return {
    create : function (snippet) {
      var obj = Object.create(this)._init(snippet);
      obj._tokens = ["Das", "ist", "ja", "toll"];
      obj._tokenElements = [];
      obj._arcs = [
        { start: 1, end: 3, label: "small" },
        { start: 3, end: 0, label: "large" }
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
    _createArc : function (start, end, label) {

      var startPos = this._tokenPoint(this._tokenElements[start]);
      var endPos = this._tokenPoint(this._tokenElements[end]);

      var y = 0;
      var g = this._c("g");
      var p = g.appendChild(this._c("path"));

      // Create arc
      var middle = Math.abs(endPos - startPos) / 2;

      var cHeight = middle < this.maxArc ? middle : this.maxArc;

      var x = Math.min(startPos, endPos);
      
      var arc = "M "+ startPos + " " + y +
          " C " + startPos + " " + (y-cHeight) +
          " " + endPos + " " + (y-cHeight) +
          " " + endPos + " " + y;
      p.setAttribute("d", arc);

      if (label !== undefined) {
        var labelE = g.appendChild(this._c("text"));
        labelE.setAttribute("x", x + middle);
        labelE.setAttribute("y", -1 * cHeight + 10);
        labelE.setAttribute("text-anchor", "middle");
        labelE.appendChild(document.createTextNode(label));
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
    addArc : function (start, end, direction, label) {
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
      for (var i in this._arcs) {
        var arc = this._arcs[i];
        this.arcs.appendChild(this._createArc(arc.start, arc.end, arc.label));
      };
    }
  }
});
