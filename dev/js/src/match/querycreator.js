/**
 * QueryCreator for Kalamar.
 *
 * @author Nils Diewald
 */
define(['util'], function () {
  "use strict";

  var loc = KorAP.Locale;
  loc.NEW_QUERY = loc.NEW_QUERY || 'New Query';

  return {
    create : function (matchInfo) {
      return Object.create(this)._init(matchInfo);
    },

    // Initialize query creator
    _init : function (matchInfo) {

      // This may be probably a hint helper
      this._query = []
      this._matchInfo = matchInfo;

      // Listen on the match table
      this._matchInfo.addEventListener(
        "click", this.clickOnAnno.bind(this), false
      );

      // Initialize element
      this._element = document.createElement('p');
      this._element.className = 'queryfragment';

      // Prepend info text
      this._element.appendChild(document.createElement('span'))
        .appendChild(document.createTextNode(loc.NEW_QUERY + ':'));

      // Append query fragment part
      this._queryFragment = this._element.appendChild(
        document.createElement('span')
      );

      this._shown = false;
      return this;
    },

    clickOnAnno : function (event) {

      // Listen for clicks on table cells
      if (event.target !== event.currentTarget) {

        // Get target event
        var target = event.target;

        if (target.tagName == 'TD') {

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

          this.toggleInToken(target, i, foundry + '/' + layer + '=' + target.innerText);
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
              this.addToToken(i, prefix + sib.innerText);
              sib.className = 'chosen';
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
          this._matchInfo.appendChild(this._element);
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
      this._query.forEach(function (token) {
        if (token !== undefined) {
          str += '[' + token.sort().join(" & ") + ']';
        };
      });
      return str;
    },

    toQueryBar : function () {
      // 1. Activate Poliquarp-QL
      // 2. Empty query helper
      // 3. Reset annotation helper
      // 4. Insert to query bar
      // 5. scroll to top
    }
  };  
});
