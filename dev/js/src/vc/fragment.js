/**
 * Create a virtual corpus fragment,
 * that can be shown and merged with the
 * main VC.
 *
 * @author Nils Diewald
 */

define(['vc/doc', 'util'], function (docClass) {
  "use strict";

  const loc = KorAP.Locale;
  loc.NEW_CONSTRAINT = loc.NEW_CONSTRAINT || 'New Constraint';
  
  // Create a VC doc
  function _doc (op) {
    var doc = document.createElement('div');
    doc.setAttribute('class','doc');
          
    var key = doc.addE('span');
    key.setAttribute('class','key');
    key.addT(op[0]);

    var match = doc.addE('span');
    match.setAttribute('class','match');
    match.addT('eq');

    var value = doc.addE('span');
    value.setAttribute('class', 'value');
    value.addT(op[1]);
      
    return doc;
  };

  // Return object
  return {

    create : function () {
      const obj = Object.create(this);
      obj._operands = [];
      return obj;
    },


    /**
     * Add document constraint to fragment
     */
    add : function (key, value, type) {
      for (let i in this._operands) {
        let op = this._operands[i];
        if (op[0] === key && op[1] === value) {
          array.splice(index, 1);
        };
      };
      this._operands.push([key, value, type]);
      this.update();
    },

    
    /**
     * Remove document constraint from fragment
     */
    remove : function (key, value) {
      for (let i in this._operands) {
        let op = this._operands[i];
        if (op[0] === key && op[1] === value) {
          this._operands.splice(i, 1);
          this.update();
          return;
        };
      };
      return;
    },


    /**
     * Check, if the fragment contains any constraints
     */
    isEmpty : function () {
      return this._operands.length > 0 ? false : true;
    },
    

    /**
     * Get the element associated with the virtual corpus
     */
    element : function () {
      if (this._element !== undefined) {
        return this._element;
      };

      // Initialize element
      this._element = document.createElement('div');
      this._element.classList.add('vc', 'fragment');

      // Prepend info text
      this._element.addE('span').addT(loc.NEW_CONSTRAINT + ':');
      this._frag = this._element.addE('div');
      
      return this._element;
    },


    /**
     * Return operands as document objects
     */
    documents : function () {
      return this._operands.map(
        function (item) {
          let doc = docClass.create();
          doc.key(item[0]);
          doc.matchop("eq");
          doc.value(item[1]);
          if (item[2] === "date") {
            doc.type("date");
          }
          else {
            doc.type("string");
          };
          return doc;
        }
      );
    },

    /**
     * Update the whole object based on the underlying data structure
     */
    update : function() {

      // <div class="docGroup" data-operation="and">
      //   <div class="doc">
      //     <span class="key">author</span>
      //     <span class="match">eq</span>
      //     <span class="value">Baum</span>
      //   </div>
      // </div>
      let root;
      let l = this._operands.length;
      if (l > 1) {

        root = document.createElement('div');
        root.setAttribute('class','docGroup');
        root.setAttribute('data-operation', 'and');

        for (let i in this._operands) {
          root.appendChild(_doc(this._operands[i]));
        };
      }
      else if (l == 1) {
        root = _doc(this._operands[0]);
      };

      this.element();
      const e = this._frag;
      if (l === 0) {
        _removeChildren(e);
      }
      else if (e.firstChild)
        e.replaceChild(root, e.firstChild);
      else
        e.appendChild(root);
        
      return this;
    },

    
    /**
     * Stringification
     */
    toQuery : function () {
      if (this._operands.length === 0)
        return '';

      return this._operands.map(
        function (item) {
          if (item[2] === "date") {
            return item[0] + ' in ' + item[1];
          };
          return item[0] + ' = ' + new String(item[1]).quote();
        }
      ).join(" & ");
    }
  }
});
