/**
 * Create a virtual corpus fragment,
 * that can be shown and merged with the
 * main VC.
 *
 * @author Nils Diewald
 */

"use strict";

define(['vc/doc', 'util'], function (docClass) {

  const loc = KorAP.Locale;
  loc.NEW_CONSTRAINT = loc.NEW_CONSTRAINT || 'New Constraint';
  
  // Create a VC doc
  function _doc (op) {
    const doc = document.createElement('div');
    doc.setAttribute('class','doc');
          
    const key = doc.addE('span');
    key.setAttribute('class','key');
    key.addT(op[0]);

    const match = doc.addE('span');
    match.setAttribute('class','match');
    match.addT('eq');

    const value = doc.addE('span');
    value.setAttribute('class', 'value');
    value.addT(op[1]);

    return doc;
  };


  // Return object
  return {

    /**
     * Construct a new VC fragment.
     */
    create : function () {
      const obj = Object.create(this);
      obj._operands = [];
      return obj;
    },


    /**
     * Add document constraint to fragment
     */
    add : function (key, value, type) {
      this._operands.forEach(function (op, i, arr) {
        if (op[0] === key && op[1] === value) {
          arr.splice(i,1);
        }
      });
      this._operands.push([key, value, type]);
      this.update();
    },

    
    /**
     * Remove document constraint from fragment
     */
    remove : function (key, value) {
      for (let i = 0; i < this._operands.length; i++) {
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
      if (this._el !== undefined) {
        return this._el;
      };

      // Initialize element
      const e = this._el = document.createElement('div');
      e.classList.add('vc', 'fragment');

      // Prepend info text
      e.addE('span').addT(loc.NEW_CONSTRAINT + ':');
      this._frag = e.addE('div');
      
      return e;
    },


    /**
     * Return operands as document objects
     */
    documents : function () {
      return this._operands.map(
        function (item) {
          const doc = docClass.create();
          doc.key(item[0]);
          doc.matchop("eq");
          doc.value(item[1]);
          doc.type(item[2] === "date" ? "date" : (item[2] === "integer" ? "integer" : "string"));
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
      const l = this._operands.length;

      if (l > 1) {
        root = document.createElement('div');
        root.setAttribute('class','docGroup');
        root.setAttribute('data-operation', 'and');
        this._operands.forEach(i => root.appendChild(_doc(i)));
      }

      else if (l == 1) {
        root = _doc(this._operands[0]);
      };

      // Init element
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
