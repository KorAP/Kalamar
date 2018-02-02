define(['menu/item', 'util'], function (itemClass) {

  var loc = KorAP.Locale;

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
      if (params[0] === undefined)
	      throw new Error("Missing parameters");
      
      this._id  = params[0];
      this._name = params[1];
      this._desc  = params[2];

      this._lcField =  ' ' + this._name.toLowerCase();
      this._lcField += ' ' + this._desc.toLowerCase();

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

      // already defined
      if (this._element !== undefined)
	      return this._element;

      // Create list item
      var li = document.createElement("li");
      li.setAttribute("data-type", this._type);
      li.setAttribute("data-key",  this._key);

      // Connect action
      li["onclick"] = this.onclick.bind(this);

      li.addT(this._name);
      return this._element = li;
    }
  }
});
