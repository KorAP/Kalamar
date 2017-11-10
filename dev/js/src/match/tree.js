/**
 * Visualize span annotations as a tree
 * using Dagre.
 *
 * This should be lazy loaded!
 */
define(['lib/dagre'], function (dagre) {
  "use strict";

  var svgXmlns = "http://www.w3.org/2000/svg";
  var _TermRE = new RegExp("^(?:([^\/]+?)\/)?([^:]+?):(.+?)$");

  // Node size
  var WIDTH  = 55, HEIGHT = 20, LINEHEIGHT = 14;

  // Create path for node connections 
  function _line (src, target) {
    var x1 = src.x,
        y1 = src.y,
        x2 = target.x,
        y2 = target.y - target.height / 2;

    // c 0,0 -10,0
    return 'M ' + x1 + ',' + y1 + ' ' + 
      'C ' + x1 + ',' + y1 + ' ' + 
      x2 + ',' + (y2 - (y2 - y1) / 2)  + ' ' + 
      x2 + ',' + y2;
  };

  return {

    /**
     * Create new tree visualization based
     * on a match snippet.
     */
    create : function (snippet) {
      return Object.create(this).
       _init(snippet);
    },


    // Initialize the tree based on a snippet.
    _init : function (snippet) {
      this._next = new Number(0);
      
      // Create html for traversal
      var html = document.createElement("div");
      html.innerHTML = snippet;
      var g = new dagre.graphlib.Graph({
       "directed" : true 
      });
      g.setGraph({
       "nodesep" : 35,
       "ranksep" : 15,
       "marginx" : 40,
       "marginy" : 10
      });
      g.setDefaultEdgeLabel({});

      this._graph = g;
      
      // This is a new root
      this._addNode(
       this._next++,
       { "class" : "root" }
      );
      
      // Parse nodes from root
      this._parse(0, html.childNodes, undefined);

      // Root node has only one child - remove
      if (g.outEdges(0).length === 1)
       g.removeNode(0);

      html = undefined;
      return this;
    },

    /**
     * The number of nodes in the tree.
     */
    nodes : function () {
      return this._next;
    },

    // Add new node to graph
    _addNode : function (id, obj) {
      obj["width"]  = WIDTH;
      obj["height"] = HEIGHT;
      this._graph.setNode(id, obj)
      return obj;
    },
    
    // Add new edge to graph
    _addEdge : function (src, target) {
      this._graph.setEdge(src, target);
    },
    
    // Remove foundry and layer for labels
    _clean : function (title) {
      return title.replace(_TermRE, "$3");
    },

    // Parse the snippet
    _parse : function (parent, children, mark) {
      for (var i in children) {
       var c = children[i];

       // Element node
       if (c.nodeType == 1) {

         // Get title from html
         if (c.getAttribute("title")) {
           var title = this._clean(c.getAttribute("title"));

           // Add child node
           var id = this._next++;

           var obj = this._addNode(id, {
             "class" : "middle",
             "label" : title
           });
            
            if (mark !== undefined) {
              obj.class += ' mark';
            };
            
           this._addEdge(parent, id);

           // Check for next level
           if (c.hasChildNodes())
             this._parse(id, c.childNodes, mark);
         }

         // Step further
         else if (c.hasChildNodes()) {

            if (c.tagName === 'MARK') {
             this._parse(parent, c.childNodes, true);
            }
            else {
             this._parse(parent, c.childNodes, mark);
            };
          };
       }

       // Text node
       else if (c.nodeType == 3)

         if (c.nodeValue.match(/[-a-z0-9]/i)) {

           // Add child node
           var id = this._next++;
           this._addNode(id, {
             "class" : "leaf",
             "label" : c.nodeValue
           });

           this._addEdge(parent, id);
         };
      };
      return this;
    },

    // Dummy method to be compatible with relTree
    show : function () {
      return;
    },

    /**
     * Center the viewport of the canvas
     * TODO:
     *   This is identical to relations
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


    toBase64 : function () {

      // First clone element
      var svgWrapper = document.createElement('div')
      svgWrapper.innerHTML = this.element().outerHTML;
      var svg = svgWrapper.firstChild;

      var style = document.createElementNS(svgXmlns, 'style');
      svg.getElementsByTagName('defs')[0].appendChild(style);

      style.innerHTML = 
	      'path.edge '  +            '{ stroke: black; stroke-width: 2pt; fill: none; }' +
        'g.root rect.empty,' +
        'g.middle rect' +          '{ stroke: black; stroke-width: 2pt; fill: #bbb; }' +
        'g.leaf > rect ' +         '{ display: none }' +
        'g > text > tspan ' +      '{ text-anchor: middle; font-size: 9pt }' +
        'g.leaf > text > tspan ' + '{ font-size: 10pt; overflow: visible; }';
      
      return btoa(unescape(encodeURIComponent(svg.outerHTML)));
    },
    
    /**
     * Get the dom element of the tree view.
     */
    element : function () {
      if (this._element !== undefined)
       return this._element;

      var g = this._graph;

      dagre.layout(g);
      
      var canvas = document.createElementNS(svgXmlns, 'svg');
      this._element = canvas;

      canvas.appendChild(document.createElementNS(svgXmlns, 'defs'));
      
      var height = g.graph().height;

      // Create edges
      g.edges().forEach(
        function (e) {
          var src = g.node(e.v);
          var target = g.node(e.w);
          var p = document.createElementNS(svgXmlns, 'path');
          p.setAttributeNS(null, "d", _line(src, target));
          p.classList.add('edge');
          canvas.appendChild(p);
        });

      // Create nodes
      g.nodes().forEach(
        function (v) {
          v = g.node(v);
          var group = document.createElementNS(svgXmlns, 'g');
          group.setAttribute('class', v.class);
          
          // Add node box
          var rect = group.appendChild(document.createElementNS(svgXmlns, 'rect'));
          rect.setAttribute('x', v.x - v.width / 2);
          rect.setAttribute('y', v.y - v.height / 2);
          rect.setAttribute('rx', 5);
          rect.setAttribute('ry', 5);
          rect.setAttribute('width', v.width);
          rect.setAttribute('height', v.height);

          if (v.class === 'root' && v.label === undefined) {
            rect.setAttribute('width', v.height);
            rect.setAttribute('x', v.x - v.height / 2);
            rect.setAttribute('class', 'empty');
          };

          // Add label
          if (v.label !== undefined) {
            var text = group.appendChild(document.createElementNS(svgXmlns, 'text'));
            var y = v.y - v.height / 2;
            text.setAttribute('y', y);
            text.setAttribute(
              'transform',
              'translate(' + v.width/2 + ',' + ((v.height / 2) + 5) + ')'
            );
            
            if (v.class === "leaf") {
              text.setAttribute('title', v.label);

              var labelPart = v.label.split(" ");
              var n = 0;
              for (var i = 0; i < labelPart.length; i++) {
                if (labelPart[i].length === 0)
                  continue;

                var tspan = document.createElementNS(svgXmlns, 'tspan');
                tspan.appendChild(document.createTextNode(labelPart[i]));
                if (n !== 0)
                  tspan.setAttribute('dy', LINEHEIGHT + 'pt');
                else
                  n = 1;
                tspan.setAttribute('x', v.x - v.width / 2);
                y += LINEHEIGHT;
                text.appendChild(tspan);
              };

              y += LINEHEIGHT;

              // The text is below the canvas - readjust the height!
              if (y > height)
                height = y;
            }
            else {
              var tspan = document.createElementNS(svgXmlns, 'tspan');
              tspan.appendChild(document.createTextNode(v.label));
              tspan.setAttribute('x', v.x - v.width / 2);
              text.appendChild(tspan);
            };
          };
          canvas.appendChild(group);
        }
      );

      canvas.setAttribute('width', g.graph().width);
      canvas.setAttribute('height', height);
      return this._element;
    }
  };
});
