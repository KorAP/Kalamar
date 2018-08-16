/**
 * Operators for criteria
 */
define(['buttongroup'], function (buttonGroupClass) {

  const loc = KorAP.Locale;
  loc.DEL   = loc.DEL   || '×';


  // Utility for analysing boolean values
  function _bool (bool) {
    return (bool === undefined || bool === null || bool === false) ? false : true;
  };


  // Add new unspecified document
  function _add (obj, type) {
    var parent = obj.parent();

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
    else if (obj.ldType() === 'doc' || obj.ldType() === 'docGroupRef') {

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

      // Clear button group
      this.clear();

      if (this._and === true) {
        this.add(loc.AND, ['and'], KorAP._and);
      };

      // Add or button
      if (this._or === true) {
        this.add(loc.OR, ['or'], KorAP._or);
      };

      // Add delete button
      if (this._del === true) {
        this.add(loc.DEL, ['delete'], KorAP._delete);
      };

      return this.element();
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
