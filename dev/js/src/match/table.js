/**
 * Table representation of token-based
 * annotations of a match.
 */
define([
  'match/querycreator',
  "util"
], function (matchQueryCreator) {
  "use strict";

  /*
   * TODO:
   *   Create base object for all matchinfo classes!
   * TODO:
   *   Rename to match/annotationtable
   */
  const _TermRE = new RegExp("^(?:([^\/]+?)\/)?([^:]+?):(.+?)$");
  const d = document;

  return {

    /**
     * Create new table view for a match
     * based on a snippet string.
     */
    create : function (snippet) {
      return Object.create(this)._init(snippet);
    },

    // Initialize table based on snippet
    _init : function (snippet) {

      // Create html for traversal
      const html = d.createElement("div");
      const t = this;
      html.innerHTML = snippet;
      
      t._pos     = 0;
      t._token   = [];
      t._mark    = [];
      t._markE   = undefined;
      t._cutted  = [];
      t._info    = [];
      t._foundry = {};
      t._layer   = {};
    
      // Parse the snippet
      t._parse(html.childNodes, false);      

      html.innerHTML = '';
      return t;
    },


    // TODO: Destroy match!
    destroy : function () {
      this._matchCreator = undefined;
    },


    /**
     * Length of the table (columns),
     * aka the number of tokens
     * in the snippet.
     */
    length : function () {
      return this._pos;
    },


    /**
     * Move the viewport to the match
     */
    toMark : function () {
      if (this._markE === undefined)
        return;
      this._markE.scrollIntoView({
        inline: "start",
        block: "nearest"
      });
    },
    

    /**
     * Get the token in the snippet
     * At a given position.
     *
     * @param pos
     */
    getToken : function (pos) {
      if (pos === undefined)
        return this._token;
      return this._token[pos];
    },


    /**
     * Get the annotation of a token
     * in the snippet based on the position,
     * the foundry, and the layer.
     *
     * @param pos
     * @param foundry
     * @param layer
     */
    getValue : function (pos, foundry, layer) {
      return this._info[pos][foundry + '/' + layer]
    },


    // Parse the snippet
    _parse : function (children, mark) {

      // Get all children
      children.forEach(function(c) {
        const t = this;

        // Create object on position unless it exists
        if (t._info[t._pos] === undefined) {
          t._info[t._pos] = {};
        };

        // Store at position in foundry/layer as array
        const found = t._info[t._pos];

        // Element with title
        if (c.nodeType === 1) {
          let newMark = mark;

          if (c.tagName === 'MARK') {
            newMark = true;
          }

          else if (c.hasAttribute("title") &&
              _TermRE.exec(c.getAttribute("title"))) {

            // Fill position with info
            let foundry, layer, value;
            if (RegExp.$2) {
              foundry = RegExp.$1;
              layer   = RegExp.$2;
            }
            else {
              foundry = "base";
              layer   = RegExp.$1
            };

            value = RegExp.$3;
      
            if (found[foundry + "/" + layer] === undefined) {
              found[foundry + "/" + layer] = [value];
            }
            else {
              // if (found[foundry + "/" + layer].indexOf(value) === -1) {
              if (!found[foundry + "/" + layer].includes(value)) {
                // Push value to foundry/layer at correct position
                found[foundry + "/" + layer].push(value);
              };
            }

            // Set foundry
            if (t._foundry[foundry] === undefined)
              t._foundry[foundry] = {};
            t._foundry[foundry][layer] = 1;

            // Set layer
            if (t._layer[layer] === undefined)
              t._layer[layer] = {};
            t._layer[layer][foundry] = 1;
          }

          // The current position marks a cut
          else if (c.hasAttribute("class") && c.getAttribute("class") == "cutted") {
            t._cutted.push(t._pos);
            t._token[t._pos++] = "";            
          }

          // depth search
          if (c.hasChildNodes())
            t._parse(c.childNodes, newMark);
        }

        // Leaf node
        // store string on position and go to next string
        else if (c.nodeType === 3) {
          if (c.nodeValue.match(/[a-z0-9\u25ae]/iu)) {
            t._mark[t._pos] = mark ? true : false;
            t._token[t._pos++] = c.nodeValue;
          };
        };
      }, this);

      delete this._info[this._pos];
    },


    /**
     * Get HTML table view of annotations.
     */
    element : function () {
      if (this._element !== undefined)
        return this._element;

      // First the legend table
      const wrap = d.createElement('div');

      const table = wrap.addE('table');

      this._element = wrap;

      // Single row in head
      let tr = table.addE('thead').addE('tr');

      const ah = KorAP.annotationHelper || { "getDesc" : function () {}};
      
      // Add cell to row
      const addCell = function (type, key, value) {        
        const c = this.addE(type);

        if (value === undefined)
          return c;

        if (key && value instanceof Array && value[1] !== undefined) {

          // There are multiple values to add
          c.classList.add('matchkeyvalues');

          let e, anno;
          value.forEach(function(v) {
            e = c.addE('div');
            e.addT(v);

            anno = ah.getDesc(key, v);

            if (anno)
              e.setAttribute("title", anno);
          });
        }

        else {

          if (value instanceof Array)
            value = value[0];

          c.addT(value);

          // Add tooltip
          const anno = ah.getDesc(key, value);
          if (anno)
            c.setAttribute("title", anno);
        };

        return c;
      };

      tr.addCell = addCell;

      // Add header information
      tr.addCell('th', undefined, 'Foundry');
      tr.addCell('th', undefined, 'Layer');

      // Add tokens
      Object.keys(this._token).forEach(function(i) {
        const surface = this.getToken(i);
        const c = tr.addCell('th', undefined, surface);
        if (this._mark[i]) {
          c.classList.add('mark');
          if (this._markE === undefined) {
            this._markE = c;
          };
        }
        else if (this._cutted[0] == i || this._cutted[1] == i) {
          c.classList.add('cutted');
        };

        // In case the title is very long - add a title attribute
        if (surface.length > 20) {
          c.setAttribute("title", surface)
        }
      }, this);
      
      const tbody = table.addE('tbody');

      let layerList, key, v, value, cell;
      
      Object.keys(this._foundry).sort().forEach(function(foundry) {
        let layerList =
            Object.keys(this._foundry[foundry]).sort();

        layerList.forEach(function(layer) {

          tr = tbody.addE('tr');
          tr.setAttribute('tabindex', 0);
          tr.addCell = addCell;
          tr.addCell('th', undefined, foundry);
          tr.addCell('th', undefined, layer);

          key = foundry + '/' + layer + '=';

          for (v = 0; v < this.length(); v++) {

            // Get the cell value
            value = this.getValue(v, foundry, layer);

            // Add cell to row
            cell = tr.addCell(
              'td',
              key,
              value 
            );

            if (this._mark[v]) {
              cell.classList.add('mark');
            };
          };
        }, this);
      }, this);
      
      // Add query creator
      this._matchCreator = matchQueryCreator.create(this._element);
      
      return this._element;
    },
  };
});
