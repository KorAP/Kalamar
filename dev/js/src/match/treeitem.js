"use strict";

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
     * The type attribute of the menu item.
     * Is either "spans" or "rels".
     */
    type : function () {
      return this._type;
    },
    

    /**
     * Override click action of the menu item.
     */
    onclick : function (e) {
      const menu = this.menu();
      menu.hide();
      e.halt();

      if (menu.panel() !== undefined) {
	      menu.panel().addTree(this._foundry, this._layer, this._type);
      };
    },


    // Initialize tree menu item.
    _init : function (params) {
      if (params[0] === undefined)
	      throw new Error("Missing parameters");

      const t = this;

      t._name    = params[0];
      t._foundry = params[1];
      t._layer   = params[2];
      t._type    = params[3];
      t._content = document.createTextNode(t._name);
      t._lcField = ' ' + t.content().textContent.toLowerCase();
      return t;
    }
  };
});
