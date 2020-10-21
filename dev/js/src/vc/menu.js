/**
 * Menu showing all key fields.
 */
"use strict";

define([
  'menu',
  'vc/item',
  'vc/prefix'
], function (
  menuClass,
  itemClass,
  prefixClass) {

  return {

    create : function (params) {
      const obj = Object.create(menuClass)
            .upgradeTo(this)
            ._init(params, {
              itemClass : itemClass,
              prefixClass : prefixClass
            });
      obj.limit(6);

      // This is only domspecific
      obj.element().addEventListener(
        'blur', function (e) {
          this.menu.hide();
        }
      );
 
      return obj;
    },


    /**
     * Register callback for click event.
     */
    released : function (cb) {
      this._cb = cb;
    },


    /**
     * A click event was released
     */
    release : function (key, type) {
      if (this._cb !== undefined)
        this._cb(key, type);
    },


    /**
     * Return a key type based on a key.
     * This is a linear search, but should work okay for small
     * VCs and small key lists.
     */
    typeOf : function (key) {
      const found = this._items.find(i => i.key() === key);

      if (found)
        return found.type();
    }
  };
});
