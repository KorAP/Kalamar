define(['menu/item'], function (itemClass) {
  /**
   * Menu item for select menus.
   */

  return {

    /**
     * Create new menu item
     * for tree views.
     */
    create : function (params) {
      return Object.create(itemClass)
	      .upgradeTo(this)._init(params);
    },

    /**
     * Override click action of the menu item.
     */
    onclick : function (e) {
      var menu = this.menu();
      menu.hide();
      // Index was set on initialization
      menu.select(this._index);
      menu.showTitle();
      e.halt();
    },

    title : function () {
      return this.content().textContent;
    }
  };
});
