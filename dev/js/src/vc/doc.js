/**
 * Document criterion
 */

define([
  'vc/jsonld', 'vc/rewritelist'], function (jsonldClass, rewriteListClass) {

/*
  var fieldMenu = menuClass.create([
    ['Titel', 'title', 'string'],
    ['Untertitel', 'subTitle', 'string'],
    ['Veröffentlichungsdatum', 'pubDate', 'date'],
    ['Autor', 'author', 'string']
  ]);

  fieldMenu.limit(5);
*/

  _validRegexMatchRE  = new RegExp("^(?:eq|ne)$");

    /**
     * Criterion in a KorAP.Doc
     */
    function _changeKey () {
      var doc = this.parentNode.refTo;
      var key = doc.element().firstChild;
      key.appendChild(fieldMenu.element());
      fieldMenu.show();
      fieldMenu.focus();
      // key, matchop, type, value
    };

  return {
    _ldType : "doc",
    _obj : function () { return '???'; /*KorAP.Doc*/ },
    
    create : function (parent, json) {
      var obj = Object(jsonldClass).
	create().
	upgradeTo(this).
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
	key.addEventListener('click', _changeKey, false);

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
      var group = require('vc/docgroup').create(parent);
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

	    if (!_validRegexMatchRE.test(this.matchop())) {
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
	this._rewrites = rewriteListClass.create(json["rewrites"]);
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
	return string + '"' + this.value().quote() + '"';
	break;
      };

      return "";
    }
  };
});
