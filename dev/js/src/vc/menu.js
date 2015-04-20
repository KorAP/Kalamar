// Field menu
define(['menu', 'vc/item'], function (menuClass, itemClass) {
  return {
    create : function (params) {
      return Object.create(menuClass)
	.upgradeTo(this)
	._init(itemClass, undefined, params)
    },
    released : function (cb) {
      this._cb = cb;
    },
    release : function (name, value, type) {
      if (this._cb !== undefined)
	this._cb(name, value, type);
    }
  };
});
