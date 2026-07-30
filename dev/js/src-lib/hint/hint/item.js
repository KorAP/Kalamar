/**
 * Hint menu item based on MenuItem
 */

import itemClass from '../../menu/menu/item.js';
import '../../util/util.js';

export default class HintMenuItem extends itemClass {

    /**
     * Create new menu item object.
     */
    constructor (params) {
      super();
      this.upgradeTo(HintMenuItem.prototype)._init(params);
    }

    // Initialize menu item object
    _init (params) {
      if (params[0] === undefined ||
	        params[1] === undefined)
	      throw new Error("Missing parameters");
      
      this._name   = params[0];
      this._action = params[1];
      this._lcField = ' ' + this._name.toLowerCase();
      
      if (params.length > 2) {
	      this._desc = params[2];
	      this._lcField += " " + this._desc.toLowerCase();
      };

      return this;
    }

    /**
     * Get or set the content of the item.
     */
    content (content) {
      if (arguments.length === 1) {
	      this._content = content;
      };
      return this._content;
    }
  
    /**
     * Override the click action
     * of the menu item.
     */
    onclick (e) {
      var m = this.menu();
      // m.hide();

      // Reset prefix and update the input field
      m.reset(this._action);

      e.halt();
     
      // show alt
      m.hint().show(true);
    }

    /**
     * The name of the menu entry.
     */
    name () {
      return this._name;
    }

    /**
     * The action (the string inserted on click)
     * of the menu item.
     */
    action () {
      return this._action;
    }

    /**
     * The description of the menu item.
     */
    desc () {
      return this._desc;
    }

    /**
     * The associated dom element of the
     * menu item.
     */
    element () {
      // already defined
      if (this._el !== undefined)
	      return this._el;

      // Create list item
      var li = document.createElement("li");

      if (this.onclick !== undefined) {
	      li["onclick"] = this.onclick.bind(this);
      };

      // Create title
      var name =  document.createElement("span");
      name.addT(this._name);
      
      li.appendChild(name);

      // Create description
      if (this._desc !== undefined) {
	      var desc = document.createElement("span");
	      desc.classList.add('desc');
	      desc.addT(this._desc);
	      li.appendChild(desc);
      };
      return this._el = li;
    }
}
