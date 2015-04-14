define(['menu/item'], function (itemClass) {
  /**
   * Menu item for tree view choice.
   */

  return {
    create : function (params) {
      return Object.create(itemClass)
	.upgradeTo(this)._init(params);
    },
    content : function (content) {
      if (arguments.length === 1) {
	this._content = content;
      };
      return this._content;
    },
    
    // The foundry attribute
    foundry : function () {
      return this._foundry;
    },

    // The layer attribute
    layer : function () {
      return this._layer;
    },

    // enter or click
    onclick : function (e) {
      var menu = this.menu();
      menu.hide();
      e.halt();
      if (menu.info() !== undefined)
	menu.info().addTree(this._foundry, this._layer);
    },
    
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
