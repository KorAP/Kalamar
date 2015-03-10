/**
 * Create virtual collections with a visual user interface.
 *
 * @author Nils Diewald
 */
/*
 * Replaces a previous version written by Mengfei Zhou
 */
var KorAP = KorAP || {};

// Requires menu.js

/*
  TODO: Implement a working localization solution!
  TODO: Disable "and" or "or" in case it's followed
        by an unspecified document

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
  814: "Unknown rewrite operation"
  815: "Rewrite expects source"
*/

(function (KorAP) {
  "use strict";

  // Default log message
  KorAP.log = KorAP.log || function (type, msg) {
    console.log(type + ": " + msg);
  };

  KorAP._validStringMatchRE = new RegExp("^(?:eq|ne|contains|excludes)$");
  KorAP._validRegexMatchRE  = new RegExp("^(?:eq|ne)$");
  KorAP._validDateMatchRE   = new RegExp("^[lg]?eq$");
  KorAP._validDateRE        = new RegExp("^(?:\\d{4})(?:-\\d\\d(?:-\\d\\d)?)?$");
  KorAP._validGroupOpRE     = new RegExp("^(?:and|or)$");
  KorAP._validRewriteOpRE   = new RegExp("^(?:injec|modifica)tion$");
  KorAP._quote              = new RegExp("([\"\\\\])", 'g');

  // Localization values
  var loc   = (KorAP.Locale = KorAP.Locale || {} );
  loc.AND   = loc.AND   || 'and';
  loc.OR    = loc.OR    || 'or';
  loc.DEL   = loc.DEL   || '×';
  loc.EMPTY = loc.EMPTY || '⋯'

  // Utility for analysing boolean values
  function _bool (bool) {
    return (bool === undefined || bool === null || bool === false) ? false : true;
  };


  // Utility for removing all children of a node
  function _removeChildren (node) {
    // Remove everything underneath
    while (node.firstChild)
      node.removeChild(node.firstChild);
  };


  // Add new unspecified document
  KorAP._add = function (obj, type) {
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
    return KorAP._add(this, 'and');
  };


  // Add doc with 'or' relation
  KorAP._or = function () {
    return KorAP._add(this, 'or');
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
	if (json['@type'] == 'koral:doc') {
	  obj._root = KorAP.Doc.create(obj, json);
	}
	else if (json['@type'] == 'koral:docGroup') {
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
	  if (e.firstChild !== obj.element()) {
	    e.replaceChild(obj.element(), e.firstChild);
	  };
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

    // Set key - replace
    key : function (v) {

      // Not replaceable
      if (this._parent === undefined)
	return null;

      // Set JSON-LD type
      var newDoc = KorAP.Doc.create(this._parent, {
	"@type" : "koral:doc",
	"value" : "",
	"key"   : v
      });

      // Unspecified document on root
      if (this._parent.ldType() === null) {
	this._parent.root(newDoc);
	this.destroy();
      }

      // Unspecified document in group
      else {
	this._parent.replaceOperand(this, newDoc);
      };
      this._parent.update();
      return newDoc;
    },

    update : function () {

      if (this._element === undefined)
	return this.element();

      // Remove element content
      _removeChildren(this._element);

      var ellipsis = document.createElement('span');
      ellipsis.appendChild(document.createTextNode(loc.EMPTY));
      this._element.appendChild(ellipsis);

      // Set ref - TODO: Cleanup!
      this._element.refTo = this;

      // Set operators
      if (this._parent !== undefined && this.parent().ldType() !== null) {
	var op = this.operators(
	  false,
	  false,
	  true
	);

	this._element.appendChild(
	  op.element()
	);
      };

      return this.element();
    },

    element : function () {
      if (this._element !== undefined)
	return this._element;
      this._element = document.createElement('div');
      this._element.setAttribute('class', 'doc unspecified');
      this.update();
      return this._element;
    },

    
  };


  /**
   * Document criterion
   */
  KorAP.Doc = {
    _ldType : "doc",
    _obj : function () { return KorAP.Doc },

    create : function (parent, json) {
      var obj = Object(KorAP.JsonLD).
	create().
	upgradeTo(KorAP.Doc).
	fromJson(json);

      if (parent !== undefined)
	obj._parent = parent;

      obj.__changed = true;
      return obj;
    },

    update : function () {
      if (this._element === undefined)
	return this.element();

      // Get element
      var e = this._element;

      // Set ref - TODO: Cleanup!
      e.refTo = this;

      // Check if there is a change
      if (this.__changed) {

	// Was rewritten
	if (this.rewrites() !== undefined) {
	  e.classList.add("rewritten");
	};

	// Added key
	var key = document.createElement('span');
	key.setAttribute('class', 'key');

	// Change key
	key.addEventListener('click', KorAP._changeKey, false);

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

	this.__changed = false;
      };

      if (this._rewrites !== undefined) {
	e.appendChild(this._rewrites.element());
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
      var parent = this.parent();
      var group = KorAP.DocGroup.create(parent);
      group.operation(op);
      group.append(this);
      group.append();
      return parent.replaceOperand(this, group).update();
    },

    // Deserialize from json
    fromJson : function (json) {
      if (json === undefined)
	return this;

      if (json["@type"] === undefined) {
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

      if (json["rewrites"] !== undefined) {
	this._rewrites = KorAP.RewriteList.create(json["rewrites"]);
      };
	
      return this;
    },

    key : function (value) {
      if (arguments.length === 1) {
	this._key = value;
	this._changed();
	return this;
      };
      return this._key;
    },

    matchop : function (match) {
      if (arguments.length === 1) {
	this._matchop = match.replace(/^match:/, '');
	this._changed();
	return this;
      };
      return this._matchop || "eq";
    },

    type : function (type) {
      if (arguments.length === 1) {
	this._type = type;
	this._changed();
	return this;
      };
      return this._type || "string";
    },

    value : function (value) {
      if (arguments.length === 1) {
	this._value = value;
	this._changed();
	return this;
      };
      return this._value;
    },

    rewrites : function () {
      return this._rewrites;
    },

    _changed : function () {
      this.__changed = true;

      if (this._rewrites === undefined)
	return;
      delete this["_rewrites"];
      if (this._element === undefined)
	return;
      this._element.classList.remove("rewritten");
    },

    toJson : function () {
      if (!this.matchop() || !this.key())
	return {};
      
      return {
	"@type" : "koral:" + this.ldType(),
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
      case "excludes":
	string += '!~';
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
      for (var i = 0; i < this._operands.length; i++) {
	if (this._operands[i] === obj) {
	  var operand = KorAP.UnspecifiedDoc.create(this);
	  this._operands.splice(i + 1, 0, operand);
	  return this.update();
	};
      };
    },

    // The doc is already set in the group
    _duplicate : function (operand) {
      if (operand.ldType() !== 'doc')
	return null;

      for (var i = 0; i < this._operands.length; i++) {
	var op = this.getOperand(i);
	if (op.ldType() === 'doc'
	    && operand.key() === op.key()
	    && operand.matchop() === op.matchop()
	    && operand.value() === op.value()) {
	  return op;
	};
      };
      return null;
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
	// No @type defined
	if (operand["ldType"] !== undefined) {
	  if (operand.ldType() !== 'doc' &&
	      operand.ldType() !== 'docGroup') {
	    KorAP.log(812, "Operand not supported in document group");
	    return;
	  };
	  // Be aware of cyclic structures!
	  operand.parent(this);

	  var dupl = this._duplicate(operand);
	  if (dupl === null) {
	    this._operands.push(operand);
	    return operand;
	  };
	  return dupl;
	};

	KorAP.log(701, "JSON-LD group has no @type attribute");
	return;

      case "koral:doc":
	// Be aware of cyclic structures!
	var doc = KorAP.Doc.create(this, operand);
	if (doc === undefined)
	  return;
	var dupl = this._duplicate(doc);
	if (dupl === null) {
	  this._operands.push(doc);
	  return doc;
	};
	return dupl;

      case "koral:docGroup":
	// Be aware of cyclic structures!
	var docGroup = KorAP.DocGroup.create(this, operand);
	if (docGroup === undefined)
	  return;

	// Flatten group
	if (docGroup.operation() === this.operation()) {
	  for (var op in docGroup.operands()) {
	    op = docGroup.getOperand(op);
	    var dupl = this._duplicate(op);
	    if (dupl === null) {
	      this._operands.push(op);
	      op.parent(this);
	    };
	  };
	  docGroup._operands = [];
	  docGroup.destroy();
	  return this;
	};
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
	if (parent.ldType() !== null)
	  return parent.replaceOperand(this, op).update();

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
      for (var i = 0; i < this._operands.length; i++) {
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

      for (var i = 0; i < this._operands.length; i++) {
	if (this._operands[i] === oldOp) {

	  // Just insert a doc or ...
	  if (newOp.ldType() === "doc" ||
	      newOp.ldType() === "non" ||
	      // ... insert a group of a different operation
	      // (i.e. "and" in "or"/"or" in "and")
	      newOp.operation() != this.operation()) {
	    this._operands[i] = newOp;
	    newOp.parent(this);
	  }

	  // Flatten group
	  else {
	    // Remove old group
	    this._operands.splice(i, 1);

	    // Inject new operands
	    for (var op in newOp.operands().reverse()) {
	      op = newOp.getOperand(op);
	      this._operands.splice(i, 0, op);
	      op.parent(this);
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
      for (var i = 0; i < this._operands.length; i++) {
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

      if (json["@type"] === undefined) {
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
      for (var i = 0; i < this._operands.length; i++) {
	if (this._operands[i].ldType() !== 'non')
	  opArray.push(this._operands[i].toJson());
      };
      return {
	"@type"     : "koral:" + this.ldType(),
	"operation" : "operation:" + this.operation(),
	"operands"  : opArray
      };
    },

    toQuery : function (brackets) {
      var list = this._operands
	.filter(function (op) {
	  return op.ldType() !== 'non';
	})
	.map(function (op) {
	  return (op.ldType() === 'docGroup') ?
	    op.toQuery(true) :
	    op.toQuery();
	});

      if (list.length === 1)
	return list.join('');
      else {
	var str = list.join(this.operation() === 'or' ? ' | ' : ' & ');
	return brackets ? '(' + str + ')' : str;
      };
    }
  };


  KorAP.RewriteList = {
    // Construction method
    create : function (json) {
      var obj = Object(KorAP.JsonLD).
	create().
	upgradeTo(KorAP.RewriteList).
	fromJson(json);
      return obj;
    },
    fromJson : function (json) {
      this._list = new Array();
      for (var i = 0; i < json.length; i++) {
	this._list.push(
	  KorAP.Rewrite.create(json[i])
	);
      };
      return this;
    },
    element : function () {
      if (this._element !== undefined)
	return this._element;

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'rewrite');
      for (var x in this._list) {
	var rewrite = this._list[x];
	var span = document.createElement('span');

	// Set class attribute
	span.setAttribute('class', rewrite.operation());

	// Append source information
	span.appendChild(document.createTextNode(rewrite.src()));

	// Append scope information
	if (rewrite.scope() !== undefined) {
	  span.appendChild(
	    document.createTextNode(
	      ': ' + rewrite.scope()
	    )
	  );
	};
	this._element.appendChild(span);
      };
      return this._element;
    }
  };


  /**
   * Implementation of rewrite objects.
   */
  KorAP.Rewrite = {

    // Construction method
    create : function (json) {
      var obj = Object(KorAP.JsonLD).
	create().
	upgradeTo(KorAP.Rewrite).
	fromJson(json);
      return obj;
    },

    // Get or set source
    src : function (string) {
      if (arguments.length === 1)
	this._src = string;
      return this._src;
    },
    
    // Get or set operation
    operation : function (op) {
      if (arguments.length === 1) {
	if (KorAP._validRewriteOpRE.test(op)) {
	  this._op = op;
	}
	else {
	  KorAP.log(814, "Unknown rewrite operation");
	  return;
	};
      };
      return this._op || 'injection';
    },

    // Get or set scope
    scope : function (attr) {
      if (arguments.length === 1)
	this._scope = attr;
      return this._scope;
    },

    // Serialize from Json
    fromJson : function (json) {
      if (json === undefined)
	return this;

      // Missing @type
      if (json["@type"] === undefined) {
	KorAP.log(701, "JSON-LD group has no @type attribute");
	return;
      };

      // Missing source
      if (json["src"] === undefined ||
	 typeof json["src"] !== 'string') {
	KorAP.log(815, "Rewrite expects source");
	return;
      };

      // Set source
      this.src(json["src"]);

      // Set operation
      if (json["operation"] !== undefined) {
	var operation = json["operation"];
	this.operation(operation.replace(/^operation:/,''));
      };

      // Set scope
      if (json["scope"] !== undefined &&
	  typeof json["scope"] === 'string')
	this.scope(json["scope"]);

      return this;
    },

    toString : function () {
      var str = '';
      var op = this.operation();
      str += op.charAt(0).toUpperCase() + op.slice(1);
      str += ' of ' + (
	this._scope === null ?
	  'object' :
	  '"' +
	  this.scope().replace(KorAP._quote, '\\$1') +
	  '"'
      );
      str += ' by ' +
	'"' +
	this.src().replace(KorAP._quote, '\\$1') +
	'"';
      return str;
    }
  };


  /**
   * Abstract JsonLD criterion object
   */
  KorAP.JsonLD = {
    __changed : false,

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
	if (this._ops._element !== undefined)
	  this._ops._element.refTo = undefined;
	this._ops = undefined;
      };
      if (this._element !== undefined)
	this._element = undefined;

      // In case of a group, destroy all operands
      if (this._operands !== undefined) {
      for (var i = 0; i < this._operands.length; i++)
	  this.getOperand(i).destroy();
	this._operands = [];
      };
    },

    // Wrap a new operation around the root group element 
    wrapOnRoot : function (op) {
      var parent = this.parent();

      var group = KorAP.DocGroup.create(parent);
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
      this._ops = KorAP.Operators.create(
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

    toQuery : function () {
      return '';
    }
  };


  /**
   * Criterion in a KorAP.Doc
   */
  KorAP._changeKey = function () {
    var doc = this.parentNode.refTo;
    var key = doc.element().firstChild;
    key.appendChild(KorAP.FieldChooser.element());
    KorAP.FieldChooser.show();
    KorAP.FieldChooser.focus();
    // key, matchop, type, value
  };
  
  // Field menu
  KorAP.FieldMenu = {
    create : function (params) {
      return Object.create(KorAP.Menu)
	.upgradeTo(KorAP.FieldMenu)
	._init(KorAP.FieldMenuItem, undefined, params)
    }
  };


  // Field menu item
  KorAP.FieldMenuItem = {
    create : function (params) {
      return Object.create(KorAP.MenuItem)
	.upgradeTo(KorAP.FieldMenuItem)
	._init(params);
    },
    _init : function (params) {
      if (params[0] === undefined)
	throw new Error("Missing parameters");

      this._name  = params[0];
      this._value = params[1];
      this._type  = params[2];

      this._lcField = ' ' + this._name.toLowerCase();

      return this;
    },
    name : function () {
      return this._name;
    },
    type : function () {
      return this._type;
    },
    element : function () {
      // already defined
      if (this._element !== undefined)
	return this._element;

      // Create list item
      var li = document.createElement("li");
      li.setAttribute("data-type", this._type);
      li.setAttribute("data-value", this._value);
      li.appendChild(document.createTextNode(this._name));
      return this._element = li;
    }
  };

  KorAP.FieldChooser = KorAP.FieldMenu.create([
    ['Titel', 'title', 'string'],
    ['Untertitel', 'subTitle', 'string'],
    ['Veröffentlichungsdatum', 'pubDate', 'date'],
    ['Autor', 'author', 'string']
  ]);
  KorAP.FieldChooser.limit(5);
 
}(this.KorAP));
