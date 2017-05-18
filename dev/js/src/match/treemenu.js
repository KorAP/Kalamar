  /**
   * Menu to choose from for tree views.
   */
define(['menu', 'match/treeitem'], function (menuClass, itemClass) {
  "use strict";

  return {

    /**
     * Create new menu object.
     * Pass the match information object
     * and the item parameters.
     *
     * @param info The match info object
     * @param params The match menu items
     *   as an array of arrays.
     */
    create : function (info, params) {
      var obj = Object.create(menuClass)
	        .upgradeTo(this)
	        ._init(params, {itemClass : itemClass});
      obj.limit(6);
      obj._info = info;

      // This is only domspecific
      obj.element().addEventListener('blur', function (e) {
	      this.menu.hide();
      });
      
      return obj;
    },

    /**
     * The match information object of the menu.
     */
    info :function () {
      return this._info;
    }
  };
});
