/**
 * Hint menu
 */
define(['menu',
	'hint/item',
	'hint/prefix',
	'hint/lengthField'], function (menuClass, itemClass, prefixClass, lengthFieldClass) {
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
      obj._element.classList.add('hint');
      obj._hint = hint;

      // Make the top item always active
      obj._firstActive = true;

      // This is only domspecific
      obj.element().addEventListener('blur', function (e) {
        this.menu.hideWithoutDestruction();
      });

      // Focus on input field on hide
      obj.onHide = function () {
	      this._hint.unshow();
      };

      return obj;
    },

    /**
     * The hint helper object,
     * the menu is attached to.
     */ 
    hint : function () {
      return this._hint;
    },

    /**
     * Hide the menu just for the moment,
     * without cleaning up anything.
     */
    hideWithoutDestruction : function () {
      this.element().classList.remove("visible");
      if (this._hint)
        this._hint.inputField().element().focus();
    }
  };
});
