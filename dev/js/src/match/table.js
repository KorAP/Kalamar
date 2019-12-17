/**
 * Table representation of token-based
 * annotations of a match.
 */
define([
  'match/querycreator',
  "util"
], function (matchQueryCreator) {
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
      var html = d.createElement("div");
      html.innerHTML = snippet;
      
      this._pos = 0;
      this._token = [];
      this._mark = [];
      this._markE = undefined;
      this._cutted = [];
      this._info = [];
      this._foundry = {};
      this._layer = {};
    
      // Parse the snippet
      this._parse(html.childNodes, false);      

      html.innerHTML = '';
      return this;
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
      for (var i in children) {
        var c = children[i];

        // Create object on position unless it exists
        if (this._info[this._pos] === undefined) {
          this._info[this._pos] = {};
        };

        // Store at position in foundry/layer as array
        var found = this._info[this._pos];

        // Element with title
        if (c.nodeType === 1) {
          var newMark = mark;

          if (c.tagName === 'MARK') {
            newMark = true;
          }

          else if (c.hasAttribute("title") &&
              _TermRE.exec(c.getAttribute("title"))) {

            // Fill position with info
            var foundry, layer, value;
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
            if (this._foundry[foundry] === undefined)
              this._foundry[foundry] = {};
            this._foundry[foundry][layer] = 1;

            // Set layer
            if (this._layer[layer] === undefined)
              this._layer[layer] = {};
            this._layer[layer][foundry] = 1;
          }

          // The current position marks a cut
          else if (c.hasAttribute("class") && c.getAttribute("class") == "cutted") {
            this._cutted.push(this._pos);
            this._token[this._pos++] = "";            
          }

          // depth search
          if (c.hasChildNodes())
            this._parse(c.childNodes, newMark);
        }

        // Leaf node
        // store string on position and go to next string
        else if (c.nodeType === 3) {
          if (c.nodeValue.match(/[a-z0-9\u25ae]/iu)) {
            this._mark[this._pos] = mark ? true : false;
            this._token[this._pos++] = c.nodeValue;
          };
        };
      };

      delete this._info[this._pos];
    },


    /**
     * Get HTML table view of annotations.
     */
    element : function () {
      if (this._element !== undefined)
        return this._element;

      // First the legend table
      var wrap = d.createElement('div');

      var table = wrap.addE('table');

      this._element = wrap;

      // Single row in head
      var tr = table.addE('thead').addE('tr');

      var ah = KorAP.annotationHelper || { "getDesc" : function () {}};

      // Add cell to row
      var addCell = function (type, key, value) {        
        var c = this.addE(type);

        if (value === undefined)
          return c;

        if (key && value instanceof Array && value[1] !== undefined) {

          // There are multiple values to add
          c.classList.add('matchkeyvalues');
          for (var n = 0; n < value.length; n++) {
            var e = c.addE('div');
            e.addT(value[n]);

            var anno = ah.getDesc(key, value[n]);

            if (anno)
              e.setAttribute("title", anno);
          };
        }

        else {

          if (value instanceof Array)
            value = value[0];

          c.addT(value);

          // Add tooltip
          var anno = ah.getDesc(key, value);
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
      for (var i in this._token) {
        let surface = this.getToken(i);
        var c = tr.addCell('th', undefined, surface);
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
      };
      
      var tbody = table.addE('tbody');

      var foundryList = Object.keys(this._foundry).sort();

      for (var f = 0; f < foundryList.length; f++) {
        var foundry = foundryList[f];
        var layerList =
            Object.keys(this._foundry[foundry]).sort();

        for (var l = 0; l < layerList.length; l++) {
          var layer = layerList[l];
          tr = tbody.addE('tr');
          tr.setAttribute('tabindex', 0);
          tr.addCell = addCell;

          tr.addCell('th', undefined, foundry);
          tr.addCell('th', undefined, layer);

          var key = foundry + '/' + layer + '=';

          for (var v = 0; v < this.length(); v++) {

            // Get the cell value
            var value = this.getValue(v, foundry, layer);

            // Add cell to row
            var cell = tr.addCell(
              'td',
              key,
              value 
            );

            if (this._mark[v]) {
              cell.classList.add('mark');
            };
          };
        };
      };
      
      // Add query creator
      this._matchCreator = matchQueryCreator.create(this._element);
      
      return this._element;
    },
  };
});
