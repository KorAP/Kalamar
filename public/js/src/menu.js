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

      delta = e.deltaY / 120;
      if (delta > 0)
	this.next();
      else if (delta < 0)
	this.prev();
      e.halt();
    },

    // Arrow key and prefix treatment
    _keypress : function (e) {
      var code = _codeFromEvent(e);

      switch (code) {
      case 27: // 'Esc'
	e.halt();
	this.hide();
	break;

      case 38: // 'Up'
	e.halt();
	this.prev();
	break;
      case 33: // 'Page up'
	e.halt();
	this.prev();
	break;
      case 40: // 'Down'
	e.halt();
	this.next();
	break;
      case 34: // 'Page down'
	e.halt();
	this.next();
	break;
      case 39: // 'Right'
	var item = this.liveItem(this._position);
	if (item["further"] !== undefined) {
	  item["further"].bind(item).apply();
	  e.halt();
	};
	break;
      case 13: // 'Enter'

	// Click on prefix
	if (this._prefix.active())
	  this._prefix.onclick();

	// Click on item
	else
	  this.liveItem(this._position).onclick();
	e.halt();
	break;
      case 8: // 'Backspace'
	this._prefix.backspace();
	this.show();
	e.halt();
	break;
      default:
	if (e.key !== undefined &&
	    e.key.length != 1)
	  return;

	// Add prefix
	this._prefix.add(e.key.toLowerCase());

	if (!this.show()) {
	  this.prefix('').show();
	};
      };
    },

    // Initialize list
    _init : function (itemClass, prefixClass, params) {
      var that = this;
      this._itemClass = itemClass;

      if (prefixClass !== undefined)
	this._prefix = prefixClass.create();
      else
	this._prefix = KorAP.MenuPrefix.create();

      var e = document.createElement("ul");
      e.style.opacity = 0;
      e.style.outline = 0;
      e.setAttribute('tabindex', 0);
      e.setAttribute('class', 'menu');
      e.appendChild(this._prefix.element());

      // Arrow keys
      e.addEventListener(
	'keypress',
	function (ev) {
	  that._keypress(ev)
	},
	false
      );

      // Mousewheel
      e.addEventListener(
	'wheel',
	function (ev) {
	  that._mousewheel(ev)
	},
	false
      );

      this._element = e;
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
      if (arguments.length === 1) {
	this._limit = limit;
	return this;
      };
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
      this._prefix.value('');
    },

    /**
     * Filter the list and make it visible
     *
     * @param {string} Prefix for filtering the list
     */
    show : function () {
      // Initialize the list
      if (!this._initList())
	return false;

      // show based on initial offset
      this._showItems(0);

      // Set the first element to active
      // Todo: Or the last element chosen
      this.liveItem(0).active(true);

      this._active = this._list[0];
      this._position = 0;
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
	var i = 0;
	for (; i < this._items.length; i++)
	  this._list.push(i);
	while (this._items[++i] !== undefined) {
	  this._items[i].lowlight();
	  console.log(this._item);
	};
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
    prefix : function (pref) {
      if (arguments.length === 1) {
	this._prefix.value(pref);
	return this;
      };
      return this._prefix.value();
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

      /*
      // Iterate over all visible items
      for (var i = 0; i <= this.limit(); i++) {

	// there is a visible element
	// unhighlight!
	if (child = this.shownItem(i)) {
	  child.lowlight();
	  child.active(false);
	};
      };
      */

      for (var i in this._list) {
	var item = this._items[this._list[i]];
	item.lowlight();
	item.active(false);	
      };

      // Remove all children
      var children = this._element.childNodes;
      for (var i = children.length - 1; i >= 1; i--) {
	this._element.removeChild(
	  children[i]
	);
      };
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
	e.children[1]
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
      if (this._position === -1)
	return;

      var newItem;

      // Set new live item
      var oldItem = this.liveItem(this._position++);
      oldItem.active(false);
      newItem = this.liveItem(this._position);

      // The next element is undefined - roll to top or to prefix
      if (newItem === undefined) {

	// Activate prefix
	var prefix = this._prefix;

	// Mark prefix
	if (prefix.isSet() && !prefix.active()) {
	  this._position--;
	  prefix.active(true);
	  return;
	}
	else {
	  this._offset = 0;
	  this._position = 0;
	  newItem = this.liveItem(0);
	  this._showItems(0);
	};
      }

      // The next element is outside the view - roll down
      else if (this._position >= (this.limit() + this._offset)) {
	this._removeFirst();
	this._offset++;
	this._append(this._list[this._position]);
      };

      this._prefix.active(false);
      newItem.active(true);
    },


    /*
     * Make the previous item in the menu active
     */
    prev : function () {

      // No active element set
      if (this._position == -1)
	return;

      var newItem;

      // Set new live item
      if (!this._prefix.active()) {
	var oldItem = this.liveItem(this._position--);
	oldItem.active(false);
      };

      newItem = this.liveItem(this._position);

      // The previous element is undefined - roll to bottom
      if (newItem === undefined) {

	// Activate prefix
	var prefix = this._prefix;
	this._offset = this.liveLength() - this.limit();

	// Normalize offset
	this._offset = this._offset < 0 ? 0 : this._offset;

	this._position = this.liveLength() - 1;

	if (prefix.isSet() && !prefix.active()) {

	  this._position++;
	  prefix.active(true);
	  return;
	}
	else {
	  newItem = this.liveItem(this._position);
	  this._showItems(this._offset);
	};
      }

      // The previous element is outside the view - roll up
      else if (this._position < this._offset) {
	this._removeLast();
	this._offset--;
	this._prepend(this._list[this._position]);
      };

      this._prefix.active(false);
      newItem.active(true);
    },


    // Length of the filtered list
    liveLength : function () {
      if (this._list === undefined)
	this._initList();
      return this._list.length;
    },


    // Remove the HTML node from the first item
    _removeFirst : function () {
      this.item(this._list[this._offset]).lowlight();
      this._element.removeChild(this._element.children[1]);
    },


    // Remove the HTML node from the last item
    _removeLast : function () {
      this.item(this._list[this._offset + this.limit() - 1]).lowlight();
      this._element.removeChild(this._element.lastChild);
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
      if (this.onclick !== undefined)
	li["onclick"] = this.onclick.bind(this);

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

  KorAP.MenuPrefix = {
    create : function (params) {
      return Object.create(KorAP.MenuPrefix)._init();
    },
    _init : function () {
      this._string = '';

      // Add prefix span
      this._element = document.createElement('span');
      this._element.classList.add('pref');
      return this;
    },
    _update : function () {
      this._element.innerHTML
      = this._string;
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

    active : function (bool) {
      var cl = this.element().classList;
      if (bool === undefined)
	return cl.contains("active");
      else if (bool)
	cl.add("active");
      else
	cl.remove("active");
    },
    element : function () {
      return this._element;
    },
    isSet : function () {
      return this._string.length > 0 ?
	true : false;
    },
    value : function (string) {
      if (arguments.length === 1) {
	this._string = string;
	this._update();
      };
      return this._string;
    },
    add : function (string) {
      this._string += string;
      this._update();
    },
    onclick : function () {},
    backspace : function () {
      if (this._string.length > 1) {
	this._string = this._string.substring(
	  0, this._string.length - 1
	);
      }
      else {
	this._string = '';
      };

      this._update();
    }
  };

  function _codeFromEvent (e) {
    if (e.charCode && (e.keyCode == 0))
      return e.charCode
    return e.keyCode;
  };

}(this.KorAP));

/**
 * MenuItems may define:
 *
 * onclick: action happen on click and enter.
 * further: action happen on right arrow
 */
