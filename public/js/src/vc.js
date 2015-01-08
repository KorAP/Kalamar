var KorAP = KorAP || {};

// TODO: Implement a working localization solution!
// TODO: Support 'update' method to update elements on change
// TODO: Implement "toQuery"

/*
  Error codes:
  701: "JSON-LD group has no @type attribute" 
  704: "Operation needs operand list"
  802: "Match type is not supported by value type"
  804: "Unknown value type"
  805: "Value is invalid"
  806: "Value is not a valid date string"
  807: "Value is not a valid regular expression"
  810: "Unknown document group operation" (like 711)
  811: "Document group expects operation" (like 703) 
  812: "Operand not supported in document group" (like 744)
  813: "Collection type is not supported" (like 713)
*/

(function (KorAP) {
  "use strict";

  // Default log message
  KorAP.log = KorAP.log || function (type, msg) {
    console.log(type + ": " + msg);
  };

  KorAP._validStringMatchRE = new RegExp("^(?:eq|ne|contains)$");
  KorAP._validRegexMatchRE  = new RegExp("^(?:eq|ne)$");
  KorAP._validDateMatchRE   = new RegExp("^[lg]?eq$");
  KorAP._validDateRE        = new RegExp("^(?:\\d{4})(?:-\\d\\d(?:-\\d\\d)?)?$");
  KorAP._validGroupOpRE     = new RegExp("^(?:and|or)$");
  KorAP._quote              = new RegExp("([\"\\\\])", 'g');

  var loc   = (KorAP.Locale = KorAP.Locale || {} );
  loc.AND   = loc.AND   || 'and';
  loc.OR    = loc.OR    || 'or';
  loc.DEL   = loc.DEL   || '×';
  loc.EMPTY = loc.EMPTY || '⋯'


  function _bool (bool) {
    return (bool === undefined || bool === false) ? false : true;
  };


  function _removeChildren (node) {
    // Remove everything underneath
    while (node.firstChild)
      node.removeChild(node.firstChild);
  };


  // Add 'or'-criterion
  KorAP._or = function (e) {
    var obj = this.parentNode.refTo;
  };


  // Add 'and'-criterion
  KorAP._and = function (e) {
    var obj = this.parentNode.refTo;
    if (obj.ldType() === 'docGroup') {
      console.log('~~~~~~~~~');
    }
    else if (obj.ldType() === 'doc') {
      obj.parent().newAfter(obj);
    };
  };


  // Remove doc or docGroup
  KorAP._delete = function (e) {
    var obj = this.parentNode.refTo;
    if (obj.parent().ldType() !== null)
      obj.parent().delOperand(obj).update();
    else
      obj.parent().clean();
  };


  /**
   * Virtual Collection
   */
  KorAP.VirtualCollection = {
    ldType : function () {
      return null;
    },

    create : function () {
      return Object.create(KorAP.VirtualCollection);
    },

    clean : function () {
      if (this._root.ldType() !== "non") {
	this._root.destroy();
	this.root(KorAP.UnspecifiedDoc.create(this));
      };
      return this;
    },

    render : function (json) {
      var obj = Object.create(KorAP.VirtualCollection);

      if (json !== undefined) {
	// Root object
	if (json['@type'] == 'korap:doc') {
	  obj._root = KorAP.Doc.create(obj, json);
	}
	else if (json['@type'] == 'korap:docGroup') {
	  obj._root = KorAP.DocGroup.create(obj, json);
	}
	else {
	  KorAP.log(813, "Collection type is not supported");
	  return;
	};
      }

      else {
	// Add unspecified object
	obj._root = KorAP.UnspecifiedDoc.create(obj);
      };

      // Init element and update
      obj.update();

      return obj;
    },

    root : function (obj) {
      if (arguments.length === 1) {
	var e = this.element();
	if (e.firstChild !== null) {
	  if (e.firstChild !== obj.element())
	    e.replaceChild(obj.element(), e.firstChild);
	}

	// Append root element
	else {
	  e.appendChild(obj.element());
	};

	// Update parent child relations
	this._root = obj;
	obj.parent(this);

	this.update();
      };
      return this._root;
    },

    element : function () {
      if (this._element !== undefined)
	return this._element;

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'vc');

      // Initialize root
      this._element.appendChild(this._root.element());

      return this._element;
    },

    update : function () {
      this._root.update();
      return this;
    },

    toJson : function () {
      return this._root.toJson();
    },

    toQuery : function () {
      return this._root.toQuery();
    }
  };


  /**
   * Operators for criteria
   */
  KorAP.Operators = {
    create : function (and, or, del) {
      var op = Object.create(KorAP.Operators);
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
	  document.createTextNode(KorAP.Locale.AND)
	);
	op.appendChild(andE);
      };

      // Add or button
      if (this._or === true) {
	var orE = document.createElement('span');
	orE.setAttribute('class', 'or');
	orE.addEventListener('click', KorAP._or, false);
	orE.appendChild(document.createTextNode(KorAP.Locale.OR));
	op.appendChild(orE);
      };

      // Add delete button
      if (this._del === true) {
	var delE = document.createElement('span');
	delE.setAttribute('class', 'delete');
	delE.appendChild(document.createTextNode(KorAP.Locale.DEL));
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


  /**
   * Unspecified criterion
   */
  KorAP.UnspecifiedDoc = {
    _ldType : "non",
    create : function (parent) {
      var obj = Object.create(KorAP.JsonLD).
	upgradeTo(KorAP.UnspecifiedDoc);

      if (parent !== undefined)
	obj._parent = parent;

      return obj;
    },

    update : function () {

      if (this._element === undefined)
	return this.element();

      // Remove element content
      _removeChildren(this._element);

      var ellipsis = document.createElement('span');
      ellipsis.appendChild(document.createTextNode(loc.EMPTY));
      this._element.appendChild(ellipsis);

      // Set operators
      var op = this.operators(
	false,
	false,
	// No delete object, if this is the root
	(this._parent !== undefined &&
	 this.parent().ldType() !== null) ? true : false
      );

      this._element.appendChild(
	op.element()
      );

      return this.element();
    },

    element : function () {
      if (this._element !== undefined)
	return this._element;
      this._element = document.createElement('div');
      this._element.setAttribute('class', 'doc unspecified');
      this.update();
      return this._element;
    }
  };


  /**
   * Document criterion
   */
  KorAP.Doc = {
    _ldType : "doc",
    _obj : function () { return KorAP.Doc; },

    create : function (parent, json) {
      var obj = Object(KorAP.JsonLD).
	create().
	upgradeTo(KorAP.Doc).
	fromJson(json);

      if (parent !== undefined)
	obj._parent = parent;

      obj._changed = true;
      return obj;
    },

    update : function () {
      if (this._element === undefined)
	return this.element();

      // Get element
      var e = this._element;

      // Check if there is a change
      if (this._changed) {

	// Added key
	var key = document.createElement('span');
	key.setAttribute('class', 'key');
	if (this.key())
	  key.appendChild(document.createTextNode(this.key()));

	// Added match operator
	var matchop = document.createElement('span');
	matchop.setAttribute('data-type', this.type());
	matchop.setAttribute('class', 'match');
	matchop.appendChild(
	  document.createTextNode(this.matchop())
	);

	// Added match operator
	var value = document.createElement('span');
	value.setAttribute('data-type', this.type());
	value.setAttribute('class', 'value');
	if (this.value())
	  value.appendChild(
	    document.createTextNode(this.value())
	  );

	// Remove all element children
	_removeChildren(e);

	// Add spans
	e.appendChild(key);
	e.appendChild(matchop);
	e.appendChild(value);

	this._changed = false;
      };

      if (this._parent !== undefined) {
	// Set operators
	var op = this.operators(
	  true,
	  true,
	  true
	);

	// Append new operators
	e.appendChild(op.element());
      };

      return e;
    },

    element : function () {
      if (this._element !== undefined)
	return this._element;

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'doc');

      this.update();
      return this._element;
    },

    // Wrap a new operation around the doc element
    wrap : function (op) {
/*
      var group = KorAP.DocGroup.create(undefined);
      group.append(this);
      group.append(null);
      this.parent(group);
      var div = document.createElement('div');
      div.setAttribute('data-operation', op);
      var parent = this.element.parent;
      parent.removeChild(this.element);
      parent.appendChild(div);
      div.appendChild(this.element);
      return div;
*/
    },

    // Deserialize from json
    fromJson : function (json) {
      if (json === undefined)
	return this;

      if (json["@type"] !== "korap:doc") {
	KorAP.log(701, "JSON-LD group has no @type attribute");
	return;
      };

      if (json["value"] === undefined ||
	  typeof json["value"] != 'string') {
	KorAP.log(805, "Value is invalid");
	return;
      };

      // There is a defined key
      if (json["key"] !== undefined &&
	  typeof json["key"] === 'string') {

	// Set key
	this.key(json["key"]);

	// Set match operation
	if (json["match"] !== undefined) {
	  if (typeof json["match"] === 'string') {
	    this.matchop(json["match"]);
	  }
	  else {
	    KorAP.log(802, "Match type is not supported by value type");
	    return;
	  };
	};

	// Key is a string
	if (json["type"] === undefined ||
	    json["type"] == "type:string") {
	  this.type("string");

	  // Check match type
	  if (!KorAP._validStringMatchRE.test(this.matchop())) {
	    KorAP.log(802, "Match type is not supported by value type");
	    return;
	  };

	  // Set string value
	  this.value(json["value"]);
	}

	// Key is a date
	else if (json["type"] === "type:date") {
	  this.type("date");

	  if (json["value"] !== undefined &&
	      KorAP._validDateRE.test(json["value"])) {

	    if (!KorAP._validDateMatchRE.test(this.matchop())) {
	      KorAP.log(802, "Match type is not supported by value type");
	      return;
	    };

	    // Set value
	    this.value(json["value"]);
	  }
	  else {
	    KorAP.log(806, "Value is not a valid date string");
	    return;
	  };
	}

	// Key is a regular expression
	else if (json["type"] === "type:regex") {
	  this.type("regex");

	  try {

	    // Try to create a regular expression
	    var check = new RegExp(json["value"]);

	    if (!KorAP._validRegexMatchRE.test(this.matchop())) {
	      KorAP.log(802, "Match type is not supported by value type");
	      return;
	    };

	    this.value(json["value"]);
	  }

	  catch (e) {
	    KorAP.log(807, "Value is not a valid regular expression");
	    return;
	  };
	  this.type("regex");
	}

	else {
	  KorAP.log(804, "Unknown value type");
	  return;
	};
      };

      return this;
    },

    key : function (value) {
      if (arguments.length === 1) {
	this._key = value;
	this._changed = true;
      };
      return this._key;
    },

    matchop : function (match) {
      if (arguments.length === 1) {
	this._matchop = match.replace(/^match:/, '');
	this._changed = true;
      };
      return this._matchop || "eq";
    },

    type : function (type) {
      if (arguments.length === 1) {
	this._type = type;
	this._changed = true;
      };
      return this._type || "string";
    },

    value : function (value) {
      if (arguments.length === 1) {
	this._value = value;
	this._changed = true;
      };
      return this._value;
    },

    toJson : function () {
      if (!this.matchop() || !this.key())
	return {};
      
      return {
	"@type" : "korap:" + this.ldType(),
	"key"   : this.key(),
	"match" : "match:" + this.matchop(),
	"value" : this.value() || '',
	"type"  : "type:" + this.type()
      };
    },

    toQuery : function () {
      if (!this.matchop() || !this.key())
	return "";

      // Build doc string based on key
      var string = this.key() + ' ';

      // Add match operator
      switch (this.matchop()) {
      case "ne":
	string += '!=';
	break;
      case "contains":
	string += '~';
	break;
      case "geq":
	string += 'since';
	break;
      case "leq":
	string += 'until';
	break;
      default:
	string += (this.type() == 'date') ? 'in' : '=';
	break;
      };

      string += ' ';

      // Add value
      switch (this.type()) {
      case "date":
	return string + this.value();
	break;
      case "regex":
	return string + '/' + this.value() + '/';
	break;
      case "string":
	return string + '"' + this.value().replace(KorAP._quote, '\\$1') + '"';
	break;
      };

      return "";
    }
  };


  /**
   * Document group criterion
   */
  KorAP.DocGroup = {
    _ldType : "docGroup",

    create : function (parent, json) {
      var obj = Object.create(KorAP.JsonLD).upgradeTo(KorAP.DocGroup);
      obj._operands = [];
      obj.fromJson(json);
      if (parent !== undefined)
	obj._parent = parent;
      return obj;
    },

    newAfter : function (obj) {
      for (var i in this._operands) {
	if (this._operands[i] === obj) {
	  var operand = KorAP.UnspecifiedDoc.create(this);
	  this._operands.splice(i + 1, 0, operand);
	  return this.update();
	};
      };
    },

    append : function (operand) {

      // Append unspecified object
      if (operand === undefined) {

	// Be aware of cyclic structures!
	operand = KorAP.UnspecifiedDoc.create(this);
	this._operands.push(operand);
	return operand;
      };

      switch (operand["@type"]) {
      case undefined:
	if (operand["ldType"] !== undefined) {
	  if (operand.ldType() !== 'doc' &&
	      operand.ldType() !== 'docGroup') {
	    KorAP.log(812, "Operand not supported in document group");
	    return;
	  };
	  // Be aware of cyclic structures!
	  operand.parent(this);
	  this._operands.push(operand);
	  return operand;
	};

	KorAP.log(701, "JSON-LD group has no @type attribute");
	return;

      case "korap:doc":
	// Be aware of cyclic structures!
	var doc = KorAP.Doc.create(this, operand);
	if (doc === undefined)
	  return;
	this._operands.push(doc);
	return doc;

      case "korap:docGroup":
	// Be aware of cyclic structures!
	var docGroup = KorAP.DocGroup.create(this, operand);
	if (docGroup === undefined)
	  return;
	this._operands.push(docGroup);
	return docGroup;

      default:
	KorAP.log(812, "Operand not supported in document group");
	return;
      };
    },

    update : function () {
      // There is only one operand in group
      if (this._operands.length === 1) {
	var parent = this.parent();
	var op = this.getOperand(0);

	// This will prevent destruction of
	// the operand
	this._operands = [];

	// Parent is a group
	if (parent.ldType() !== null) {
	  return parent.replaceOperand(this, op).update();
	}

	// Parent is vc
	else {
	  this.destroy();
	  // Cyclic madness
	  parent.root(op);
	  op.parent(parent);
	  return parent.root();
	};
      };

      if (this._element === undefined)
	return this;

      var group = this._element;
      group.setAttribute('data-operation', this.operation());

      _removeChildren(group);

      // Append operands
      for (var i in this._operands) {
	group.appendChild(
	  this.getOperand(i).element()
	);
      };

      // Set operators
      var op = this.operators(
	this.operation() == 'and' ? false : true,
	this.operation() == 'or'  ? false : true,
	true
      );

      group.appendChild(
	op.element()
      );

      return this;
    },

    element : function () {
      if (this._element !== undefined)
	return this._element;

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'docGroup');

      // Update the object - including optimization
      this.update();

      return this._element;
    },

    operation : function (op) {
      if (arguments.length === 1) {
	if (KorAP._validGroupOpRE.test(op)) {
	  this._op = op;
	}
	else {
	  KorAP.log(810, "Unknown operation type");
	  return;
	};
      };
      return this._op || 'and';
    },

    operands : function () {
      return this._operands;
    },

    getOperand : function (index) {
      return this._operands[index];
    },

    // Replace operand
    replaceOperand : function (oldOp, newOp) {

      for (var i in this._operands) {
	if (this._operands[i] === oldOp) {

	  // Just insert a doc
	  if (newOp.ldType() === "doc") {
	    this._operands[i] = newOp;
	    newOp.parent(this);
	  }
	  // Insert a group of a different operation
	  // (i.e. "and" in "or"/"or" in "and")
	  else if (newOp.operation() != this.operation()) {
	    this._operands[i] = newOp;
	    newOp.parent(this);
	  }

	  // Flatten the group
	  else {
	    // Remove old group
	    this._operands.splice(i, 1);

	    // Inject new operands
	    for (var op in newOp.operands().reverse()) {
	      this._operands.splice(i, 0, newOp.getOperand(op));
	      newOp.getOperand(0).parent(this);
	    };
	    // Prevent destruction of operands
	    newOp._operands = [];
	    newOp.destroy();
	  };
	  oldOp.destroy();
	  return this;
	}
      };
      return false;
    },

    // Delete operand from group
    delOperand : function (obj) {
      for (var i in this._operands) {
	if (this._operands[i] === obj) {

	  // Delete identified operand
	  this._operands.splice(i,1);

	  // Destroy object for cyclic references
	  obj.destroy();

	  return this;
	};
      };

      // Operand not found
      return undefined;
    },

    // Deserialize from json
    fromJson : function (json) {
      if (json === undefined)
	return this;

      if (json["@type"] !== "korap:docGroup") {
	KorAP.log(701, "JSON-LD group has no @type attribute");
	return;
      };

      if (json["operation"] === undefined ||
	  typeof json["operation"] !== 'string') {
	KorAP.log(811, "Document group expects operation");
	return;
      };

      var operation = json["operation"];

      this.operation(operation.replace(/^operation:/,''));

      if (json["operands"] === undefined ||
	  !(json["operands"] instanceof Array)) {
	KorAP.log(704, "Operation needs operand list")
	return;
      };

      // Add all documents
      for (var i in json["operands"]) {
	var operand = json["operands"][i];
	this.append(operand);
      };
    
      return this;
    },

    toJson : function () {
      var opArray = new Array();
      for (var i in this._operands) {
	opArray.push(this._operands[i].toJson());
      };
      return {
	"@type"     : "korap:" + this.ldType(),
	"operation" : "operation:" + this.operation(),
	"operands"  : opArray
      };
    },

    toQuery : function () {
      return this._operands.
	map(function (op) {
	  return (op.ldType() === 'docGroup') ?
	    '(' + op.toQuery() + ')' :
	    op.toQuery();
	}).join(this.operation() === 'or' ? ' | ' : ' & ')
    }
  };


  /**
   * Abstract JsonLD criterion object
   */
  KorAP.JsonLD = {
    _changed : false,

    create : function () {
      return Object.create(KorAP.JsonLD);
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
	this._changed = true;
      };
      return this._parent;
    },

    // Destroy object - especially for
    // acyclic structures!
    // I'm a paranoid chicken!
    destroy : function () {
      if (this._ops != undefined) {
	this._ops._parent = undefined;
	if (this._ops._element !== undefined)
	  this._ops._element.refTo = undefined;
	this._ops = undefined;
      };
      if (this._element !== undefined)
	this._element = undefined;

      // In case of a group, destroy all operands
      if (this._operands !== undefined) {
	for (var i in this._operands)
	  this.getOperand(i).destroy();
	this._operands = [];
      };
    },

    // Be aware! This may be cyclic
    operators : function (and, or, del) {
      if (arguments === 0)
	return this._ops;
      this._ops = KorAP.Operators.create(
	and, or, del
      );
      this._ops.parent(this);
      return this._ops;
    },

    toJson : function () {
      return {
	// Unspecified object
	"@type" : "korap:" + this.ldType()
      };
    },

    toQuery : function () {
      return loc.EMPTY;
    }
  };
 
}(this.KorAP));
