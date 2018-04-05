// Field menu item
define(['menu/item', 'util'], function (itemClass) {

  const loc = KorAP.Locale;

  return {

    /**
     * Create new menu item.
     * Pass two parameters: value and type.
     * the value may be localized by a name in
     * KorAP.Locale with the prefix 'VC_',
     * e.g. 'VC_subTitle'.
     */
    create : function (params) {
      return Object.create(itemClass)
	      .upgradeTo(this)
	      ._init(params);
    },

    // Initialize item object
    _init : function (params) {
      if (params[0] === undefined)
	      throw new Error("Missing parameters");

      this._key = params[0];
      this._type  = params[1];

      var k = this._key;
      this._name  = loc["VC_" + k] ? loc["VC_" + k] : k;

      this._lcField = ' ' + this._name.toLowerCase();

      return this;
    },

    /**
     * Override click event by passing all clicks
     * to the menu object.
     */
    onclick : function (e) {
      this.menu().release(
	      this._key,
	      this._type
      );
      e.halt();
    },

    /**
     * Get the name of the item.
     * This is a potential localized version
     * of the value.
     */
    name : function () {
      return this._name;
    },

    /**
     * Get the type of the item.
     */
    type : function () {
      return this._type;
    },

    /**
     * Get the key of the item.
     */
    key : function () {
      return this._key;
    },

    /**
     * Get the HTML element associated with the item. 
     */
    element : function () {

      // already defined
      if (this._element !== undefined)
	      return this._element;

      // Create list item
      var li = document.createElement("li");
      if (this._type)
        li.setAttribute("data-type", this._type);
      li.setAttribute("data-key",  this._key);

      // Connect action
      li["onclick"] = this.onclick.bind(this);

      li.addT(this._name);
      return this._element = li;
    }
  };
});
