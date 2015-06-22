/**
 * Menu showing all predefined virtual collections.
 * THIS IS EXPERIMENTAL AND MAY BE REMOVED!
 */
define(['vc/menu', 'api'], function (menuClass, itemClass) {
  return {
    create : function (params) {
      return Object.create(menuClass)
	.upgradeTo(this)
	._init(itemClass, undefined, params);
    },

    /**
     * A click event was released
     */
    release : function (id, name) {
      if (this._cb !== undefined)
	this._cb(id, name);
    }
  };
}); 
