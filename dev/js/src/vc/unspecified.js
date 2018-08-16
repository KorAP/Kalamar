/**
 * An unspecified criterion in a virtual collection.
 * Inherits everything from jsonld
 */
define([
  'vc/jsonld',
  'vc/doc',
  'vc/docgroupref',
  'util'
], function (jsonldClass, docClass, docGroupRefClass) {

  // Localize empty string
  var loc = KorAP.Locale;
  loc.EMPTY = loc.EMPTY || '⋯';

  return {

    // The ld-type
    _ldType : "non",

    /**
     * Create new unspecified criterion
     * with a link to the parent object
     */
    create : function (parent) {
      var obj = Object.create(jsonldClass).
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

      var newDoc;
      var keyType = KorAP._vcKeyMenu.typeOf(v);

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

      if (this._element === undefined)
	      return this.element();

      // Remove element content
       _removeChildren(this._element);

      var ellipsis = document.createElement('span');
      ellipsis.addT(loc.EMPTY);

      // Click on empty criterion
      ellipsis.addEventListener('click', this.onclick.bind(this));

      this._element.appendChild(ellipsis);

      // Set ref - TODO: Cleanup!
      this._element.refTo = this;

      // Set operators
      if (this._parent !== undefined &&
          this.parent().ldType() !== null) {
	      var op = this.operators(
	        false,
	        false,
	        true
	      );
	      
	      this._element.appendChild(
	        op.element()
	      );
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
      this._element.setAttribute('class', 'doc unspecified');
      this.update();
      return this._element;
    },

    /**
     * Click on the unspecified object
     */
    onclick : function () {

      // Get the key menu
      var menu = KorAP._vcKeyMenu;

      // Add key menu element at the correct position
      this._element.insertBefore(
	      menu.element(),	
	      this._element.firstChild
      );

      var that = this;

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
