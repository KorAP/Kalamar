/**
 * Implementation of rewrite objects.
 */
define(['vc/jsonld', 'util'], function (jsonldClass) {

  var _validRewriteOpRE   = new RegExp("^(operation:)?(?:injec|modifica)tion$");

  return {
    // Construction method
    create : function (json) {
      var obj = Object(jsonldClass).
	create().
	upgradeTo(this).
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
	if (_validRewriteOpRE.test(op)) {
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
	  this.scope().quote() +
	  '"'
      );
      str += ' by ' +
	'"' +
	this.src().quote() +
	'"';
      return str;
    }
  };
});
