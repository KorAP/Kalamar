  /**
   * Menu to choose from for tree views.
   */
define(['menu', 'match/treeitem'], function (menuClass, itemClass) {
  "use strict";

  return {
    create : function (info, params) {
      var obj = Object.create(menuClass)
	.upgradeTo(this)
	._init(itemClass, undefined, params);
      obj.limit(6);
      obj._info = info;

      // This is only domspecific
      obj.element().addEventListener('blur', function (e) {
	this.menu.hide();
      });
      
      return obj;
    },
    info :function () {
      return this._info;
    }
  };
});
