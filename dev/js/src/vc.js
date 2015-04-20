/**
 * Create virtual collections with a visual user interface.
 *
 * @author Nils Diewald
 */
/*
 * Replaces a previous version written by Mengfei Zhou
 */

/*
  TODO: Implement a working localization solution!
  TODO: Disable "and" or "or" in case it's followed
        by an unspecified document
  TODO: Implement "persistance"-Option,
        injecting the current creation date stamp

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

define([
  'vc/unspecified',
  'vc/doc',
  'vc/docgroup',
  'util'
], function (unspecDocClass, docClass, docGroupClass) {
  "use strict";

  // ???
  KorAP._validStringMatchRE = new RegExp("^(?:eq|ne|contains|excludes)$");
  KorAP._validDateMatchRE   = new RegExp("^[lg]?eq$");
  KorAP._validDateRE        = new RegExp("^(?:\\d{4})(?:-\\d\\d(?:-\\d\\d)?)?$");
  KorAP._overrideStyles     = false;

  var loc = KorAP.Locale;

  /**
   * Virtual Collection
   */
  return {
    ldType : function () {
      return null;
    },

    _init : function () {
      if (!KorAP._overrideStyles) {
	var sheet = KorAP.newStyleSheet();

	// Add css rule for OR operations
	sheet.insertRule(
	  '.vc .docGroup[data-operation=or] > .doc::before,' +
	  '.vc .docGroup[data-operation=or] > .docGroup::before ' +
	    '{ content: "' + loc.OR + '" }',
	  0
	);

	// Add css rule for AND operations
	sheet.insertRule(
	  '.vc .docGroup[data-operation=and] > .doc::before,' +
	  '.vc .docGroup[data-operation=and] > .docGroup::before ' +
	    '{ content: "' + loc.AND + '" }',
	  1
	);

	console.log(sheet);

	KorAP._overrideStyles = true;
      };

      return this;
    },

    create : function () {
      return Object.create(this)._init();
    },

    clean : function () {
      if (this._root.ldType() !== "non") {
	this._root.destroy();
	this.root(unspecDocClass.create(this));
      };
      return this;
    },

    render : function (json) {
      var obj = Object.create(this)._init();

      if (json !== undefined) {
	// Root object
	if (json['@type'] == 'koral:doc') {
	  obj._root = docClass.create(obj, json);
	}
	else if (json['@type'] == 'koral:docGroup') {
	  obj._root = docGroupClass.create(obj, json);
	}
	else {
	  KorAP.log(813, "Collection type is not supported");
	  return;
	};
      }

      else {
	// Add unspecified object
	obj._root = unspecDocClass.create(obj);
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
});
