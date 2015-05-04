define(['menu/item'], function (itemClass) {
  /**
   * Menu item for tree view choice.
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
     * Get or set the content of the
     * menu item.
     */
    content : function (content) {
      if (arguments.length === 1) {
	this._content = content;
      };
      return this._content;
    },
    
    /**
     * The foundry attribute of the menu item.
     */
    foundry : function () {
      return this._foundry;
    },

    /**
     * The layer attribute of the menu item.
     */
    layer : function () {
      return this._layer;
    },

    /**
     * Override click action of the menu item.
     */
    onclick : function (e) {
      var menu = this.menu();
      menu.hide();
      e.halt();
      if (menu.info() !== undefined)
	menu.info().addTree(this._foundry, this._layer);
    },

    // Initialize tree menu item.
    _init : function (params) {
      if (params[0] === undefined)
	throw new Error("Missing parameters");

      this._name    = params[0];
      this._foundry = params[1];
      this._layer   = params[2];
      this._content = document.createTextNode(this._name);
      this._lcField = ' ' + this.content().textContent.toLowerCase();
      return this;
    }
  };
});
