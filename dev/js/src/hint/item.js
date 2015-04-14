/**
 * Hint menu item based on MenuItem
 */
define(['menu/item'], function (itemClass) {
  return {
    create : function (params) {
      return Object.create(itemClass)
	.upgradeTo(this)
	._init(params);
    },
    _init : function (params) {
      if (params[0] === undefined ||
	  params[1] === undefined)
	throw new Error("Missing parameters");
      
      this._name   = params[0];
      this._action = params[1];
      this._lcField = ' ' + this._name.toLowerCase();
      
      if (params.length > 2) {
	this._desc = params[2];
	this._lcField += " " + this._desc.toLowerCase();
      };

      return this;
    },

    content : function (content) {
      if (arguments.length === 1) {
	this._content = content;
      };
      return this._content;
    },
    
    onclick : function () {
      var m = this.menu();
      var h = m.hint();
      m.hide();

      // Update input field
      var input = h.inputField();
      input.insert(this._action);
      input.update();

      h.active = false;
      h.show(true);
    },
    name : function () {
      return this._name;
    },
    action : function () {
      return this._action;
    },
    desc : function () {
      return this._desc;
    },
    element : function () {
      // already defined
      if (this._element !== undefined)
	return this._element;

      // Create list item
      var li = document.createElement("li");

      if (this.onclick !== undefined) {
	li["onclick"] = this.onclick.bind(this);
      };

      // Create title
      var name =  document.createElement("span");
      name.appendChild(document.createTextNode(this._name));
      
      li.appendChild(name);

      // Create description
      if (this._desc !== undefined) {
	var desc = document.createElement("span");
	desc.classList.add('desc');
	desc.appendChild(document.createTextNode(this._desc));
	li.appendChild(desc);
      };
      return this._element = li;
    }
  };
});
