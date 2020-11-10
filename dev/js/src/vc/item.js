// Field menu item
"use strict";

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
      const t = this;

      if (params[0] === undefined)
	      throw new Error("Missing parameters");

      t._key = params[0];
      t._type  = params[1];

      const k = t._key;
      t._name  = loc["VC_" + k] ? loc["VC_" + k] : k;

      t._lcField = ' ' + t._name.toLowerCase();

      return t;
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
      const t = this;

      // already defined
      if (t._el !== undefined)
	      return t._el;

      // Create list item
      var li = document.createElement("li");
      if (t._type)
        li.setAttribute("data-type", t._type);

      li.setAttribute("data-key",  t._key);

      // Connect action
      li["onclick"] = t.onclick.bind(t);

      li.addT(t._name);
      return t._el = li;
    }
  };
});
