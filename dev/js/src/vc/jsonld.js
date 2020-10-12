/**
 * Abstract JsonLD criterion object
 */
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
      for (var prop in props) {
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
      
      if (this._ops != undefined) {
	      this._ops._parent = undefined;
	      if (this._ops._element !== undefined) {
	        this._ops._element.refTo = undefined;
        };
	      this._ops = undefined;
      };

      if (this._element !== undefined)
	      this._element = undefined;
      
      // In case of a group, destroy all operands
      if (this._operands !== undefined) {
        this._operands.forEach(i => i.destroy());
	      this._operands = [];
      };
    },
    
    // Wrap a new operation around the root group element 
    wrapOnRoot : function (op) {
      var parent = this.parent();
      
      var group = require('vc/docgroup').create(parent);
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
