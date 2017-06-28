(function () {
  "use strict";

  var qc = {
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
      var str = '';
      this._query.forEach(function (token, index) {
        if (token !== undefined) {
          str += _createToken(token);
        };
      });

      // Element is not yet defined
      if (this._element === undefined) {

        // Better create a div
        this._element = document.createElement('input');
        this._element.setAttribute('type', 'text');
        this._matchInfo.appendChild(this._element);
      };

      if (str === '') {
        this._matchInfo.removeChild(this._element);
        this._element = undefined;
      }
      else {
        this._element.value = str;
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
    }
  };

  function _createToken (token) {
    var str = '[';
    str += token.sort().join(" & ");
    return str + ']';
  };

  qc.create(document.getElementsByClassName('matchinfo')[0]);

})();
