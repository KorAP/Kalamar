/**
 * Operators for criteria
 */
"use strict";

define(['buttongroup'], function (buttonGroupClass) {

  const loc = KorAP.Locale;
  loc.DEL   = loc.DEL   || '×';

  // Utility for analysing boolean values
  function _bool (bool) {
    return (
      bool === undefined ||
        bool === null ||
        bool === false) ? false : true;
  };


  // Add new unspecified document
  function _add (obj, type) {
    const parent = obj.parent();

    if (obj.ldType() === 'docGroup') {

      // Check that the action differs from the type
      if (obj.operation() === type)
	      return;

      if (parent.ldType() !== null) {
	      return parent.newAfter(obj);
      }

      else {
	      // The group is on root - wrap
	      return obj.wrapOnRoot();
      };
    }

    else if (obj.ldType() === 'doc' ||
             obj.ldType() === 'docGroupRef') {

      if (parent.ldType() === null) {
	      return obj.wrapOnRoot(type);
      }

      else if (parent.operation() === type) {
	      return parent.newAfter(obj);
      }

      else {
	      return obj.wrap(type);
      };
    };
  };


  // Add doc with 'and' relation
  KorAP._and = function () {
    return _add(this, 'and');
  };


  // Add doc with 'or' relation
  KorAP._or = function () {
    return _add(this, 'or');
  };


  // Remove doc or docGroup
  KorAP._delete = function () {
    if (this.parent().ldType() !== null) {
      return this.parent().delOperand(this).update();
    }
    else {
      this.parent().clean();
    };
  };


  return {
    create : function (and, or, del) {
      
      // Inherit from buttonGroupClass
      var op = Object(buttonGroupClass).create(['operators']).upgradeTo(this);
      op.and(and);
      op.or(or);
      op.del(del);
      op.update();

      return op;
    },


    /*
     * Update the element
     */
    update : function () {
      const t = this;

      // Clear button group
      t.clear();

      if (t._and === true) {
        t.add(loc.AND, {'cls':['and']}, KorAP._and);
      };

      // Add or button
      if (t._or === true) {
        t.add(loc.OR, {'cls':['or']}, KorAP._or);
      };

      // Add delete button
      if (t._del === true) {
        t.add(loc.DEL, {'cls':['delete']}, KorAP._delete);
      };

      return t.element();
    },


    // Be aware! This may be cyclic
    // This is somehow redundant with bind, but relevant for ldTypes
    parent : function (obj) {
      if (arguments.length === 1) {
	      this._parent = obj;

        // This is somehow duplicate - but it's not that relevant
        this.bind(obj);
      };

      return this._parent;
    },


    and : function (bool) {
      if (arguments.length === 1)
	      this._and = _bool(bool);
      return this._and;
    },


    or : function (bool) {
      if (arguments.length === 1)
	      this._or = _bool(bool);
      return this._or;
    },


    del : function (bool) {
      if (arguments.length === 1)
	      this._del = _bool(bool);
      return this._del;
    }
  };
});
