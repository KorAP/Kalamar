import itemClass from '../../menu/menu/item.js';

  /**
   * Menu item for select menus.
   */
export default class SelectMenuItem extends itemClass {
    /**
     * Create new menu item
     * for tree views.
     * 
     * Can be deleted in a further migration step to ES6.
     * Right now it is useful because it is used in several places, like in menu.js.
     */
    static create(params) {
      return new SelectMenuItem(params);
    }

    constructor(params) {
      super(params);
    }

    /**
     * Override click action of the menu item.
     */
    onclick(e) {
      var menu = this.menu();
      menu.hide();
      // Index was set on initialization
      menu.select(this._index);
      menu.showTitle();
      e.halt();
    }


    /**
     * Get title of item.
     */
    title() {
      return this.content().textContent;
    }
  }
