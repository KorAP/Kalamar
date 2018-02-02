/**
 * QueryCreator for Kalamar.
 *
 * @author Nils Diewald
 */
define(['util'], function () {
  "use strict";

  /*
   * TODO:
   *   Cache foundry and layer information per row.
   * TODO:
   *   Or-Groups are no longer in use.
   */
  const loc = KorAP.Locale;
  loc.NEW_QUERY = loc.NEW_QUERY || 'New Query';

  function _getAnnotation (prefix, target) {

    // Complex annotation
    if (target.childNodes.length > 1) {
      var orGroup = [];

      // Iterate over alternative annotations
      target.childNodes.forEach(function (item) {
        if (item.nodeType === 3)
          orGroup.push(prefix + item.data);
      });
      return '(' + orGroup.sort().join(' | ') + ')';
    }

    // Simple annotation
    else {
      if (target.innerText == '')
        return '';

      return prefix + target.innerText;
    };
  };

  return {
    create : function (matchInfo) {
      return Object.create(this)._init(matchInfo);
    },

    // Initialize query creator
    _init : function (matchInfo) {

      // Parameter checks
      if (matchInfo === undefined)
        throw new Error('Missing parameters');
      else if (!(matchInfo instanceof Node))
        throw new Error('Requires element');

      // Collect the token sequence in an array
      this._query = []

      // Remember the matchinfo that is the parent of
      // the matchtable and the query frafment
      this._matchInfo = matchInfo;

      // Get the match table
      this._matchTable = this._matchInfo.getElementsByClassName('matchtable')[0];

      if (this._matchTable === undefined)
        throw new Error('Element contains no match table');

      // Listen on the match table
      this._matchTable.addEventListener(
        "click", this.clickOnAnno.bind(this), false
      );

      // Initialize element
      this._element = document.createElement('p');
      this._element.className = 'queryfragment';

      // Prepend info text
      this._element.addE('span').addT(loc.NEW_QUERY + ':');

      // Append query fragment part
      this._queryFragment = this._element.addE('span');

      // Event when the query fragment is clicked
      this._element.addEventListener('click', this.toQueryBar.bind(this), 1);

      // Get some basic information - see tutorial.js
      // It may be better to consultate a global object like KorAP.Hint, however ...
      this._ql = document.getElementById("ql-field");
	    this._q = document.getElementById("q-field")

      this._shown = false;
      return this;
    },


    // Realease a click event on the annotation table
    clickOnAnno : function (event) {

      // Listen for clicks on table cells
      if (event.target !== event.currentTarget) {

        // Get target event
        var target = event.target;

        if (target.tagName == 'TD') {

          if (target.innerText == '')
            return;

          if (target.classList.contains('matchkeyvalues'))
            return;


          // Check foundry and layer
          var head    = target.parentNode.getElementsByTagName('th');
          var foundry = head[0].innerText;
          var layer   = head[1].innerText;

          // Check index position:
          var i = -2;
          var sib = target;
          while((sib = sib.previousSibling) != null) {
            if (sib.nodeType === 1)
              i++;
          };


          var prefix = foundry + '/' + layer + '=';
          var annotation = '';

          // Get annotation value from cell
          var annotation = _getAnnotation(prefix, target);

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
          var parentCell = target.parentNode;
          var head    = parentCell.parentNode.getElementsByTagName('th');
          var foundry = head[0].innerText;
          var layer   = head[1].innerText;

          // Check index position of parent cell
          var i = -2;
          var sib = parentCell;
          while((sib = sib.previousSibling) != null) {
            if (sib.nodeType === 1)
              i++;
          };

          var prefix = foundry + '/' + layer + '=';
          var annotation = '';

          // Get annotation value from cell
          var annotation = _getAnnotation(prefix, target);

          if (annotation !== '') {

            // Add term
            this.toggleInToken(target, i, annotation);
          }
        }

        // Get orth values
        else if (target.tagName == 'TH') {

          // The head is in the top row
          if (target.parentNode.parentNode.tagName == 'THEAD') {

            var i = -2;
            var sib = target;
            while ((sib = sib.previousSibling) != null) {
              if (sib.nodeType === 1)
                i++;
            };

            // Target is an orth
            if (i >= 0) {
              this.toggleInToken(target, i, 'orth=' + target.innerText);
            }            
          }

          // The head refers to the complete row
          // Mark the complete row!
          else {

            // Check foundry and layer
            var head    = target.parentNode.getElementsByTagName('th');
            var foundry = head[0].innerText;
            var layer   = head[1].innerText;
            var prefix = foundry + '/' + layer + '=';

            // Iterate over all siblings
            var i = 0;
            var sib = target;
            while ((sib = sib.nextSibling) != null) {
              if (sib.nodeType !== 1 || sib.tagName === 'TH')
                continue;

              // Is a key-value-cell
              if (sib.classList.contains('matchkeyvalues')) {
                var divs = sib.getElementsByTagName('div');
                for (var j = 0; j < divs.length; j++) {
                  var keyvaluepair = divs[j];

                  // Get annotation value from cell
                  var annotation = _getAnnotation(prefix, keyvaluepair);

                  if (annotation !== '') {

                    // Add annotation to string
                    this.addToToken(i, annotation);
                    keyvaluepair.className = 'chosen';
                  };
                };
              }

              // Normal cell
              else {

                // Get annotation value from cell
                var annotation = _getAnnotation(prefix, sib);

                if (annotation !== '') {

                  // Add annotation to string
                  this.addToToken(i, annotation);
                  sib.className = 'chosen';
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
    addToToken : function (index, term) {

      var token = this._query[index];

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
    removeFromToken : function (index, term) {
      var token = this._query[index];

      if (token === undefined)
        return;

      token.splice(token.indexOf(term), 1);

      if (token.length > 0)
        this._query[index] = token;
      else
        this._query[index] = undefined;

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

      var str = this.toString();

      // Fragment is empty
      if (str === '') {

        // Hide element
        if (this._shown === true) {
          this._matchInfo.removeChild(this._element);
          this._shown = false;
        }
      }

      // Fragment is defined
      else {

        if (this._shown === false) {
          this._matchInfo.insertBefore(this._element, this._matchTable.nextSibling);
          this._shown = true;
        };

        // set value
        this._queryFragment.innerText = str;
      };
    },

    // Add term to token if not yet chosen, otherwise remove
    toggleInToken : function (node, index, term) {
      if (node.className == 'chosen') {
        this.removeFromToken(index, term);
        node.className = '';
      }
      else {
        this.addToToken(index, term);
        node.className = 'chosen';
      };
    },

    // Stringify annotation
    toString : function () {
      var str = '';
      var distance = 0;

      for (var i = 0; i < this._query.length; i++) {
        var token = this._query[i];

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

      if (this._ql === undefined || this._q === undefined)
        return;

      // Set query language field
      var qlf = this._ql.options;
      for (var i in qlf) {
	      if (qlf[i].value == 'poliqarp') {
	        qlf[i].selected = true;
          break;
	      };
      };

      // Insert to query bar
      this._q.value = this.toString();

      // Scroll to top
      window.scrollTo(0, 0);
    }
  };  
});
