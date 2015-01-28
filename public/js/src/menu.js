var KorAP = KorAP || {};

(function (KorAP) {
  "use strict";

  // Default maximum number of menu items
  KorAP.menuLimit = 8;

  /**
   * List of items for drop down menu (complete).
   * Only a sublist of the menu is filtered (live).
   * Only a sublist of the filtered menu is visible (shown).
   */
  KorAP.Menu = {
    /**
     * Create new Menu based on the action prefix
     * and a list of menu items.
     *
     * @this {Menu}
     * @constructor
     * @param {string} Context prefix
     * @param {Array.<Array.<string>>} List of menu items
     */
    create : function (params) {
      return Object.create(KorAP.Menu)._init(params);
    },

    _init : function (itemClass, params) {
      // this._element.addEventListener("click", chooseHint, false);
      this._itemClass = itemClass;
      this._element = document.createElement("ul");
      this._element.style.opacity = 0;

      this.active = false;
      this._items = new Array();
      var i;
      for (i in params) {
	var obj = itemClass.create(params[i]);
	this._items.push(
	  obj
	);
      };
      this._limit    = KorAP.menuLimit;
      this._position = 0;  // position in the active list
      this._active   = -1; // active item in the item list

      this._reset();
      return this;
    },

    element : function () {
      return this._element;
    },

    itemClass : function () {
      return this._itemClass;
    },

    /**
     * Get and set numerical value for limit
     */
    limit : function (limit) {
      if (arguments.length === 1)
	this._limit = limit;
      return this._limit;
    },

    /**
     * Upgrade this object to another object,
     * while private data stays intact.
     *
     * @param {Object] An object with properties.
     */
    upgradeTo : function (props) {
      for (var prop in props) {
	this[prop] = props[prop];
      };
      return this;
    },

    _reset : function () {
      this._offset = 0;
      this._pos    = 0;
      this._prefix = undefined;
    },

    /**
     * Filter the list and make it visible
     *
     * @param {string} Prefix for filtering the list
     */
    show : function (prefix) {
      this._prefix = prefix;

      // Initialize the list
      if (!this._initList())
	return;

      // show based on offset
      this._showItems(0);

      // Set the first element to active
      this.liveItem(0).active(true);

      this._position = 0;
      this._active = this._list[0];

      // Add classes for rolling menus
      this._boundary(true);
    },

    /**
     * Get a specific item from the complete list
     *
     * @param {number} index of the list item
     */
    item : function (index) {
      return this._items[index]
    },

    _initList : function () {

      if (this._list === undefined) {
	this._list = [];
      }
      else if (this._list.length != 0) {
	this._boundary(false);
	this._list.length = 0;
      };

      // Offset is initially zero
      this._offset = 0;

      if (this.prefix().length <= 0) {
	for (var i = 0; i < this._items.length; i++)
	  this._list.push(i);
	return true;
      };

      var pos;
      var paddedPrefix = " " + this.prefix();

      for (pos = 0; pos < this._items.length; pos++) {
	if ((this.item(pos).lcField().indexOf(paddedPrefix)) >= 0)
	  this._list.push(pos);
      };

      if (this._list.length == 0) {
	for (pos = 0; pos < this._items.length; pos++) {
	  if ((this.item(pos).lcField().indexOf(this.prefix())) >= 0)
	    this._list.push(pos);
	};
      };

      // Filter was successful
      return this._list.length > 0 ? true : false;
    },

    // Set boundary for viewport
    _boundary : function (bool) {
      this.item(this._list[0]).noMore(bool);
      this.item(this._list[this._list.length - 1]).noMore(bool);
    },

    /**
     * Get the prefix for filtering,
     * e.g. &quot;ve"&quot; for &quot;verb&quot;
     */
    prefix : function () {
      return this._prefix || '';
    },

    _showItems : function (offset) {
      this.delete();

      // Use list
      var shown = 0;
      var i;
      for (i in this._list) {

	// Don't show - it's before offset
	if (shown++ < offset)
	  continue;

	this._append(this._list[i]);

	if (shown >= (this.limit() + this._offset))
	  break;
      };
    },

    /**
     * Delete all visible items from the menu element
     */
    delete : function () {
      var child;
      for (var i = 0; i <= this.limit(); i++) {

	if (child = this.shownItem(i))
	  child.lowlight();
      };

      while (child = this._element.firstChild)
	this._element.removeChild(child);
    },


    // Append item to the shown list based on index
    _append : function (i) {
      var item = this.item(i);

      // Highlight based on prefix
      if (this.prefix().length > 0)
	item.highlight(this.prefix());

      // Append element
      this.element().appendChild(item.element());
    },


    /**
     * Get a specific item from the filtered list
     *
     * @param {number} index of the list item
     */
    liveItem : function (index) {
      if (this._list === undefined)
	if (!this._initList())
	  return;

      return this._items[this._list[index]];
    },

    length : function () {
      return this._items.length;
    },


    /**
     * Get a specific item from the visible list
     *
     * @param {number} index of the list item
     */
    shownItem : function (index) {
      if (index >= this.limit())
	return;
      return this.liveItem(this._offset + index);
    },


    /*
     * Make the next item in the menu active
     */
    next : function () {
      // No active element set
      if (this._position == -1)
	return;

      // Set new live item
      var oldItem = this.liveItem(this._position++);
      oldItem.active(false);
      var newItem = this.liveItem(this._position);

      // The next element is undefined - roll to top
      if (newItem === undefined) {
	this._offset = 0;
	this._position = 0;
	newItem = this.liveItem(0);
	this._showItems(0);
      }

      // The next element is outside the view - roll down
      else if (this._position >= (this.limit + this._offset)) {
	this._removeFirst();
	this._offset++;
	this._append(this._list[this._position]);
      };
      newItem.active(true);
    },


    /*
     * Make the previous item in the menu active
     */
/*
    prev : function () {
      if (this._position == -1)
	return;

      // Set new live item
      var oldItem = this.liveItem(this._position--);
      oldItem.active(false);
      var newItem = this.liveItem(this._position);

      // The previous element is undefined - roll to bottom
      if (newItem === undefined) {
	this._position = this.liveLength - 1;
	newItem = this.liveItem(this._position);
	this._offset = this.liveLength - this.limit;
	this._showItems(this._offset);
      }

      // The previous element is outside the view - roll up
      else if (this._position < this._offset) {
	this._removeLast();
	this._offset--;
	this._prepend(this._list[this._position]);
      };
      newItem.active(true);
    },
*/


    /**
     * Get the context of the menue,
     * e.g. &quot;tt/&quot; for the tree tagger menu
     */
/*
    get context () {
      return this._context;
    },
*/
/*
    get liveLength () {
      if (this._list === undefined)
	this._initList();
      return this._list.length;
    },
*/
/*
    chooseHint : function (e) {
      var element = e.target;
      while (element.nodeName == "STRONG" || element.nodeName == "SPAN")
	element = element.parentNode;

      if (element === undefined || element.nodeName != "LI")
	return;

      var action = element.getAttribute('data-action');
      hint.insertText(action);
      var menu = hint.menu();
      menu.hide();

      // Fill this with the correct value
      var show;
      if ((show = hint.analyzeContext()) != "-") {
	menu.show(show);
	menu.update(
	  hint._search.getBoundingClientRect().right
	);
      };

      hint._search.focus();
    },

    _removeFirst : function () {
      this.item(this._list[this._offset]).lowlight();
      this._element.removeChild(this._element.firstChild);
    },

    _removeLast : function () {
      this.item(this._list[this._offset + this.limit - 1]).lowlight();
      this._element.removeChild(this._element.lastChild);
    },


    // Prepend item to the shown list based on index
    _prepend : function (i) {
      var item = this.item(i);

      // Highlight based on prefix
      if (this.prefix.length > 0)
	item.highlight(this.prefix);

      // Append element
      this.element.insertBefore(
	item.element,
	this.element.firstChild
      );
    },
*/

  };




  /**
   * Item in the Dropdown menu
   */
  KorAP.MenuItem = {

    /**
     * Create a new MenuItem object.
     *
     * @constructor
     * @this {MenuItem}
     * @param {Array.<string>} An array object of name, action and
     *   optionally a description
     */
    create : function (params) {
      return Object.create(KorAP.MenuItem)._init(params);
    },

    /**
     * Upgrade this object to another object,
     * while private data stays intact.
     *
     * @param {Object] An object with properties.
     */
    upgradeTo : function (props) {
      for (var prop in props) {
	this[prop] = props[prop];
      };
      return this;
    },

    content : function (content) {
      if (arguments.length === 1)
	this._content = document.createTextNode(content);
      return this._content;
    },

    lcField : function () {
      return this._lcField;
    },

    action : function (action) {
      if (arguments.length === 1)
	this._action = action;
      return this._action;
    },

    /**
     * Check or set if the item is active
     *
     * @param {boolean|null} State of activity
     */
    active : function (bool) {
      var cl = this.element().classList;
      if (bool === undefined)
	return cl.contains("active");
      else if (bool)
	cl.add("active");
      else
	cl.remove("active");
    },

    /**
     * Check or set if the item is
     * at the boundary of the menu
     * list
     *
     * @param {boolean|null} State of activity
     */
    noMore : function (bool) {
      var cl = this.element().classList;
      if (bool === undefined)
	return cl.contains("no-more");
      else if (bool)
	cl.add("no-more");
      else
	cl.remove("no-more");
    },

    /**
     * Get the document element of the menu item
     */
    element : function () {
      // already defined
      if (this._element !== undefined)
	return this._element;

      // Create list item
      var li = document.createElement("li");

      // Connect action
      li["action"] = this._action;

      // Append template
      li.appendChild(this.content());

      return this._element = li;
    },

    /**
     * Highlight parts of the item
     *
     * @param {string} Prefix string for highlights
     */
    highlight : function (prefix) {
      var children = this.element().childNodes;
      for (var i = children.length -1; i >= 0; i--) {
	this._highlight(children[i], prefix);
      };
    },

    // Highlight a certain substring of the menu item
    _highlight : function (elem, prefix) {

      if (elem.nodeType === 3) {

	var text   = elem.nodeValue;
	var textlc = text.toLowerCase();
	var pos    = textlc.indexOf(prefix);
	if (pos >= 0) {

	  // First element
	  if (pos > 0) {
	    elem.parentNode.insertBefore(
	      document.createTextNode(text.substr(0, pos)),
	      elem
	    );
	  };

	  // Second element
	  var hl = document.createElement("mark");
	  hl.appendChild(
	    document.createTextNode(text.substr(pos, prefix.length))
	  );
	  elem.parentNode.insertBefore(hl, elem);

	  // Third element
	  var third = text.substr(pos + prefix.length);
	  if (third.length > 0) {
	    var thirdE = document.createTextNode(third);
	    elem.parentNode.insertBefore(
	      thirdE,
	      elem
	    );
	    this._highlight(thirdE, prefix);
	  };

	  var p = elem.parentNode;
	  p.removeChild(elem);
	};
      }
      else {
	var children = elem.childNodes;
	for (var i = children.length -1; i >= 0; i--) {
	  this._highlight(children[i], prefix);
	};
      };
    },


    /**
     * Remove highlight of the menu item
     */
    lowlight : function () {
      var e = this.element();

      var marks = e.getElementsByTagName("mark");
      for (var i = marks.length - 1; i >= 0; i--) {
	// Create text node clone
	var x = document.createTextNode(
	  marks[i].firstChild.nodeValue
	);

	// Replace with content
	marks[i].parentNode.replaceChild(
	  x,
	  marks[i]
	);
      };

      // Remove consecutive textnodes
      e.normalize();
    },

    // Initialize menu item
    _init : function (params) {

      if (params[0] === undefined)
	throw new Error("Missing parameters");

      this.content(params[0]);

      if (params.length === 2)
	this._action = params[1];

      this._lcField = ' ' + this.content().textContent.toLowerCase();

      return this;
    },
  };

}(this.KorAP));
