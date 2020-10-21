/**
 * Abstract JsonLD criterion object
 */
"use strict";

define(['vc/operators'], function (operatorsClass) {

  return {

    __changed : false,
    
    create : function () {
      return Object.create(this);
    },


    /**
     * Upgrade this object to another object
     * while private data stays intact
     */
    upgradeTo : function (props) {
      for (let prop in props) {
	      this[prop] = props[prop];
      };
      return this;
    },
    

    ldType : function (type) {
      if (arguments.length === 1)
	      this._ldType = type;
      return this._ldType;
    },
    

    parent : function (obj) {
      if (arguments.length === 1) {
	      this._parent = obj;
	      this.__changed = true;
      };
      return this._parent;
    },


    // Destroy object - especially for
    // acyclic structures!
    // I'm paranoid!
    destroy : function () {
      const t = this;
      if (t._ops != undefined) {
	      t._ops._parent = undefined;
	      if (t._ops._element !== undefined) {
	        t._ops._element.refTo = undefined;
        };
	      t._ops = undefined;
      };

      if (t._element !== undefined)
	      t._element = undefined;
      
      // In case of a group, destroy all operands
      if (t._operands !== undefined) {
        t._operands.forEach(i => i.destroy());
	      t._operands = [];
      };
    },
    
    // Wrap a new operation around the root group element 
    wrapOnRoot : function (op) {
      const parent = this.parent();
      const group = require('vc/docgroup').create(parent);

      if (arguments.length === 1)
	      group.operation(op);
      else
	      group.operation(
	        this.operation() === 'and' ? 'or' : 'and'
	      );
      group.append(this);
      this.parent(group);
      group.append();
      group.element(); // Init (seems to be necessary)
      parent.root(group);
      return this.parent();
    },


    // Be aware! This may be cyclic
    operators : function (and, or, del) {
      if (arguments === 0)
	      return this._ops;

      this._ops = operatorsClass.create(
	      and, or, del
      );

      this._ops.parent(this);
      return this._ops;
    },


    toJson : function () {
      return {
	      // Unspecified object
	      "@type" : "koral:" + this.ldType()
      };
    },


    rewrites : function () {
      return null;
    },


    incomplete : function () {
      return false;
    },


    toQuery : function () {
      return '';
    }
  };
});
