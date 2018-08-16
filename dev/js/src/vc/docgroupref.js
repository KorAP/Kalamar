/**
 * A reference to another VC.
 * Inherits everything from jsonld
 */
define([
  'vc/jsonld',
  'vc/rewritelist',
  'vc/stringval',
  'util'
], function (jsonldClass, rewriteListClass, stringValClass) {

  const loc = KorAP.Locale;
  loc.EMPTY = loc.EMPTY || '⋯';

  return {

    // The ld-type
    _ldType : "docGroupRef",

    /**
     * Create new unspecified criterion
     * with a link to the parent object
     */
    create : function (parent, json) {
      var obj = Object(jsonldClass)
          .create().
	        upgradeTo(this)
          .fromJson(json);

      if (obj === undefined) {
        console.log(json);
      };

      if (parent !== undefined)
	      obj._parent = parent;

      obj.__changed = true;
      return obj;
    },


    /**
     * Update the element
     */
    update : function () {
      if (this._element === undefined)
        return this.element();

      var e = this._element;

      // Check if there is a change in the underlying data
      if (!this.__changed)
        return e;

      // Set ref - TODO: Cleanup!
      e.refTo = this;

      // Was rewritten
      if (this.rewrites() !== undefined) {
        e.classList.add("rewritten");
      };

      var refTitle = document.createElement('span');
      refTitle.classList.add('key','fixed');
      refTitle.addT('@referTo');

      // Added value operator
      this._refE = document.createElement('span');
      this._refE.setAttribute('data-type', "string");
      this._refE.setAttribute('class', 'value');
      if (this.ref()) {
        this._refE.addT(this.ref());
      }
      else {
        this._refE.addT(loc.EMPTY);
      };

      // Change value
      this._refE.addEventListener(
        'click',
        this._changeRef.bind(this)
      );

      // Remove all element children
      _removeChildren(e);

      // Add spans
      e.appendChild(refTitle);
      e.appendChild(this._refE);

      this.__changed = false;

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

      return this.element();
    },


    /**
     * Get the associated element
     */
    element : function () {
      if (this._element !== undefined)
	      return this._element;
      this._element = document.createElement('div');
      this._element.setAttribute('class', 'doc groupref');
      this.update();
      return this._element;
    },


    /**
     * Get or set the value
     */
    ref : function (ref) {
      if (arguments.length === 1) {
        this._ref = ref;
        this._changed();
        return this;
      };
      return this._ref;
    },


    // Click on the reference operator, show me the option
    _changeRef : function (e) {
      var that = this;

      var str = stringValClass.create(this.ref(), false, false);
      var strElem = str.element();

      str.store = function (ref, regex) {
        that.ref(ref);
          
        that._element.removeChild(
          this._element
        );
        that.update();
      };

      // Insert element
      this._element.insertBefore(
        strElem,
        this._refE
      );

      str.focus();
    },
    

    /**
     * Wrap a new operation around the doc element.
     * This is copypasta from doc.js
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

      if (json["ref"] === undefined ||
          typeof json["ref"] != 'string') {
        KorAP.log(821, "Reference is missing");
        return;
      };

      this.ref(json["ref"]);

      // Rewrite coming from the server
      if (json["rewrites"] !== undefined) {
        this.rewrite(json["rewrites"]);
      };

      return this;
    },


    /**
     * Click on the unspecified object
     */
    onclick : function () {
      console.log("Do not support click on this");
    },

    // TODO: This is identical to doc.js
    rewrites : function () {
      return this._rewrites;
    },

    // TODO: This is identical to doc.js
    rewrite : function (value) {
      if (typeof value === 'string') {
        value = [{
          "@type" : "koral:rewrite",
          "operation" : "operation:" + value,
          "src" : "Kalamar"
        }];
      };
      this._rewrites = rewriteListClass.create(value);
    },


    // Mark the underlying data as being changed.
    // This is important for rerendering the dom.
    // This will also remove rewrite markers, when the data
    // change happened by the user
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
      if (!this.ref)
        return {};
      
      return {
        "@type" : "koral:" + this.ldType(),
        "ref"  : this.ref()
      };
    },

    
    toQuery : function () {
      if (!this.ref())
        return "";

      // Build doc string based on key
      return 'referTo "' + this.ref().quote() + '"';
    }
  };
});
