/**
 * Visualize span annotations as a tree
 * using Dagre.
 *
 * This should be lazy loaded!
 */
"use strict";

define(['lib/dagre'], function (dagre) {

  const d = document;
  const svgNS = "http://www.w3.org/2000/svg";
  const _TermRE = new RegExp("^(?:([^\/]+?)\/)?([^:]+?):(.+?)$");

  // Node size
  var WIDTH  = 55, HEIGHT = 20, LINEHEIGHT = 14;

  // Create path for node connections 
  function _line (src, target) {
    const x1 = src.x,
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
      let html = d.createElement("div");
      html.innerHTML = snippet;

      const g = new dagre.graphlib.Graph({
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


    _c : function (tag) {
      return d.createElementNS(svgNS, tag);
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
      children.forEach(function(c) {

        // Element node
        if (c.nodeType == 1) {

          // Get title from html
          if (c.getAttribute("title")) {

            // Add child node
            const id = this._next++;

            const obj = this._addNode(id, {
              "class" : "middle",
              "label" : this._clean(c.getAttribute("title"))
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

            this._parse(
              parent,
              c.childNodes,
              c.tagName === 'MARK' ? true : mark
            );
          };
        }

        // Text node
        else if (c.nodeType == 3)

          if (c.nodeValue.match(/[-a-z0-9]/i)) {
            
            // Add child node
            const id = this._next++;
            this._addNode(id, {
              "class" : "leaf",
              "label" : c.nodeValue
            });

            this._addEdge(parent, id);
          };
      }, this);
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
      if (this._el === undefined)
        return;

      const treeDiv = this._el.parentNode;
      const cWidth = parseFloat(window.getComputedStyle(this._el).width);
      const treeWidth = parseFloat(window.getComputedStyle(treeDiv).width);

      // Reposition:
      if (cWidth > treeWidth) {
        treeDiv.scrollLeft = (cWidth - treeWidth) / 2;
      };
    },


    /**
     * Create svg and serialize as base64
     */
    toBase64 : function () {

      // First clone element
      const svgWrapper = d.createElement('div')
      svgWrapper.innerHTML = this.element().outerHTML;

      const svg = svgWrapper.firstChild;
      const style = this._c('style');

      svg.getElementsByTagName('defs')[0].appendChild(style);

      style.innerHTML = 
	      'path.edge '  +            '{ stroke: black; stroke-width: 2pt; fill: none; }' +
        'g.root rect.empty,' +
        'g.middle rect' +          '{ stroke: black; stroke-width: 2pt; fill: #bbb; }' +
        'g.leaf > rect ' +         '{ display: none }' +
        'g > text > tspan ' +      '{ text-anchor: middle; font-size: 9pt }' +
        'g.leaf > text > tspan ' + '{ font-size: 10pt; overflow: visible; }';

      return btoa(unescape(encodeURIComponent(svg.outerHTML)).replace(/&nbsp;/g, ' '));
    },
    

    /**
     * Get the dom element of the tree view.
     */
    element : function () {

      if (this._el !== undefined)
        return this._el;

      const g = this._graph;
      dagre.layout(g);
      
      const canvas = this._c('svg');
      this._el = canvas;

      canvas.appendChild(this._c('defs'));

      // Create edges
      const that = this;

      let src, target, p;

      g.edges().forEach(
        function (e) {
          src = g.node(e.v);
          target = g.node(e.w);
          p = that._c('path');
          p.setAttributeNS(null, "d", _line(src, target));
          p.classList.add('edge');
          canvas.appendChild(p);
        }
      );
      
      let height = g.graph().height;

      // Create nodes
      g.nodes().forEach(
        function (v) {
          v = g.node(v);
          const group = that._c('g');
          group.setAttribute('class', v.class);
          
          // Add node box
          const rect = group.appendChild(that._c('rect'));
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
            const text = group.appendChild(that._c('text'));
            let y = v.y - v.height / 2;
            text.setAttribute('y', y);
            text.setAttribute(
              'transform',
              'translate(' + v.width/2 + ',' + ((v.height / 2) + 5) + ')'
            );

            const vLabel = v.label.replace(/&nbsp;/g, " ")
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>');
            
            if (v.class === "leaf") {
              text.setAttribute('title', vLabel);

              let n = 0;
              let tspan;
              vLabel.split(" ").forEach(function(p) {
                if (p.length === 0)
                  return;

                tspan = that._c('tspan');
                tspan.appendChild(d.createTextNode(p));

                if (n !== 0)
                  tspan.setAttribute('dy', LINEHEIGHT + 'pt');
                else
                  n = 1;

                tspan.setAttribute('x', v.x - v.width / 2);
                y += LINEHEIGHT;
                text.appendChild(tspan);
              });

              y += LINEHEIGHT;

              // The text is below the canvas - readjust the height!
              if (y > height)
                height = y;
            }
            else {
              const tspan = that._c('tspan');
              tspan.appendChild(d.createTextNode(vLabel));
              tspan.setAttribute('x', v.x - v.width / 2);
              text.appendChild(tspan);
            };
          };
          canvas.appendChild(group);
        }
      );

      canvas.setAttribute('width', g.graph().width);
      canvas.setAttribute('height', height);
      return this._el;
    },
    
    downloadLink : function () {
      const a = d.createElement('a');
      a.setAttribute('href-lang', 'image/svg+xml');
      a.setAttribute('href', 'data:image/svg+xml;base64,' + this.toBase64());
      a.setAttribute('download', 'tree.svg');
      a.target = '_blank';
      a.setAttribute('rel', 'noopener noreferrer');
      return a;
    }
  };
});
