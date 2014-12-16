var KorAP = KorAP || {};
/*
  704: "Operation needs operand list"
  701: "JSON-LD group has no @type attribute" 

  802: "Match type is not supported by value type"
  804: "Unknown value type"
  805: "Value is invalid"
  806: "Value is not a valid date string"
  807: "Value is not a valid regular expression"

// new:
  810: "Unknown document group operation" (like 711)
  811: "Document group expects operation" (like 703) 
  812: "Operand not supported in document group" (like 744)
*/

(function (KorAP) {
  "use strict";

  // Default log message
  KorAP.log = KorAP.log || function (type, msg) {
    console.log(type + ": " + msg);
  };

  KorAP._validStringMatchRE = new RegExp("^(?:eq|ne|contains)$");
  KorAP._validRegexMatchRE  = new RegExp("^(?:eq|ne)$");
  KorAP._validDateMatchRE   = new RegExp("^(?:since|until|eq)$");
  KorAP._validDateRE        = new RegExp("^(?:\\d{4})(?:-\\d\\d(?:-\\d\\d)?)?$");
  KorAP._validGroupOpRE     = new RegExp("^(?:and|or)$");

  /*
  KorAP.VirtualCollection = {
    create : function () {
      return Object.create(KorAP.VirtualCollection);
    },
    fromJson : function (json) {
    },
    render : function (element) {
      // ...
    }
  };
  */
  // Make KorAP.DocElement inherit from KorAP.Doc
  KorAP.DocElement = {
    create : function (param) {
      return Object.create(Korap.DocElement)._init(param);
    },
    _init : function () {
      KorAP.Doc.create(param)
    }
  };

  KorAP.DocGroup = {
    create : function (type) {
      var docGroup = Object.create(KorAP.DocGroup);
      docGroup.operation = type;
      docGroup._operands = [];
      docGroup.ldType = "docGroup";
      return docGroup;
    },

    // Deserialize from json
    fromJson : function (json) {
      return Object.create(KorAP.DocGroup)._init(json);
    },

    _init : function (json) {

      if (json === undefined)
	return KorAP.DocGroup.create("and");

      if (json["@type"] != "korap:docGroup") {
	KorAP.log(701, "JSON-LD group has no @type attribute");
	return;
      };

      this.ldType = "docGroup";

      if (json["operation"] === undefined ||
	  typeof json["operation"] !== 'string') {
	KorAP.log(811, "Document group expects operation");
	return;
      };

      var operation = json["operation"];
      this.operation = operation.replace(/^operation:/,'');

      this._operands = [];

      if (json["operands"] === undefined ||
	  !(json["operands"] instanceof Array)) {
	KorAP.log(704, "Operation needs operand list")
	return;
      };

      var operands = json["operands"];

      // Add all documents
      for (var i in operands) {
	var operand = operands[i];

	switch (operand["@type"]) {
	case undefined:
	  KorAP.log(701, "JSON-LD group has no @type attribute");
	  return;
	case "korap:doc":
	  var doc = KorAP.Doc.fromJson(operand);
	  if (doc === undefined)
	    return;
	  this.appendOperand(doc);
	  break;
	case "korap:docGroup":
	  var docGroup = KorAP.DocGroup.fromJson(operand);
	  if (docGroup === undefined)
	    return;
	  this.appendOperand(docGroup);
	  break;
	default:
	  KorAP.log(812, "Operand not supported in document group");
	  return;
	};
      };
      return this;
    },
    set operation (op) {
      if (KorAP._validGroupOpRE.test(op)) {
	this._op = op;
      }
      else {
	KorAP.log(810, "Unknown operation type");
	return;
      };
    },
    get operation () {
      return this._op || 'and';
    },
    get operands () {
      return this._operands;
    },
    appendOperand : function (obj) {
      this._operands.push(obj)
      return obj;
    },
    getOperand : function (index) {
      return this._operands[index];
    },
    set ldType (type) {
      this._ldtype = type;
    },
    get ldType () {
      return this._ldType || "docGroup";
    },
    toJson : function () {
      var operands = new Array();
      for (var i in this._operands) {
	operands.push(this._operands[i].toJson());
      };
      return {
	"@type" : "korap:" + this.ldType,
	"operation" : "operation:" + this.operation,
	"operands" : operands
      };
    }
  };

  /**
   * Virtual collection doc criterion.
   */
  KorAP.Doc = {

    // Create new
    create : function () {
      var doc = Object.create(KorAP.Doc);
      doc.ldType = "doc";
      return doc;
    },

    // Deserialize from json
    fromJson : function (json) {
      return Object.create(KorAP.Doc)._init(json);
    },

    // Init new doc criterion or deserialize fro JSON-LD
    _init : function (json) {
      if (json === undefined)
	return this.create();

      if (json["@type"] !== "korap:doc") {
	KorAP.log(701, "JSON-LD group has no @type attribute");
	return;
      };

      this.ldType = "doc";

      if (json["value"] === undefined ||
	  typeof json["value"] != 'string') {
	KorAP.log(805, "Value is invalid");
	return;
      };

      // There is a defined key
      if (json["key"] !== undefined &&
	  typeof json["key"] === 'string') {

	// Set key
	this.key = json["key"];

	// Set match operation
	if (json["match"] !== undefined) {
	  if (typeof json["match"] === 'string')
	    this.matchop = json["match"];
	  else {
	    KorAP.log(802, "Match type is not supported by value type");
	    return;
	  };
	};

	// Key is a string
	if (json["type"] === undefined ||
	    json["type"] == "type:string") {
	  this.type = "string";

	  // Check match type
	  if (!KorAP._validStringMatchRE.test(this.matchop)) {
	    KorAP.log(802, "Match type is not supported by value type");
	    return;
	  };

	  // Set string value
	  this.value = json["value"];
	}

	// Key is a date
	else if (json["type"] === "type:date") {
	  this.type = "date";

	  if (json["value"] !== undefined &&
	      KorAP._validDateRE.test(json["value"])) {

	    if (!KorAP._validDateMatchRE.test(this.matchop)) {
	      KorAP.log(802, "Match type is not supported by value type");
	      return;
	    };

	    // Set value
	    this.value = json["value"];
	  }
	  else {
	    KorAP.log(806, "Value is not a valid date string");
	    return;
	  };
	}

	// Key is a regular expression
	else if (json["type"] === "type:regex") {
	  this.type = "regex";

	  try {

	    // Try to create a regular expression
	    var check = new RegExp(json["value"]);

	    if (!KorAP._validRegexMatchRE.test(this.matchop)) {
	      KorAP.log(802, "Match type is not supported by value type");
	      return;
	    };

	    this.value = json["value"];
	  }
	  catch (e) {
	    KorAP.log(807, "Value is not a valid regular expression");
	    return;
	  };
	  this.type = "regex";
	}

	else {
	  KorAP.log(804, "Unknown value type");
	  return;
	};
      };

      return this;
    },
    set key (value) {
      this._key = value;
    },
    get key () {
      return this._key;
    },
    set matchop (match) {
      this._matchop = match.replace(/^match:/, '');
    },
    get matchop () {
      return this._matchop || "eq";
    },
    set type (type) {
      this._type = type;
    },
    get type () {
      return this._type || "string";
    },
    set value (value) {
      this._value = value;
    },
    get value () {
      return this._value;
    },

    // Todo: Redundant and should be inherited
    set ldType (type) {
      this._ldtype = type;
    },
    get ldType () {
      return this._ldType || "doc";
    },
    toJson : function () {
      if (!this.matchop || !this.key)
	return {};
      
      return {
	"@type" : "korap:" + this.ldType,
	"key"   : this.key,
	"match" : "match:" + this.matchop,
	"value" : this.value || '',
	"type"  : "type:" + this.type
      };
    }
  };
}(this.KorAP));
