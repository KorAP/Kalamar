/**
 * Hint menu
 */

"use strict";

define([
  'menu',
	'hint/item',
	'hint/prefix',
	'hint/lengthField'
], function (
  menuClass,
  itemClass,
  prefixClass,
  lengthFieldClass) {

  return {
    
    /**
     * Create new hint helper menu.
     */
    create : function (hint, context, params) {
      var obj = Object.create(menuClass)
	        .upgradeTo(this)
	        ._init(params, {
	          itemClass : itemClass,
	          prefixClass : prefixClass,
	          lengthFieldClass : lengthFieldClass
	        });
      obj._context = context;
      obj._el.classList.add('hint');
      obj._hint = hint;

      // Make the top item always active
      obj._firstActive = true;

      obj.element().addEventListener('blur', function (e) {
        this.menu.hide(); // WithoutDestruction();
      });

      // Focus on input field on hide
      obj.onHide = function () {
        var h = this._hint;
        h._inputField.element().focus();
        if (h.active() !== null) {
          if (h._alert.active) {
            h._unshowAlert();
          };
          h.active(null);
        };
      };

      return obj;
    },

    /**
     * The hint helper object,
     * the menu is attached to.
     */ 
    hint : function () {
      return this._hint;
    }
  };
});
