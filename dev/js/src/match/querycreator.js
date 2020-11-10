/**
 * QueryCreator for Kalamar.
 * This creates a Poliqarp/CQP query by using the
 * annotation table.
 *
 * @author Nils Diewald
 */
"use strict";

define(['util'], function () {

  /*
   * TODO:
   *   Cache foundry and layer information per row.
   * TODO:
   *   Or-Groups are no longer in use.
   * TODO:
   *   Make language and input fields snigletons!
   */
  const loc = KorAP.Locale;
  loc.NEW_QUERY = loc.NEW_QUERY || 'New Query';

  const esc = RegExp("[ \.\'\\\\\|\&]");
  
  function _getKeyValue (keyValue) {
    if (keyValue.match(esc) != null) {
      return "'" + keyValue.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
    };
    return keyValue;
  };
  
  function _getAnnotation (prefix, target) {

    // Complex annotation
    if (target.childNodes.length > 1) {
      let orGroup = [];

      // Iterate over alternative annotations
      target.childNodes.forEach(function (item) {
        if (item.nodeType === 3)
          orGroup.push(prefix + _getKeyValue(item.data));
      });
      return '(' + orGroup.sort().join(' | ') + ')';
    }

    // Simple annotation
    else {
      if (target.innerText == '')
        return '';

      return prefix + _getKeyValue(target.innerText);
    };
  };

  return {

    /**
     * Constructor
     */
    create : function (matchTable) {
      return Object.create(this)._init(matchTable);
    },

    // Initialize query creator
    _init : function (matchTable) {

      // Parameter checks
      if (matchTable === undefined)
        throw new Error('Missing parameters');
      else if (!(matchTable instanceof Node))
        throw new Error('Requires element');

      const t = this;

      // Collect the token sequence in an array
      t._query = []

      // Get the match table
      t._matchTable = matchTable;

      // Listen on the match table
      t._matchTable.addEventListener(
        "click", t.clickOnAnno.bind(t), false
      );

      // Initialize element
      const e = t._element = document.createElement('p');
      e.classList.add('query','fragment');

      // Prepend info text
      e.addE('span').addT(loc.NEW_QUERY + ':');

      // Append query fragment part
      t._queryFragment = e.addE('span');

      // Event when the query fragment is clicked
      e.addEventListener('click', t.toQueryBar.bind(t), 1);

      // Get some basic information - see tutorial.js
      // TODO:
      //   It may be better to consultate a global object
      //   like KorAP.Hint, however ...
      t._ql = document.getElementById("ql-field");
	    t._q = document.getElementById("q-field")

      t._shown = false;
      return t;
    },


    // Realease a click event on the annotation table
    clickOnAnno : function (event) {
      
      // Listen for clicks on table cells
      if (event.target !== event.currentTarget) {

        // Get target event
        const target = event.target;

        let head, foundry, layer, i, sib, annotation;

        if (target.tagName == 'TD') {

          if (target.innerText == '')
            return;

          if (target.classList.contains('matchkeyvalues'))
            return;


          // Check foundry and layer
          head    = target.parentNode.getElementsByTagName('th');
          foundry = head[0].innerText;
          layer   = head[1].innerText;

          // Check index position:
          i = -2;
          sib = target;
          while ((sib = sib.previousSibling) != null) {
            if (sib.nodeType === 1)
              i++;
          };

          // Get annotation value from cell
          annotation = _getAnnotation(foundry + '/' + layer + '=', target);

          if (annotation !== '') {

            // Add term
            this.toggleInToken(target, i, annotation);
          };
        }

        // The annotation is part of a key-value-pair
        else if (target.tagName == 'SPAN' || target.tagName == 'DIV') {

          if (target.innerText == '')
            return;

          if (target.tagName == 'SPAN') {
            target = target.parentNode;
          };

          // Check foundry and layer
          const parentCell = target.parentNode;
          head    = parentCell.parentNode.getElementsByTagName('th');
          foundry = head[0].innerText;
          layer   = head[1].innerText;

          // Check index position of parent cell
          i = -2;
          sib = parentCell;
          while((sib = sib.previousSibling) != null) {
            if (sib.nodeType === 1)
              i++;
          };

          // Get annotation value from cell
          annotation = _getAnnotation(foundry + '/' + layer + '=', target);

          if (annotation !== '') {

            // Add term
            this.toggleInToken(target, i, annotation);
          }
        }

        // Get orth values
        else if (target.tagName == 'TH') {

          // The head is in the top row
          if (target.parentNode.parentNode.tagName == 'THEAD') {

            // Ignore cutted field
            if (target.classList.contains("cutted")) {
              return;
            }

            i = -2;
            sib = target;
            while ((sib = sib.previousSibling) != null) {
              if (sib.nodeType === 1)
                i++;
            };

            // Target is an orth
            if (i >= 0) {
              this.toggleInToken(target, i, _getAnnotation("orth=",target));
            }            
          }

          // The head refers to the complete row
          // Mark the complete row!
          else {

            // Check foundry and layer
            head    = target.parentNode.getElementsByTagName('th');
            foundry = head[0].innerText;
            layer   = head[1].innerText;
            const prefix = foundry + '/' + layer + '=';

            // Iterate over all siblings
            i = 0;
            sib = target;
            while ((sib = sib.nextSibling) != null) {
              if (sib.nodeType !== 1 || sib.tagName === 'TH')
                continue;

              // Is a key-value-cell
              if (sib.classList.contains('matchkeyvalues')) {

                Array.from(
                  sib.getElementsByTagName('div')
                ).forEach(function(keyvaluepair){

                  // Get annotation value from cell
                  annotation = _getAnnotation(prefix, keyvaluepair);

                  if (annotation !== '') {

                    // Add annotation to string
                    this._addToToken(i, annotation);
                    keyvaluepair.classList.add('chosen');
                  };
                }, this);
              }

              // Normal cell
              else {

                // Get annotation value from cell
                annotation = _getAnnotation(prefix, sib);

                if (annotation !== '') {

                  // Add annotation to string
                  this._addToToken(i, annotation);
                  sib.classList.add('chosen');
                };
              }

              i++;
            };
          };
        };
      };

      event.stopPropagation();
    },


    // Add term to token
    _addToToken : function (index, term) {

      let token = this._query[index];

      // Initialize token
      if (token === undefined) {
        token = this._query[index] = [];
      };

      // Push to token array
      token.push(term);

      // Make terms unique
      this._query[index] = token.filter(
        function (e, i, arr) {
          return arr.lastIndexOf(e) === i;
        }
      );

      this.show();
    },


    // Remove term from token
    _removeFromToken : function (index, term) {
      let token = this._query[index];

      if (token === undefined)
        return;

      token.splice(token.indexOf(term), 1);

      this._query[index] = token.length > 0 ? token : undefined;
      
      this.show();
    },

    
    // Get element representing annotation line
    element : function () {
      return this._element;
    },


    // Check if the query fragment is shown
    shown : function () {
      return this._shown;
    },

    
    // Show annotation fragment
    show : function () {

      const t = this;
      const str = t.toString();
      const m = t._matchTable;

      // Fragment is empty
      if (str === '') {

        // Hide element
        if (t._shown === true) {
          m.parentNode.removeChild(t._element);
          t._shown = false;
        }
      }

      // Fragment is defined
      else {

        if (t._shown === false) {

          // Insert after
          m.parentNode.insertBefore(
            t._element, m.nextSibling
          );
          t._shown = true;
        };

        // set value
        t._queryFragment.innerText = str;
      };
    },


    // Add term to token if not yet chosen, otherwise remove
    toggleInToken : function (node, index, term) {
      const cl = node.classList;
      if (cl.contains('chosen')) {
        this._removeFromToken(index, term);
        cl.remove('chosen');
      }
      else {
        this._addToToken(index, term);
        cl.add('chosen');
      };
    },


    // Stringify annotation
    toString : function () {
      let str = '';
      let distance = 0;

      // This needs to take undefined tokens into account, therefore
      // forEach() is not an option
      let token;
      for (let i = 0; i < this._query.length; i++) {
        token = this._query[i];

        // Token is defined
        if (token !== undefined) {
          if (distance > 0) {
            str += '[]';
            if (distance > 1) {
              str += '{' + distance + '}';
            };
            distance = 0;
          };
          
          str += '[' + token.sort().join(" & ") + ']';
        }

        // Token is not defined - but distances count
        else if (str !== '') {
          distance++;
        };
      };

      return str;
    },


    // Add query fragment to query bar
    toQueryBar : function (e) {
      const t = this;

      if (t._ql === undefined || t._q === undefined || t._ql === null) {
        console.log('No query language object defined');
        return;
      };

      // Find query language field for Poliqarp
      const ql = Array.from(
        t._ql.options
      ).find(e => e.value == 'poliqarp');

      if (ql)
        ql.selected = true;

      // Insert to query bar
      t._q.value = t.toString();

      // Scroll to top
      window.scrollTo(0, 0);
    }
  };  
});
