/**
 * An unspecified criterion in a virtual corpus.
 * Inherits everything from jsonld
 */
"use strict";

define([
  'vc/jsonld',
  'vc/doc',
  'vc/docgroupref',
  'util'
], function (jsonldClass, docClass, docGroupRefClass) {

  // Localize empty string
  const loc = KorAP.Locale;
  loc.EMPTY = loc.EMPTY || '⋯';

  return {

    // The ld-type
    _ldType : "non",

    /**
     * Create new unspecified criterion
     * with a link to the parent object
     */
    create : function (parent) {
      const obj = Object.create(jsonldClass).
	        upgradeTo(this);

      if (parent !== undefined)
	      obj._parent = parent;

      return obj;
    },


    /**
     * Set the key; this will spawn a new doc
     */
    key : function (v) {

      // Not replaceable
      if (this._parent === undefined)
	      return null;

      let newDoc;
      const keyType = KorAP._vcKeyMenu.typeOf(v);

      // Set JSON-LD type
      if (keyType && keyType === 'ref') {
        newDoc = docGroupRefClass.create(this._parent);
      }
      else {
        newDoc = docClass.create(this._parent);
        newDoc.key(v);
        newDoc.type(keyType);
      };
  
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


    /**
     * Update the element
     */
    update : function () {
      const t = this;

      if (t._element === undefined)
	      return t.element();

      // Remove element content
      _removeChildren(t._element);

      const ellipsis = document.createElement('span');
      ellipsis.addT(loc.EMPTY);

      // Click on empty criterion
      ellipsis.addEventListener('click', t.onclick.bind(t));

      t._element.appendChild(ellipsis);

      // Set ref - TODO: Cleanup!
      t._element.refTo = t;

      // Set operators
      if (t._parent !== undefined &&
          t.parent().ldType() !== null) {

	      t._element.appendChild(
	        t.operators(
	          false,
	          false,
	          true
	        ).element()
	      );
      };

      return t.element();
    },


    /**
     * Get the associated element
     */
    element : function () {
      const t = this;
      if (t._element !== undefined)
	      return t._element;
      t._element = document.createElement('div');
      t._element.setAttribute('class', 'doc unspecified');
      t.update();
      return t._element;
    },


    incomplete : function () {
      return true;
    },
    

    /**
     * Click on the unspecified object
     */
    onclick : function () {

      // Get the key menu
      const menu = KorAP._vcKeyMenu;

      // Add key menu element at the correct position
      this._element.insertBefore(
	      menu.element(),	
	      this._element.firstChild
      );

      const that = this;

      // Set released method
      menu.released(function (key) {
	      // Set chosen key and type - will return a doc
	      that.key(key).update();
	      this.hide();
      });

      menu.show();
      menu.focus();
    }
  };
});
