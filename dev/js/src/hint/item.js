/**
 * Hint menu item based on MenuItem
 */
define(['menu/item'], function (itemClass) {
  return {

    /**
     * Create new menu item object.
     */
    create : function (params) {
      return Object.create(itemClass)
	      .upgradeTo(this)
	      ._init(params);
    },

    // Initialize menu item object
    _init : function (params) {
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
    },

    /**
     * Get or set the content of the item.
     */
    content : function (content) {
      if (arguments.length === 1) {
	      this._content = content;
      };
      return this._content;
    },

    /**
     * Override the click action
     * of the menu item.
     */
    onclick : function (e) {
      var m = this.menu();
      var h = m.hint();
      // m.hide();

      // Update input field
      var input = h.inputField();
      input.insert(this._action).update();

      e.halt();

      // show alt
      h.show(true);
    },

    /**
     * The name of the menu entry.
     */
    name : function () {
      return this._name;
    },

    /**
     * The action (the string inserted on click)
     * of the menu item.
     */
    action : function () {
      return this._action;
    },

    /**
     * The description of the menu item.
     */
    desc : function () {
      return this._desc;
    },

    /**
     * The associated dom element of the
     * menu item.
     */
    element : function () {
      // already defined
      if (this._element !== undefined)
	      return this._element;

      // Create list item
      var li = document.createElement("li");

      if (this.onclick !== undefined) {
	      li["onclick"] = this.onclick.bind(this);
      };

      // Create title
      var name =  document.createElement("span");
      name.appendChild(document.createTextNode(this._name));
      
      li.appendChild(name);

      // Create description
      if (this._desc !== undefined) {
	      var desc = document.createElement("span");
	      desc.classList.add('desc');
	      desc.appendChild(document.createTextNode(this._desc));
	      li.appendChild(desc);
      };
      return this._element = li;
    }
  };
});
