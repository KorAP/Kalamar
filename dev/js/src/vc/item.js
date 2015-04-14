// Field menu item
define(['menu/item'], function (itemClass) {
  return {
    create : function (params) {
      return Object.create(itemClass)
	.upgradeTo(this)
	._init(params);
    },

    _init : function (params) {
      if (params[0] === undefined)
	throw new Error("Missing parameters");

      this._name  = params[0];
      this._value = params[1];
      this._type  = params[2];

      this._lcField = ' ' + this._name.toLowerCase();

      return this;
    },

    name : function () {
      return this._name;
    },

    type : function () {
      return this._type;
    },

    element : function () {
      // already defined
      if (this._element !== undefined)
	return this._element;

      // Create list item
      var li = document.createElement("li");
      li.setAttribute("data-type", this._type);
      li.setAttribute("data-value", this._value);
      li.appendChild(document.createTextNode(this._name));
      return this._element = li;
    }
  };
});
