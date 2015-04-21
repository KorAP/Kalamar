/**
 * Menu showing all key fields.
 */
define(['menu', 'vc/item'], function (menuClass, itemClass) {
  return {
    create : function (params) {
      return Object.create(menuClass)
	.upgradeTo(this)
	._init(itemClass, undefined, params)
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
    }
  };
});
