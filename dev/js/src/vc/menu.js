/**
 * Menu showing all key fields.
 */
define(['menu', 'vc/item', 'vc/prefix'], function (menuClass, itemClass, prefixClass) {
  return {
    create : function (params) {
      var obj = Object.create(menuClass)
          .upgradeTo(this)
          ._init(params, {
            itemClass : itemClass,
            prefixClass : prefixClass
          });
      obj.limit(6);

      // This is only domspecific
      obj.element().addEventListener('blur', function (e) {
        this.menu.hide();
      });
 
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
    }
  };
});
