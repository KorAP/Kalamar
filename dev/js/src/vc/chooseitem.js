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
      
      t._id   = params[0];
      t._name = params[1];
      t._desc = params[2];

      t._lcField =  ' ' + t._name.toLowerCase();
      t._lcField += ' ' + t._desc.toLowerCase();

      return this;
    },


    /**
     * Override click event by passing all clicks
     * to the menu object.
     */
    onclick : function (e) {
      this.menu().release(
	      this._id,
	      this._name
      );
      e.halt();
    },


    /**
     * Get the name of the item.
     */
    name : function () {
      return this._name;
    },


    /**
     * Get the identifier of the item.
     */
    id : function () {
      return this._id;
    },


    /**
     * Get the description of the item.
     */
    desc : function () {
      return this._desc;
    },


    /**
     * Get the HTML element associated with the item. 
     */
    element : function () {
      const t = this;

      // already defined
      if (t._element !== undefined)
	      return t._element;

      // Create list item
      const li = document.createElement("li");
      li.setAttribute("data-type", t._type);
      li.setAttribute("data-key",  t._key);

      // Connect action
      li["onclick"] = t.onclick.bind(t);

      li.addT(t._name);
      return t._element = li;
    }
  }
});
