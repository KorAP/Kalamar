var KorAP = KorAP || {};

// Todo: Implement a working localization solution!
// Todo: Refactor out the distinction between DocElement and Doc,
//       DocGroupElement and DocGroup

/*
 * Error codes:
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


/*
  - TODO: Support 'update' method to update elements on change
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

  var loc = (KorAP.Locale = KorAP.Locale || {} );
  loc.AND = loc.AND || 'and';
  loc.OR  = loc.OR  || 'or';
  loc.DEL = loc.DEL || '×';

  KorAP.VirtualCollection = {
    _root : undefined,
    create : function () {
      return Object.create(KorAP.VirtualCollection);
    },
    render : function (json) {
      var obj = Object.create(KorAP.VirtualCollection);

      if (json !== undefined) {
	// Root object
	if (json['@type'] == 'korap:doc') {
	  obj._root = KorAP.DocElement.create(undefined, json);
	}
	else if (json['@type'] == 'korap:docGroup') {
	  obj._root = KorAP.DocGroupElement.create(undefined, json);
	}
	else {
	  KorAP.log(813, "Collection type is not supported");
	  return;
	};
      }

      else {
	// Add unspecified object
	obj._root = KorAP.UnspecifiedDocElement.create();
      };

      // Add root element to root node
      obj.element().appendChild(
	obj._root.element()
      );

      return obj;
    },
    root : function () {
      return this._root;
    },
    element : function () {
      if (this._element !== undefined)
	return this._element;

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'vc');
      return this._element;
    }
  };

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

      // Remove everything underneath
      while (op.firstChild) {
	op.removeChild(op.firstChild);
      };

      // Add and button
      if (this._and === true) {
	var andE = document.createElement('span');
	andE.setAttribute('class', 'and');
	andE.appendChild(document.createTextNode(KorAP.Locale.AND));
	op.appendChild(andE);
      };

      // Add or button
      if (this._or === true) {
	var orE = document.createElement('span');
	orE.setAttribute('class', 'or');
	orE.appendChild(document.createTextNode(KorAP.Locale.OR));
	op.appendChild(orE);
      };

      // Add delete button
      if (this._del === true) {
	var delE = document.createElement('span');
	delE.setAttribute('class', 'delete');
	delE.appendChild(document.createTextNode(KorAP.Locale.DEL));
	op.appendChild(delE);
      };
      return true;
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
	this._and = (bool === undefined || bool === false) ? false : true;
      return this._and;
    },
    or : function (bool) {
      if (arguments.length === 1)
	this._or = (bool === undefined || bool === false) ? false : true;
      return this._or;
    },
    del : function (bool) {
      if (arguments.length === 1)
	this._del = (bool === undefined || bool === false) ? false : true;
      return this._del;
    }
  };


  /**
   * Unspecified criterion
   */
  KorAP.UnspecifiedDocElement = {
    _obj : function () { return KorAP.UnspecifiedDocElement; },
    _objType : 'UnspecifiedDocElement',
    create : function (parent) {
      var obj = Object.create(KorAP.JsonLD).extend(KorAP.UnspecifiedDocElement);
      if (parent !== undefined)
	obj._parent = parent;
      return obj;
    },
    element : function () {
      if (this._element !== undefined)
	return this._element;
      this._element = document.createElement('div');
      this._element.setAttribute('class', 'undefined');
      return this._element;
    }
  };


  KorAP.DocElement = {
    _obj : function () { return KorAP.DocElement; },
    _objType : 'DocElement',

    create : function (parent, json) {
      var obj = KorAP.Doc.create().extend(KorAP.DocElement).fromJson(json);
      if (parent !== undefined)
	obj._parent = parent;
      return obj;
    },
    element : function () {
      if (this._element !== undefined)
	return this._element;

      this._element = document.createElement('div');
      var e = this._element;
      e.setAttribute('class', 'doc');

      // Added key
      var key = document.createElement('span');
      key.setAttribute('class', 'key');
      if (this.key())
	key.appendChild(document.createTextNode(this.key()));

      // Added match operator
      var matchop = document.createElement('span');
      matchop.setAttribute('data-type', this.type());
      matchop.setAttribute('class', 'match');
      matchop.appendChild(document.createTextNode(this.matchop()));

      // Added match operator
      var value = document.createElement('span');
      value.setAttribute('data-type', this.type());
      value.setAttribute('class', 'value');
      if (this.value())
	value.appendChild(document.createTextNode(this.value()));

      // Add spans
      e.appendChild(key);
      e.appendChild(matchop);
      e.appendChild(value);
      return e;
    },

    // parent, element
    // Wrap a new operation around the doc element
    wrap : function (op) {
      var group = KorAP.DocGroupElement.create(undefined);
      group.appendOperand(this);
      group.appendOperand(null);
      this.parent(group);
/*
      var div = document.createElement('div');
      div.setAttribute('data-operation', op);
      var parent = this.element.parent;
      parent.removeChild(this.element);
      parent.appendChild(div);
      div.appendChild(this.element);
      return div;
*/
    }
  };

  KorAP.DocGroupElement = {
    _obj : function () { return KorAP.DocGroupElement; },
    _objType : 'DocGroupElement',

    create : function (parent, json) {
      var obj = KorAP.DocGroup.create().extend(KorAP.DocGroupElement).fromJson(json);
      if (parent !== undefined)
	obj._parent = parent;
      return obj;
    },
    appendOperand : function (operand) {
      switch (operand["@type"]) {
      case undefined:
	if (operand["objType"]) {
	  if (operand.objType() === 'Doc') {
	    operand = operand.upgrade(KorAP.DocElement);
	  }
	  else if (operand.objType() === 'DocGroup') {
	    operand = operand.upgrade(KorAP.DocElementGroup);
	  }
	  else if (operand.objType() !== 'DocElement' &&
		   operand.objType() !== 'DocElementGroup') {
	    KorAP.log(812, "Operand not supported in document group");
	    return;
	  };
	  this._operands.push(operand);
	  return operand;
	};

	KorAP.log(701, "JSON-LD group has no @type attribute");
	return;

      case "korap:doc":
	var doc = KorAP.DocElement.create().fromJson(operand);
	if (doc === undefined)
	  return;
	this._operands.push(doc);
	return doc;

      case "korap:docGroup":
	var docGroup = KorAP.DocGroupElement.create().fromJson(operand);
	if (docGroup === undefined)
	  return;
	this._operands.push(docGroup);
	return docGroup;

      default:
	KorAP.log(812, "Operand not supported in document group");
	return;
      };
    },
    element : function () {
      if (this._element !== undefined)
	return this._element;

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'docGroup');
      this._element.setAttribute('data-operation', this.operation());

      for (var i in this.operands()) {
	this._element.appendChild(
	  this.getOperand(i).element()
	);
      };

      return this._element;
    },
  };


  // Abstract JsonLD object
  KorAP.JsonLD = {
    _obj : function () { return KorAP.JsonLD; },
    _objType : 'JsonLD',
    create : function () {
      return Object.create(KorAP.JsonLD);
    },

    // Extend this object with another object
    // Private data will be lost
    extend : function (props) {
      var jld = this._obj().create();
      for (var prop in props) {
	jld[prop] = props[prop];
      };
      return jld;
    },

    // Upgrade this object to another object
    // Private data stays intact
    upgrade : function (props) {
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
    objType : function () {
      return this._objType;
    },
    parent : function (obj) {
      if (arguments.length === 1)
	this._parent = obj;
      return this._parent;
    }
  };


  KorAP.DocGroup = {
    _ldType : "docGroup",
    _obj : function () { return KorAP.DocGroup; },
    _objType : 'DocGroup',
    create : function (type) {
      var docGroup = Object.create(KorAP.JsonLD).extend(KorAP.DocGroup);
      if (type !== undefined)
	docGroup.operation(type);
      docGroup._operands = [];
      return docGroup;
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
	this.appendOperand(operand);
      };
    
      return this;
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
    appendOperand : function (operand) {
      switch (operand["@type"]) {
      case undefined:
	if (operand["objType"] && (
	  operand.objType() === 'Doc' ||
	    operand.objType() === 'DocGroup')) {
	  this._operands.push(operand);
	  return operand;
	};
	KorAP.log(701, "JSON-LD group has no @type attribute");
	return;

      case "korap:doc":
	var doc = KorAP.Doc.create().fromJson(operand);
	if (doc === undefined)
	  return;
	this._operands.push(doc);
	return doc;

      case "korap:docGroup":
	var docGroup = KorAP.DocGroup.create().fromJson(operand);
	if (docGroup === undefined)
	  return;
	this._operands.push(docGroup);
	return docGroup;

      default:
	KorAP.log(812, "Operand not supported in document group");
	return;
      };
    },
    getOperand : function (index) {
      return this._operands[index];
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
    }
  };

  /**
   * Virtual collection doc criterion.
   */
  KorAP.Doc = {
    _ldType : "doc",
    _obj : function () { return KorAP.Doc; },
    _objType : 'Doc',
    // Create new
    create : function () {
      return Object.create(KorAP.JsonLD).extend(KorAP.Doc);
    },

    // Deserialize from json
    fromJson : function (json) {
      if (json === undefined)
	return this;
      // return this.create();

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
      if (arguments.length === 1)
	this._key = value;
      return this._key;
    },
    matchop : function (match) {
      if (arguments.length === 1)
	this._matchop = match.replace(/^match:/, '');
      return this._matchop || "eq";
    },
    type : function (type) {
      if (arguments.length === 1)
	this._type = type;
      return this._type || "string";
    },
    value : function (value) {
      if (arguments.length === 1)
	this._value = value;
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
    }
  };
}(this.KorAP));
