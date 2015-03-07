var KorAP = KorAP || {};

/**
 * Create scrollable drop-down menus.
 *
 * @author Nils Diewald
 */

(function (KorAP) {
  "use strict";

  // Don't let events bubble up
  Event.prototype.halt = function () {
    this.stopPropagation();
    this.preventDefault();
  };

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

    focus : function () {
      this._element.focus();
    },

    // mouse wheel treatment
    _mousewheel : function (e) {
      var delta = 0;
      if (e.wheelDelta) {
	delta = event.wheelDelta / 120; 
      }
      else if (e.detail) {
	delta = - e.detail / 3;
      };
      if (delta < 0) {
	this.next();
      }
      else {
	this.prev();
      };
      e.halt();
    },

    // Arrow key and prefix treatment
    _keydown : function (e) {
      var code = _codeFromEvent(e);

      /*
       * keyCodes:
       * - Down  = 40
       * - Esc   = 27
       * - Up    = 38
       * - Enter = 13
       * - shift = 16
       * for characters use e.key
       */

      switch (code) {
      case 27: // 'Esc'
	e.halt();
	this.hide();
	break;
      case 40: // 'Down'
	e.halt();
	this.next();
	break;
      case 38: // 'Up'
	e.halt();
	this.prev();
	break;
      case 13: // 'Enter'
	console.log('hide');
	e.halt();
	this.hide();
	break;
      case 8: // 'Backspace'
	var p = this.prefix();
	if (p.length > 1) {
	  p = p.substring(0, p.length - 1)
	  this.show(p);
	}
	else {
	  this.show();
	};
	e.halt();
	break;
      default:
	if (e.key !== undefined && e.key.length != 1)
	  return;

	// Add prefix
	if (!this.show(this.prefix() + e.key))
	  this.hide();
      };
    },

    // Initialize list
    _init : function (itemClass, params) {
      // this._element.addEventListener("click", chooseHint, false);
      var that = this;
      this._itemClass = itemClass;
      var e =this._element = document.createElement("ul");
      e.style.opacity = 0;
      e.style.outline = 0;
      e.setAttribute('tabindex', 0);

      // Arrow keys
      e.addEventListener(
	"keydown",
	function (ev) {
	  that._keydown(ev)
	},
	false
      );

      // Mousewheel
      e.addEventListener(
	'DOMMouseScroll',
	function (ev) {
	  that._mousewheel(ev)
	},
	false
      );

      this.active = false;
      this._items = new Array();
      var i;

      // Initialize item list based on parameters
      for (i in params) {
	var obj = itemClass.create(params[i]);
	this._items.push(obj);
      };
      this._limit    = KorAP.menuLimit;
      this._position = 0;  // position in the active list
      this._active   = -1; // active item in the item list
      this._reset();
      return this;
    },

    /**
     * Get the instantiated HTML element
     */
    element : function () {
      return this._element;
    },

    /**
     * Get the creator object for items
     */
    itemClass : function () {
      return this._itemClass;
    },

    /**
     * Get and set numerical value for limit,
     * i.e. the number of items visible.
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
     * @param {Object} An object with properties.
     */
    upgradeTo : function (props) {
      for (var prop in props) {
	this[prop] = props[prop];
      };
      return this;
    },

    // Reset chosen item and prefix
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
	return false;

      // show based on initial offset
      this._showItems(0);

      // Set the first element to active
      // Todo: Or the last element chosen
      this.liveItem(0).active(true);

      this._position = 0;
      this._active = this._list[0];

      this._element.style.opacity = 1;

      // Add classes for rolling menus
      this._boundary(true);
      return true;
    },

    hide : function () {
      this.active = false;
      this.delete();
      this._element.style.opacity = 0;

/*
      this._element.blur();
*/
    },

    // Initialize the list
    _initList : function () {

      // Create a new list
      if (this._list === undefined) {
	this._list = [];
      }
      else if (this._list.length != 0) {
	this._boundary(false);
	this._list.length = 0;
      };

      // Offset is initially zero
      this._offset = 0;

      // There is no prefix set
      if (this.prefix().length <= 0) {
	for (var i = 0; i < this._items.length; i++)
	  this._list.push(i);
	return true;
      };

      // There is a prefix set, so filter the list
      var pos;
      var paddedPrefix = " " + this.prefix();

      // Iterate over all items and choose preferred matching items
      // i.e. the matching happens at the word start
      for (pos = 0; pos < this._items.length; pos++) {
	if ((this.item(pos).lcField().indexOf(paddedPrefix)) >= 0)
	  this._list.push(pos);
      };

      // The list is empty - so lower your expectations
      // Iterate over all items and choose matching items
      // i.e. the matching happens anywhere in the word
      if (this._list.length == 0) {
	for (pos = 0; pos < this._items.length; pos++) {
	  if ((this.item(pos).lcField().indexOf(this.prefix())) >= 0)
	    this._list.push(pos);
	};
      };

      // Filter was successful - yeah!
      return this._list.length > 0 ? true : false;
    },

    // Set boundary for viewport
    _boundary : function (bool) {
      this.item(this._list[0]).noMore(bool);
      this.item(this._list[this._list.length - 1]).noMore(bool);
    },

    /**
     * Get the prefix for filtering,
     * e.g. &quot;ve&quot; for &quot;verb&quot;
     */
    prefix : function () {
      return this._prefix || '';
    },

    // Append Items that should be shown
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

      // Iterate over all visible items
      for (var i = 0; i <= this.limit(); i++) {

	// there is a visible element - unhighlight!
	if (child = this.shownItem(i)) {
	  child.lowlight();
	  child.active(false);
	};
      };

      // Remove all children
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


    // Prepend item to the shown list based on index
    _prepend : function (i) {
      var item = this.item(i);

      // Highlight based on prefix
      if (this.prefix().length > 0)
	item.highlight(this.prefix());

      var e = this.element();
      // Append element
      e.insertBefore(
	item.element(),
	e.firstChild
      );
    },


    /**
     * Get a specific item from the complete list
     *
     * @param {number} index of the list item
     */
    item : function (index) {
      return this._items[index]
    },


    /**
     * Get a specific item from the filtered list
     *
     * @param {number} index of the list item
     *        in the filtered list
     */
    liveItem : function (index) {
      if (this._list === undefined)
	if (!this._initList())
	  return;

      return this._items[this._list[index]];
    },


    /**
     * Get a specific item from the visible list
     *
     * @param {number} index of the list item
     *        in the visible list
     */
    shownItem : function (index) {
      if (index >= this.limit())
	return;
      return this.liveItem(this._offset + index);
    },


    /**
     * Get the length of the full list
     */
    length : function () {
      return this._items.length;
    },


    /**
     * Make the next item in the filtered menu active
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
      else if (this._position >= (this.limit() + this._offset)) {
	this._removeFirst();
	this._offset++;
	this._append(this._list[this._position]);
      };
      newItem.active(true);
    },


    /*
     * Make the previous item in the menu active
     */
    prev : function () {
      // No active element set
      if (this._position == -1)
	return;

      // Set new live item
      var oldItem = this.liveItem(this._position--);
      oldItem.active(false);
      var newItem = this.liveItem(this._position);

      // The previous element is undefined - roll to bottom
      if (newItem === undefined) {
	this._offset = this.liveLength() - this.limit();
	this._position = this.liveLength() - 1;
	newItem = this.liveItem(this._position);
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


    // Remove the HTML node from the first item
    _removeFirst : function () {
      this.item(this._list[this._offset]).lowlight();
      this._element.removeChild(this._element.firstChild);
    },


    // Remove the HTML node from the last item
    _removeLast : function () {
      this.item(this._list[this._offset + this.limit() - 1]).lowlight();
      this._element.removeChild(this._element.lastChild);
    },

    // Length of the filtered list
    liveLength : function () {
      if (this._list === undefined)
	this._initList();
      return this._list.length;
    }
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

  function _codeFromEvent (e) {
    if ((e.charCode) && (e.keyCode==0))
      return e.charCode
    return e.keyCode;
  };

}(this.KorAP));
