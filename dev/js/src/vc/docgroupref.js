/**
 * A reference to another VC.
 * Inherits everything from jsonld
 */
"use strict";

define([
  'vc/jsonld',
  'vc/rewritelist',
  'vc/stringval',
  'util'
], function (jsonldClass, rewriteListClass, stringValClass) {

  // TODO:
  //   Does not support rewrites currently
  
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
      const obj = Object(jsonldClass).
            create().
	          upgradeTo(this).
            fromJson(json);
      
      if (obj === undefined)
        console.log(json);

      if (parent !== undefined)
	      obj._parent = parent;
      
      obj.__changed = true;
      return obj;
    },


    /**
     * Update the element
     */
    update : function () {
      const t = this;

      if (t._element === undefined)
        return t.element();

      const e = t._element;

      // Check if there is a change in the underlying data
      if (!t.__changed)
        return e;

      // Set ref - TODO: Cleanup!
      e.refTo = t;

      // Was rewritten
      if (t.rewrites() !== undefined) {
        e.classList.add("rewritten");
      };

      const refTitle = document.createElement('span');
      refTitle.classList.add('key','fixed', 'ref');
      refTitle.addT('referTo');

      // Added value operator
      const refE = t._refE = document.createElement('span');
      refE.setAttribute('data-type', "string");
      refE.setAttribute('class', 'value');

      if (this.ref()) {
        refE.addT(t.ref());
      }
      else {
        refE.addT(loc.EMPTY);
        refE.classList.add('unspecified');
      };

      // Change value
      refE.addEventListener(
        'click',
        t._changeRef.bind(t)
      );

      // Remove all element children
      _removeChildren(e);

      // Add spans
      e.appendChild(refTitle);
      e.appendChild(refE);

      t.__changed = false;

      if (t._rewrites !== undefined) {
        e.appendChild(t._rewrites.element());
      };

      if (t._parent !== undefined) {

        // Set operators
        // Append new operators
        e.appendChild(t.operators(
          true,
          true,
          true
        ).element());
      };  
     
      KorAP.vc.element().dispatchEvent(
        new CustomEvent('vcChange', { 'detail' : t })
      );
      
      return t.element();
    },


    /**
     * Get the associated element
     */
    element : function () {

      if (this._element !== undefined)
	      return this._element;

      const e = this._element = document.createElement('div');
      e.setAttribute('class', 'doc groupref');
      this.update();
      return e;
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
      const that = this;
      const str = stringValClass.create(this.ref(), false, false);
      const strElem = str.element();

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
      const parent = this.parent();
      const group = require('vc/docgroup').create(parent);
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
        "ref"   : this.ref()
      };
    },


    incomplete : function () {
      return this.ref() ? false : true
    },
    

    toQuery : function () {
      if (this.incomplete())
        return "";

      // Build doc string based on key
      return 'referTo ' + this.ref().quote();
    }
  };
});
