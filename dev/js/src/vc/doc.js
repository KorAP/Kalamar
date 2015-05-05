/**
 * A new document criterion
 */

define([
  'vc/jsonld',
  'vc/rewritelist',
  'vc/stringval',
  'util'
], function (jsonldClass, rewriteListClass, stringValClass) {

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

  var loc = KorAP.Locale;
  loc.EMPTY = loc.EMPTY || '⋯';

  return {

    // The JSON-LD type
    _ldType : "doc",

    // The object ... maybe not important
    _obj : function () { return '???'; /*KorAP.Doc*/ },
    
    /**
     * Create a new document criterion
     * by passing the parent object and a json construct.
     */
    create : function (parent, json) {

      // Create the object, inheriting from Json-LD class
      var obj = Object(jsonldClass).
	create().
	upgradeTo(this).
	fromJson(json);

      // Bind the parent
      if (parent !== undefined)
	obj._parent = parent;
      
      obj.__changed = true;
      return obj;
    },

    /**
     * Update the elements content.
     */
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
	this._keyE = document.createElement('span');
	this._keyE.setAttribute('class', 'key');

	// Change key
	this._keyE.addEventListener('click', this._changeKey.bind(this));

	if (this.key()) {
	  var k = this.key();
	  if (loc['VC_' + k] !== undefined)
	    k = loc['VC_' + k];
	  this._keyE.appendChild(document.createTextNode(k));
	};

	// Added match operator
	this._matchopE = document.createElement('span');
	this._matchopE.setAttribute('data-type', this.type());
	this._matchopE.setAttribute('class', 'match');
	this._matchopE.appendChild(
	  document.createTextNode(this.matchop())
	);

	// Change matchop
	this._matchopE.addEventListener(
	  'click',
	  this._changeMatchop.bind(this)
	);

	// Added value operator
	this._valueE = document.createElement('span');
	this._valueE.setAttribute('data-type', this.type());
	this._valueE.setAttribute('class', 'value');
	if (this.value()) {
	  this._valueE.appendChild(document.createTextNode(this.value()));
	}
	else {
	  this._valueE.appendChild(document.createTextNode(loc.EMPTY));
	};

	// Change value
	this._valueE.addEventListener(
	  'click',
	  this._changeValue.bind(this)
	);


	// Remove all element children
	_removeChildren(e);

	// Add spans
	e.appendChild(this._keyE);
	e.appendChild(this._matchopE);
	e.appendChild(this._valueE);

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


    /**
     * Get the associated element
     */
    element : function () {
      if (this._element !== undefined)
	return this._element;

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'doc');

      this.update();
      return this._element;
    },

    /**
     * Wrap a new operation around the doc element
     */
    wrap : function (op) {
      var parent = this.parent();
      var group = require('vc/docgroup').create(parent);
      group.operation(op);
      group.append(this);
      group.append();
      return parent.replaceOperand(this, group).update();
    },

    /**
     * Deserialize from json
     */
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

    /**
     * Get or set the key
     */
    key : function (value) {
      if (arguments.length === 1) {
	this._key = value;
	this._changed();
	return this;
      };
      return this._key;
    },

    // Click on the key, show me the menu
    _changeKey : function (e) {
      var menu = KorAP._vcKeyMenu;

      // Insert menu
      this._element.insertBefore(
	menu.element(),
	this._keyE
      );

      // Release event
      var that = this;
      menu.released(function (key, type) {
	var doc = that.key(key).type(type);

	// This may not be compatible - then switch to default
	doc.matchop(doc.matchop());
	doc.value(doc.value());

	// Update the doc
	doc.update();

	// hide!
	this.hide();
      });

      // TODO: Highlight the old value!
      menu.show();
      menu.focus();
    },

    /**
     * Get or set the match operator
     */
    matchop : function (match) {
      if (arguments.length === 1) {
	var m = match.replace(/^match:/, '');
	if (
	  (this._type === undefined)
	    ||
	    (
	      (this._type === 'string' || this._type === 'regex') &&
		KorAP._validStringMatchRE.test(m)
	    )
	    ||
	    (this._type === 'date' && KorAP._validDateMatchRE.test(m))
	) {
	  this._matchop = m;
	}
	else {
	  this._matchop = "eq";
	};

	this._changed();
	return this;
      };
      return this._matchop || "eq";
    },


    // Click on the match operator, show me the menu
    _changeMatchop : function (e) {
      var menu = KorAP._vcMatchopMenu[this.type()];

      if (menu === undefined) {
	KorAP.log(0, "Unable to init menu for " + this.type());
	return;
      };

      // Insert menu
      this._element.insertBefore(
	menu.element(),
	this._matchopE
      );

      // Release event
      var that = this;
      menu.released(function (mo) {
	that.matchop(mo).update();
	this.hide();
      });

      menu.show();
      menu.focus();
    },


    /**
     * Get or set the type
     */
    type : function (type) {
      if (arguments.length === 1) {
	this._type = type;
	this._changed();
	return this;
      };
      return this._type || "string";
    },


    /**
     * Get or set the value
     */
    value : function (value) {
      if (arguments.length === 1) {
	if (this._type === 'date' && !KorAP._validDateRE.test(value)) {
	  delete this._value;
	}
	else {
	  this._value = value;
	};
	this._changed();
	return this;
      };
      return this._value;
    },


    // Click on the match operator, show me the menu
    _changeValue : function (e) {
      var v = this.value();
      var that = this;

      // Show datepicker
      if (this.type() === 'date') {
	var dp = KorAP._vcDatePicker;
	if (v !== undefined) {

	  var d = v.split('-', 3);
	  d[0] = parseInt(d[0]);
	  if (d[1]) d[1] = parseInt(d[1]);
	  if (d[2]) d[2] = parseInt(d[2]);

	  // Select values
	  dp.select(d[0], d[1], d[2]);
	};

	// Todo: change this
	dp.onclick(function (selected) {

	  // There are values selected
	  if (selected['year']) {
	    var v = '' + selected['year'];
	    if (selected['month']) {
	      v += '-';
	      v += selected['month'] < 10 ? '0' + selected['month'] : selected['month'];
	      if (selected['day']) {
		v += '-';
		v += selected['day'] < 10 ? '0' + selected['day'] : selected['day'];
	      };
	    };
	    that.value(v);
	    that.update();
	    return;
	  };

	  // Remove datepicker
	  that._element.removeChild(
	    dp.element()
	  );
	});

	// Get element of the date picker
	var dpElem = dp.show();

	this._element.insertBefore(
	  dpElem,
	  this._valueE
	);

	dpElem.focus();
	dpElem.addEventListener('blur', function (e) {
	  // Remove datepicker
	  that._element.removeChild(this);
	});
      }
      else {
	var regex = this.type() === 'regex' ? true : false;
	var str = stringValClass.create(this.value(), regex);
	var strElem = str.element();


	str.store = function (value, regex) {
	  that.value(value);
	  if (regex === true)
	    that.type('regex');
	  else
	    that.type('string');

	  that._element.removeChild(
	    this._element
	  );
	  that.update();
	};

	// Insert element
	this._element.insertBefore(
	  strElem,
	  this._valueE
	);

	str.focus();
      };
    },


    rewrites : function () {
      return this._rewrites;
    },

    _changed : function () {
      this.__changed = true;
      
      if (this._parent) {
      };

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
