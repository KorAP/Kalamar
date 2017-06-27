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
          var child = target;
          while((child = child.previousSibling) != null) {
            if (child.nodeType === 1)
              i++;
          };
        
          this.addToToken(i, foundry + '/' + layer + '=' + target.innerText);
          target.style.backgroundColor = 'red';
        }

        // Get orth values
        else if (target.tagName == 'TH') {

          // The head is in the top row
          if (target.parentNode.parentNode.tagName == 'THEAD') {

            var i = -2;
            var child = target;
            while((child = child.previousSibling) != null) {
              if (child.nodeType === 1)
                i++;
            };

            // Target is an orth
            if (i >= 0) {

              this.addToToken(i, 'orth=' + target.innerText);
              target.style.backgroundColor = 'red';
            }
            
          };      
        };
      };

      event.stopPropagation();
    },

    addToToken : function (index, annotation) {

      var token = this._query[index];

      if (token === undefined) {
        token = this._query[index] = [];
      };

      token.push(annotation);

      // Make terms unique
      this._query[index] = token.filter(
        function (e, i, arr) {
          return arr.lastIndexOf(e) === i;
        }
      );

      this.show();
    },
    element : function () {
      return this._element;
    },
    show : function () {
      var str = '';
      this._query.forEach(function (token, index) {
        if (token !== undefined) {
          str += _createToken(token);
        };
      });

      // Element is not yet defined
      if (this._element === undefined) {
        this._element = document.createElement('input');
        this._element.setAttribute('type', 'text');
        this._matchInfo.appendChild(this._element);
      };

      this._element.value = str;
    }
  };

  function _createToken (token) {
    var str = '[';
    str += token.join(" & ");
    return str + ']';
  };

  qc.create(document.getElementsByClassName('matchinfo')[0]);

})();
