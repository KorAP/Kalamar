/**
 * Parse a relational tree and visualize using arcs.
 *
 * @author Nils Diewald
 */
"use strict";

define([], function () {

  const svgNS = "http://www.w3.org/2000/svg";
  const _TermRE = new RegExp("^(?:([^\/]+?)\/)?([^:]+?):(.+?)$");
  const d = document;

  return {
    create : function (snippet) {
      return Object.create(this)._init(snippet);
    },

    // Initialize the state of the object
    _init : function (snippet) {

      const t = this;

      // Predefine some values
      t._tokens  = [];
      t._arcs    = [];
      t._tokenElements = [];
      t._y = 0;
      t._currentInFocus = undefined;

      // Some configurations
      t.maxArc      = 200; // maximum height of the bezier control point
      t.overlapDiff = 40;  // Difference on overlaps and minimum height for self-refernces
      t.arcDiff     = 15;
      t.anchorDiff  = 8;
      t.anchorStart = 15;
      t.tokenSep    = 30;
      t.xPadding    = 10;
      t.yPadding    = 5;

      // No snippet to process
      if (snippet == undefined || snippet == null)
        return t;

      // Parse the snippet
      const html = d.createElement("div");
      html.innerHTML = snippet;

      // Establish temporary parsing memory
      t.temp = {
        target : {}, // Remember the map id => pos        
        edges  : [], // Remember edge definitions
        pos    : 0   // Keep track of the current token position
      };

      // Start parsing from root
      t._parse(0, html.childNodes, undefined);

      // Establish edge list
      const targetMap = t.temp['target'];
      const edges = t.temp['edges'];

      let targetID, target, relation;
      
      // Iterate over edge lists
      // TODO:
      //   Support spans for anchors!
      edges.forEach(function(edge) {

        // Check the target identifier
        targetID = edge.targetID;
        target = targetMap[targetID];

        if (target != undefined) {

          // Check if the source is a span anchor
          /*
          var start = edge.srcStart;
          if (start !== edge.srcEnd) {
            start = [start, edge.srcEnd];
          };
          */
          
          // Add relation
          relation = {
            start : [edge.srcStart, edge.srcEnd],
            end : target,
            direction : 'uni',
            label : edge.label
          };
          // console.log(relation);
          this.addRel(relation);
        };
      }, t);

      // Reset parsing memory
      delete t["temp"];

      return this;
    },

    // Parse a node of the tree snippet
    _parse : function (parent, children, mark) {

      // Iterate over all child nodes
      Array.from(children).forEach(function(c) {

        // Element node
        if (c.nodeType == 1) {

          let xmlid, target, start, end;

          // Node is an identifier
          if (c.hasAttribute('xml:id')) {

            // Remember that pos has this identifier
            xmlid = c.getAttribute('xml:id');
            // this.temp['target'][xmlid] =
            start = this.temp['pos'];
            end = this.temp['pos'];
          }

          // Node is a link
          // Stricter: && c.hasAttribute('xlink:show')
          else if (c.hasAttribute('xlink:href')) {

            // Node is a continuation
            if (c.getAttribute('xlink:show') == "other" &&
                c.hasAttribute('data-action') &&
                c.getAttribute('data-action') == "join"
               ) {
              xmlid = c.getAttribute('xlink:href').replace(/^#/, "");
              start = this.temp['pos'];
              end = this.temp['pos'];

              // this.temp['target'][xmlid][1] = this.temp['pos'] -1;
              // console.log("Here");
            }

            // Node is a relation
            // Stricter: c.getAttribute('xlink:show') == "none"
            else {
              let label;

              // Get target id
              target = c.getAttribute('xlink:href').replace(/^#/, "");

              if (c.hasAttribute('xlink:title')) {
                label = this._clean(c.getAttribute('xlink:title'));
              };

              // Remember the defined edge
// WRONG!
              var edge = {
                label    : label,
                srcStart : this.temp['pos'],
                targetID : target
              };

              // TEMP: Hot-fix for root relations
              if (!label.match(/--$/) && !label.match(/ROOT$/)) {
                this.temp['edges'].push(edge);
              };

            };
          };

          // Go on with child nodes
          if (c.hasChildNodes()) {
            this._parse(0, c.childNodes, mark);
          };


          // The element is a defined anchor
          if (xmlid !== undefined) {

            // this.temp['target'][xmlid][1] = this.temp['pos'] -1;

            // Element already defined
            if (this.temp['target'][xmlid] !== undefined) {
              const newtarget = this.temp['target'][xmlid];
              end = this.temp['pos'] - 1;
              newtarget[0] = start < newtarget[0] ? start : newtarget[0];
              newtarget[1] = end > newtarget[1] ? end : newtarget[1];
            }

            // Element not yet defined
            else {
              end = this.temp['pos'] - 1;
              this.temp['target'][xmlid] = [start, end];
            };

            /*
            console.log('Target ' + xmlid + ' spans from ' +
                        this.temp['target'][xmlid][0] +
                        ' to ' +
                        this.temp['target'][xmlid][1]
                       );
            */
            xmlid = undefined;
          }

          // Current element describes an arc
          else if (target !== undefined) {

            // TODO: This does not work yet!
            edge["srcEnd"] = this.temp['pos'] -1;
            // console.log('Here');

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

            const str = c.nodeValue.trim();

            if (str !== undefined && str.length > 0) {

              // Add token to token list
              this.addToken(str);

              // Move token position
              this.temp['pos']++;
            };
          };
        };
      }, this);

      // Todo: define edges here!
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
      return d.createElementNS(svgNS, tag);
    },


    // Get bounding box - with workaround for text nodes
    _rect : function (node) {
      if (node.tagName == "tspan" && !navigator.userAgent.match(/Edge/)) {
        const range = d.createRange();
        range.selectNode(node);
        const rect = range.getBoundingClientRect();
        range.detach();
        return rect;
      };
      return node.getBoundingClientRect();
    },


    // Returns the center point of the requesting token
    _tokenPoint : function (node) {
	    const box = this._rect(node);
	    return box.left + (box.width / 2);
    },


    // Draws an anchor
    _drawAnchor : function (anchor) {

      // Calculate the span of the first and last token, the anchor spans
      const firstBox = this._rect(this._tokenElements[anchor.first]);
      const lastBox  = this._rect(this._tokenElements[anchor.last]);
	
      const y = this._y + (anchor.overlaps * this.anchorDiff) - this.anchorStart;
      const l = this._c('path');
      
	    this._arcsElement.appendChild(l);

      const pathStr = "M " +
          (firstBox.left - this.offsetLeft) +
          "," +
          y +
          " L " +
          (lastBox.right - this.offsetLeft) +
          "," + y;

      l.setAttribute("d", pathStr);
      l.setAttribute("class", "anchor");
      anchor.element = l;
      anchor.y = y;
      return l;
    },
    

    // Create an arc with an optional label
    // Potentially needs a height parameter for stacks
    _drawArc : function (arc) {

      const t = this;
      let startPos, endPos;
      let startY = this._y;
      let endY = this._y;
	
      if (arc.startAnchor !== undefined) {
        startPos = t._tokenPoint(arc.startAnchor.element);
        startY = arc.startAnchor.y;
      }
      else {
        startPos = t._tokenPoint(t._tokenElements[arc.first]);
      };

      if (arc.endAnchor !== undefined) {
        endPos = t._tokenPoint(arc.endAnchor.element)
        endY = arc.endAnchor.y;
      }
      else {
        endPos = t._tokenPoint(t._tokenElements[arc.last]);
      };

      startPos -= t.offsetLeft;
      endPos -= t.offsetLeft;

	    // Special treatment for self-references
      var overlaps = arc.overlaps;
      if (startPos == endPos) {
        startPos -= t.overlapDiff / 3;
        endPos   += t.overlapDiff / 3;
        overlaps += .5;
      };

      const g = t._c("g");
      g.setAttribute("class", "arc");
      const p = g.appendChild(t._c("path"));
      p.setAttribute('class', 'edge');
      
      // Attach the new arc before drawing, so computed values are available
      t._arcsElement.appendChild(g);

      // Create arc
      let middle = Math.abs(endPos - startPos) / 2;

      // TODO:
      //   take the number of tokens into account!
      let cHeight = t.arcDiff + (overlaps * t.overlapDiff) + (middle / 2);

      // Respect the maximum height
      cHeight = cHeight < t.maxArc ? cHeight : t.maxArc;

      var x = Math.min(startPos, endPos);

      //var controlY = (startY + endY - cHeight);
      let controlY = (endY - cHeight);
      
      const arcE = "M "+ startPos + "," + startY +
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
      let middleY = (((startY + controlY) / 2) + controlY) / 2;

      // Create a boxed label
      const label = this._c("g");
      label.setAttribute("class", "label");
      t._labelsElement.appendChild(label);

      // Set arc reference
      label.arcRef = g;

      const that = t;
      label.addEventListener('mouseenter', function () {
        that.inFocus(this);
      });

      const labelE = label.appendChild(t._c("text"));
      labelE.setAttribute("x", x + middle);
      labelE.setAttribute("y", middleY + 3);
      labelE.setAttribute("text-anchor", "middle");
      const textNode = d.createTextNode(arc.label);
      labelE.appendChild(textNode);

      const labelBox   = labelE.getBBox();

      /*
      if (!labelBox)
        console.log("----");
      */
      
      const textWidth  = labelBox.width; // labelE.getComputedTextLength();
      const textHeight = labelBox.height; // labelE.getComputedTextLength();

      // Add box with padding to left and right
      const labelR = label.insertBefore(t._c("rect"), labelE);
      const boxWidth = textWidth + 2 * t.xPadding;
      labelR.setAttribute("x", x + middle - (boxWidth / 2));
      labelR.setAttribute("ry", 5);
      labelR.setAttribute("y", labelBox.y - t.yPadding);
      labelR.setAttribute("width", boxWidth);
      labelR.setAttribute("height", textHeight + 2 * t.yPadding);
    },


    /**
     * Get the svg element
     */
    element : function () {
      if (this._element !== undefined)
        return this._element;

      // Create svg
      const svg = this._c("svg");

      window.addEventListener("resize", function () {
        // TODO:
        //   Only if text-size changed!
        // TODO:
        //   This is currently untested
        this.show();
      }.bind(this));

      // Define marker arrows
      const defs = svg.appendChild(this._c("defs"));
      const marker = defs.appendChild(this._c("marker"));
      marker.setAttribute("refX", 9);
      marker.setAttribute("id", "arr");
      marker.setAttribute("orient", "auto-start-reverse");
      marker.setAttribute("markerUnits","userSpaceOnUse");

      const arrow = this._c("path");
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


    // Move label and arc in focus
    inFocus : function (element) {
      let cif;

      if (this._currentInFocus) {

        // Already in focus
        if (this._currentInFocus === element)
          return;

        cif = this._currentInFocus;
        cif.classList.remove('infocus');
        cif.arcRef.classList.remove('infocus');
      };

      cif = this._currentInFocus = element;
      this._labelsElement.appendChild(cif);
      this._arcsElement.appendChild(cif.arcRef);
      cif.classList.add('infocus');
      cif.arcRef.classList.add('infocus');
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
      let anchors = {};
      
      // 1. Sort by length
      // 2. Tag all spans with the number of overlaps before
      //    a) Iterate over all spans
      //    b) check the latest preceeding overlapping span (lpos)
      //       -> not found: tag with 0
      //       -> found: Add +1 to the level of the (lpos)
      //    c) If the new tag is smaller than the previous element,
      //       reorder

      // Normalize start and end
      const sortedArcs = this._arcs.map(function (v) {

        // Check for long anchors
        if (v.start instanceof Array) {

          if (v.start[0] == v.start[1]) {
            v.start = v.start[0];
          }

          else {
          
            const middle = Math.ceil(Math.abs(v.start[1] - v.start[0]) / 2) + v.start[0];

            // Calculate signature to avoid multiple anchors
            let anchorSig = "#" + v.start[0] + "_" + v.start[1];

            // Reverse signature
            if (v.start[0] > v.start[1]) {
              anchorSig = "#" + v.start[1] + "_" + v.start[0];
            };
            
            // Check if the anchor already exist
            let anchor = anchors[anchorSig];
            if (anchor === undefined) {
              anchor = {
                "first":   v.start[0],
                "last" :   v.start[1],
                "length" : v.start[1] - v.start[0]
              };
              anchors[anchorSig] = anchor;
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

            const middle = Math.abs(v.end[0] - v.end[1]) + v.end[0];

            // Calculate signature to avoid multiple anchors
            let anchorSig = "#" + v.end[0] + "_" + v.end[1];

            // Reverse signature
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
            };
            
            v.endAnchor = anchor;

            // Add to anchors list
            v.end = middle;
          };
        };

        v.first = v.start;
        v.last  = v.end;

        // calculate the arch length
        if (v.start < v.end) {
          v.length = v.end - v.start;
        }

        else {
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
      this._sortedAnchors = lengthSort(Object.values(anchors), true);
    },


    /**
     * Center the viewport of the canvas
     * TODO:
     *   This is identical to treehierarchy
     */
    center : function () {
      if (this._element === undefined)
       return;

      const treeDiv = this._element.parentNode;

      const cWidth = parseFloat(window.getComputedStyle(this._element).width);
      const treeWidth = parseFloat(window.getComputedStyle(treeDiv).width);
      // Reposition:
      if (cWidth > treeWidth) {
       var scrollValue = (cWidth - treeWidth) / 2;
       treeDiv.scrollLeft = scrollValue;
      };
    },


    // Show the element
    show : function () {
      const t = this;
      const svg = this._element;
      const height = this.maxArc;

      // Delete old group
      if (svg.getElementsByTagName("g")[0] !== undefined) {
        svg.removeChild(
          svg.getElementsByTagName("g")[0]
        );
        t._tokenElements = [];
      };

      const g = svg.appendChild(t._c("g"));

      // Draw token list
      const text = g.appendChild(t._c("text"));
      text.setAttribute('class', 'leaf');
      text.setAttribute("text-anchor", "start");
      text.setAttribute("y", height);

      // Calculate the start position
      t._y = height - (t.anchorStart);

      // Introduce some prepending whitespace (yeah - I know ...)
      const ws = text.appendChild(t._c("tspan"));
      ws.appendChild(d.createTextNode('\u00A0'));
      ws.style.textAnchor = "start";
      
      t._tokens.forEach(function(node_i) {
        // Append svg
        // var x = text.appendChild(this._c("text"));
        const tspan = text.appendChild(this._c("tspan"));
        tspan.appendChild(d.createTextNode(node_i));
        tspan.setAttribute("text-anchor", "middle");
        
        this._tokenElements.push(tspan);

        // Add whitespace!
        tspan.setAttribute("dx", this.tokenSep);
      }, t);

      // Get some global position data that may change on resize
      t.offsetLeft = t._rect(g).left;

      // The group of arcs
      const arcs = g.appendChild(t._c("g"));
      t._arcsElement = arcs;
      arcs.classList.add("arcs");

      const labels = g.appendChild(t._c("g"));
      t._labelsElement = labels;
      labels.classList.add("labels");

      // Sort arcs if not sorted yet
      if (t._sortedArcs === undefined)
        t._sortArcs();

      // 1. Draw all anchors
      t._sortedAnchors.forEach(
        i => t._drawAnchor(i)
      );

      // 2. Draw all arcs
      t._sortedArcs.forEach(
        i => t._drawArc(i)
      );

      // Resize the svg with some reasonable margins
      svg.setAttribute("width", t._rect(text).width + 20);
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
    
    let stack = [];

    // Iterate over all definitions
    list.forEach(function(current) {

      // Check the stack order
      let overlaps = 0;
      let check;
      for (let j = (stack.length - 1); j >= 0; j--) {
        check = stack[j];

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
    });

    return stack;
  };
});
