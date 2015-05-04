/**
 * Create virtual collections with a visual user interface.
 * This resembles the collection type objects of a KoralQuery
 * "collection" object.
 *
 * KoralQuery v0.3 is expected.
 *
 * @author Nils Diewald
 */
/*
 * This replaces a previous version written by Mengfei Zhou
 */

/*
  TODO: Disable "and" or "or" in case it's followed
        by an unspecified document
  TODO: Implement "persistence"-Option,
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

  Localization strings:
  KorAP.Locale = {
    EMPTY : '...',
    AND : 'and',
    OR : 'or',
    DELETE : 'x'
  }
  and various field names with the prefix 'VC_'
*/

define([
  'vc/unspecified',
  'vc/doc',
  'vc/docgroup',
  'vc/menu',
  'datepicker',
  'util'
], function (unspecDocClass, docClass, docGroupClass, menuClass, dpClass) {
  "use strict";

  // ???
  KorAP._validStringMatchRE = new RegExp("^(?:eq|ne|contains|excludes)$");
  KorAP._validDateMatchRE   = new RegExp("^[lg]?eq$");
  KorAP._validDateRE        = new RegExp("^(?:\\d{4})(?:-\\d\\d(?:-\\d\\d)?)?$");
  KorAP._overrideStyles     = false;

  var loc = KorAP.Locale;

  KorAP._vcKeyMenu = undefined;
  KorAP._vcDatePicker = dpClass.create();

  /**
   * Virtual Collection
   */
  return {

    /**
     * The JSON-LD type of the virtual collection
     */
    ldType : function () {
      return null;
    },

    // Initialize virtual collection
    _init : function (keyList) {

      // Inject localized css styles
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

	KorAP._overrideStyles = true;

	// Create key menu
	KorAP._vcKeyMenu = menuClass.create(keyList);
	KorAP._vcKeyMenu.limit(6);

	// Create match menus ....
	KorAP._vcMatchopMenu = {
	  'string' : menuClass.create([
	    ['eq', null],
	    ['ne', null],
	    ['contains', null],
	    ['excludes', null]
	  ]),
	  'date' : menuClass.create([
	    ['eq', null],
	    ['geq', null],
	    ['leq', null]
	  ]),
	  'regex' : menuClass.create([
	    ['eq', null],
	    ['ne', null],
	    ['contains', null],
	    ['excludes', null]
	  ])
	};
      };

      return this;
    },

    /**
     * Create a new virtual collection.
     */
    create : function (keyList) {
      var obj = Object.create(this)._init(keyList);
      obj._root = unspecDocClass.create(obj);
      return obj;
    },


    /**
     * Create and render a new virtual collection
     * based on a KoralQuery collection document 
     */
    fromJson : function (json) {

      if (json !== undefined) {
	// Parse root document
	if (json['@type'] == 'koral:doc') {
	  this._root = docClass.create(this, json);
	}
	// parse root group
	else if (json['@type'] == 'koral:docGroup') {
	  this._root = docGroupClass.create(this, json);
	}
	// Unknown collection type
	else {
	  KorAP.log(813, "Collection type is not supported");
	  return;
	};
      }

      else {
	// Add unspecified object
	this._root = unspecDocClass.create(this);
      };

      // Init element and update
      this.update();

      return this;
    },


    /**
     * Clean the virtual document to uspecified doc.
     */
    clean : function () {
      if (this._root.ldType() !== "non") {
	this._root.destroy();
	this.root(unspecDocClass.create(this));
      };
      return this;
    },


    /**
     * Get or set the root object of the
     * virtual collection.
     */
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

    
    /**
     * Get the element associated with the virtual collection
     */
    element : function () {
      if (this._element !== undefined)
	return this._element;

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'vc');

      // Initialize root
      this._element.appendChild(this._root.element());

      return this._element;
    },


    /**
     * Update the whole object based on the underlying
     * data structure
     */
    update : function () {
      this._root.update();
      return this;
    },


    /**
     * Get the generated json string
     */
    toJson : function () {
      return this._root.toJson();
    },


    /**
     * Get the generated query string
     */
    toQuery : function () {
      return this._root.toQuery();
    }
  };
});
