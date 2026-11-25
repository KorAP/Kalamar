import itemClass from '../menu/menu/item.js';

  /**
   * Menu item for tree view choice.
   */

  export default class TreeItem extends itemClass {

    /**
     * Create new menu item
     * for tree views.
     */
    constructor (params) {
      super();
      this._init(params);
    }

    /**
     * Get or set the content of the
     * menu item.
     */
    content (content) {
      if (arguments.length === 1) {
	      this._content = content;
      };
      return this._content;
    }
    

    /**
     * The foundry attribute of the menu item.
     */
    foundry () {
      return this._foundry;
    }


    /**
     * The layer attribute of the menu item.
     */
    layer () {
      return this._layer;
    }


    /**
     * The type attribute of the menu item.
     * Is either "spans" or "rels".
     */
    type () {
      return this._type;
    }
    

    /**
     * Override click action of the menu item.
     */
    onclick (e) {
      const menu = this.menu();
      menu.hide();
      e.halt();

      if (menu.panel() !== undefined) {
	      menu.panel().addTree(this._foundry, this._layer, this._type);
      };
    }


    // Initialize tree menu item.
    _init (params) {
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
  }
