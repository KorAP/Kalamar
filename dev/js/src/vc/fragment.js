/**
 * Create a virtual corpus fragment,
 * that can be shown and merge with the
 * main VC.
 *
 * @author Nils Diewald
 */

define(['util'], function () {
  "use strict";

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

  
  return {

    create : function () {
      var obj = Object.create(this);
      obj._operands = [];
      return obj;
    },


    /**
     * Add document constraint to fragment
     */
    add : function (key, value, type) {
      for (var i in this._operands) {
        var op = this._operands[i];
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
      for (var i in this._operands) {
        var op = this._operands[i];
        if (op[0] === key && op[1] === value) {
          this._operands.splice(i, 1);
          this.update();
          return;
        };
      };
      return;
    },

    
    /**
     * Add fragment constraints to VC.
     */
    mergeWithVC : function () {
    },


    /**
     * Get the element associated with the virtual corpus
     */
    element : function () {
      if (this._element !== undefined) {
        return this._element;
      };

      this._element = document.createElement('div');
      this._element.classList.add('vc', 'fragment');
      return this._element;
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
      var root;
      var l = this._operands.length;
      if (l > 1) {

        root = document.createElement('div');
        root.setAttribute('class','docGroup');
        root.setAttribute('data-operation', 'and');

        for (var i in this._operands) {
          root.appendChild(_doc(this._operands[i]));
        };
      }
      else if (l == 1) {
        root = _doc(this._operands[0]);
      };

      var e = this.element();
      if (e.firstChild)
        e.replaceChild(root, e.firstChild);
      else
        e.appendChild(root);
        
      return this;
    }      
  }
});
