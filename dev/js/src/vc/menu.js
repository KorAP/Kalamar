// Field menu
define(['menu', 'menu/item'], function (menuClass, itemClass) {
  return {
    create : function (params) {
      return Object.create(menuClass)
	.upgradeTo(this)
	._init(itemClass, undefined, params)
    }
  };
});
