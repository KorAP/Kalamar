/**
 * Operators for criteria
 */
define(['util'], function () {

  var loc = KorAP.Locale;
  loc.AND   = loc.AND   || 'and';
  loc.OR    = loc.OR    || 'or';
  loc.DEL   = loc.DEL   || '×';


  // Utility for analysing boolean values
  function _bool (bool) {
    return (bool === undefined || bool === null || bool === false) ? false : true;
  };


  // Add new unspecified document
  function _add (obj, type) {
    var ref = obj.parentNode.refTo;
    var parent = ref.parent();

    if (ref.ldType() === 'docGroup') {

      // Check that the action differs from the type
      if (ref.operation() === type)
	return;

      if (parent.ldType() !== null) {
	return parent.newAfter(ref);
      }
      else {
	// The group is on root - wrap
	return ref.wrapOnRoot();
      };
    }
    else if (ref.ldType() === 'doc') {

      if (parent.ldType() === null) {
	return ref.wrapOnRoot(type);
      }
      else if (parent.operation() === type) {
	return parent.newAfter(ref);
      }
      else {
	return ref.wrap(type);
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
    var ref = this.parentNode.refTo;
    if (ref.parent().ldType() !== null) {
      return ref.parent().delOperand(ref).update();
    }
    else {
      ref.parent().clean();
    };
  };


  return {
    create : function (and, or, del) {
      var op = Object.create(this);
      op.and(and);
      op.or(or);
      op.del(del);
      return op;
    },

    update : function () {
      // Init the element
      if (this._element === undefined)
	return this.element();

      var op = this._element;

      op.refTo = this.parent();

      // Remove everything underneath
      _removeChildren(op);
      
      // Add and button
      if (this._and === true) {
	var andE = document.createElement('span');
	andE.setAttribute('class', 'and');
	andE.addEventListener('click', KorAP._and, false);
	andE.appendChild(
	  document.createTextNode(loc.AND)
	);
	op.appendChild(andE);
      };

      // Add or button
      if (this._or === true) {
	var orE = document.createElement('span');
	orE.setAttribute('class', 'or');
	orE.addEventListener('click', KorAP._or, false);
	orE.appendChild(document.createTextNode(loc.OR));
	op.appendChild(orE);
      };

      // Add delete button
      if (this._del === true) {
	var delE = document.createElement('span');
	delE.setAttribute('class', 'delete');
	delE.appendChild(document.createTextNode(loc.DEL));
	delE.addEventListener('click', KorAP._delete, false);
	op.appendChild(delE);
      };

      return op;
    },

    // Be aware! This may be cyclic
    parent : function (obj) {
      if (arguments.length === 1)
	this._parent = obj;
      return this._parent;
    },

    element : function () {

      // Return existing element
      if (this._element !== undefined)
	return this._element;

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'operators');

      // Init elements
      this.update();
      return this._element;
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
