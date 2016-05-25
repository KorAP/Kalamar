/**
 * Scrollable drop-down menus with view filter.
 *
 * @author Nils Diewald
 */
/*
 * TODO: space is not a valid prefix!
 * TODO: Ignore keys with function key combinations (other than shift)
 * TODO: Show the slider briefly on move (whenever screen is called).
 * TODO: Optimize scrolling to active item.
 */
define([
  'menu/item',
  'menu/prefix',
  'menu/lengthField',
  'menu/slider',
  'util'
], function (defaultItemClass,
	     defaultPrefixClass,
	     defaultLengthFieldClass,
	     sliderClass) {

  // Default maximum number of menu items
  var menuLimit = 8;

  function _codeFromEvent (e) {
    if (e.charCode && (e.keyCode == 0))
      return e.charCode
    return e.keyCode;
  };


  /**
   * List of items for drop down menu (complete).
   * Only a sublist of the menu is filtered (live).
   * Only a sublist of the filtered menu is visible (shown).
   */
  return {
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
      return Object.create(this)._init(params);
    },

    // Initialize list
    _init : function (itemClass, prefixClass, lengthFieldClass, params) {

      this._itemClass = itemClass || defaultItemClass;

      // Add prefix object
      if (prefixClass !== undefined) {
	this._prefix = prefixClass.create();
      }
      else {
	this._prefix = defaultPrefixClass.create();
      };
      this._prefix._menu = this;

      // Add lengthField object
      if (lengthFieldClass !== undefined) {
	this._lengthField = lengthFieldClass.create();
      }
      else {
	this._lengthField = defaultLengthFieldClass.create();
      };
      this._lengthField._menu = this;

      // Initialize slider
      this._slider = sliderClass.create(this);

      // Create the element
      var e = document.createElement("ul");
      e.style.opacity = 0;
      e.style.outline = 0;
      e.setAttribute('tabindex', 0);
      e.classList.add('menu');
      e.classList.add('roll');
      e.appendChild(this._prefix.element());
      e.appendChild(this._lengthField.element());
      e.appendChild(this._slider.element());

      // This has to be cleaned up later on
      e["menu"] = this;

      // Arrow keys
      e.addEventListener(
	'keydown',
	this._keydown.bind(this),
	false
      );

      // Strings
      e.addEventListener(
	'keypress',
	this._keypress.bind(this),
	false
      );

      // Mousewheel
      e.addEventListener(
	'wheel',
	this._mousewheel.bind(this),
	false
      );

      this._element = e;
      this.active = false;
      // this.selected = undefined;
      this._items = new Array();
      var i = 0;

      // Initialize item list based on parameters
      for (i in params) {
	var obj = this._itemClass.create(params[i]);

	// This may become circular
	obj["_menu"] = this;
	this._lengthField.add(params[i]);
	this._items.push(obj);
      };

      this._limit    = menuLimit;
      this._slider.length(this.liveLength());
      this._slider.limit(this._limit);

      this._firstActive = false; // Show the first item active always?
      this._reset();
      return this;
    },

    // Initialize the item list
    _initList : function () {

      // Create a new list
      if (this._list === undefined) {
	this._list = [];
      }
      else if (this._list.length !== 0) {
	this._boundary(false);
	this._list.length = 0;
      };

      // Offset is initially zero
      this._offset = 0;

      // There is no prefix set
      if (this.prefix().length <= 0) {

	// add all items to the list and lowlight
	var i = 0;
	for (; i < this._items.length; i++) {
	  this._list.push(i);
	  this._items[i].lowlight();
	};

	this._slider.length(i);

	return true;
      };

      /*
       * There is a prefix set, so filter the list!
       */
      var pos;
      var prefix = " " + this.prefix().toLowerCase();

      // Iterate over all items and choose preferred matching items
      // i.e. the matching happens at the word start
      for (pos = 0; pos < this._items.length; pos++) {
	if ((this.item(pos).lcField().indexOf(prefix)) >= 0)
	  this._list.push(pos);
      };

      // The list is empty - so lower your expectations
      // Iterate over all items and choose matching items
      // i.e. the matching happens anywhere in the word
      prefix = prefix.substring(1);
      if (this._list.length == 0) {
	for (pos = 0; pos < this._items.length; pos++) {
	  if ((this.item(pos).lcField().indexOf(prefix)) >= 0)
	    this._list.push(pos);
	};
      };

      this._slider.length(this._list.length);

      // Filter was successful - yeah!
      return this._list.length > 0 ? true : false;
    },


    /**
     * Destroy this menu
     * (in case you don't trust the
     * mark and sweep GC)!
     */
    destroy : function () {

      // Remove circular reference to "this" in menu
      if (this._element != undefined)
	delete this._element["menu"]; 

      // Remove circular reference to "this" in items
      for (var i = 0; i < this._items.length; i++) {
	delete this._items[i]["_menu"];
      };

      // Remove circular reference to "this" in prefix
      delete this._prefix['_menu'];
      delete this._lengthField['_menu'];
      delete this._slider['_menu'];
    },


    /**
     * Focus on this menu.
     */
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
    _keydown : function (e) {
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
	this.pageUp();
	break;
      case 40: // 'Down'
	e.halt();
	this.next();
	break;
      case 34: // 'Page down'
	e.halt();
	this.pageDown();
	break;
      case 39: // 'Right'
	if (this._prefix.active())
	  break;

	var item = this.liveItem(this.position);

	if (item["further"] !== undefined) {
	  item["further"].bind(item).apply();
	};

	e.halt();
	break;
      case 13: // 'Enter'

	// Click on prefix
	if (this._prefix.active())
	  this._prefix.onclick(e);

	// Click on item
	else
	  this.liveItem(this.position).onclick(e);
	e.halt();
	break;
      case 8: // 'Backspace'
	this._prefix.chop();
	this.show();
	e.halt();
	break;
      };
    },

    // Add characters to prefix
    _keypress : function (e) {
      e.halt();
      var c = String.fromCharCode(_codeFromEvent(e));

      // Add prefix
      this._prefix.add(c);
      this.show();
    },

    /**
     * Show a screen with a given offset
     * in the viewport.
     */
    screen : function (nr) {
      if (nr < 0) {
	nr = 0
      }
      else if (nr > (this.liveLength() - this.limit())) {
	nr = (this.liveLength() - this.limit());
      };

      if (this._offset === nr)
	return;

      this._showItems(nr);
    },

    /**
     * Get the associated dom element.
     */
    element : function () {
      return this._element;
    },

    /**
     * Get the creator class for items
     */
    itemClass : function () {
      return this._itemClass;
    },

    /**
     * Get and set the numerical value
     * for the maximum number of items visible.
     */
    limit : function (limit) {
      if (arguments.length === 1) {
	if (this._limit !== limit) {
	  this._limit = limit;
	  this._slider.limit(limit);
	};
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


    /**
     * Filter the list and make it visible.
     * This is always called once the prefix changes.
     *
     * @param {string} Prefix for filtering the list
     */
    show : function (active) {

      // show menu based on initial offset
      this._unmark();     // Unmark everything that was marked before
      this.removeItems();

      // Initialize the list
      if (!this._initList()) {

	// The prefix is not active
	this._prefix.active(true);

	// finally show the element
	this._element.style.opacity = 1;

	return true;
      };

      var offset = 0;

      // Set the first element to active
      // Todo: Or the last element chosen
      if (arguments.length === 1) {

	// Normalize active value
	if (active < 0) {
	  active = 0;
	}
	else if (active > this.liveLength()) {
	  active = this.liveLength() - 1;
	};

	if (active > this._limit) {
	  offset = active;
	  if (offset > (this.liveLength() - this._limit)) {
	      offset = this.liveLength() - this._limit;
	  };
	};

	this.position = active;
      }

      else if (this._firstActive) {
	this.position = 0;
      }

      else {
	this.position = -1;
      };

      this._offset = offset;
      this._showItems(offset); // Show new item list

      // Make chosen value active
      if (this.position !== -1) {
	this.liveItem(this.position).active(true);
      };

      // The prefix is not active
      this._prefix.active(false);

      // finally show the element
      this._element.style.opacity = 1;

      // Show the slider
      //this._slider.show();

      // Iterate to the active item
      if (this.position !== -1 && !this._prefix.isSet()) {

	// TODO: OPTIMIZE

	while (this._list[this.position] < this.position) {

	  // TODO. Improve this by moving using screen!
	  this.next();
	};
      };

      // Add classes for rolling menus
      this._boundary(true);
      return true;
    },


    /**
     * Hide the menu and call the onHide callback.
     */
    hide : function () {
      this.active = false;
      this._unmark();
      this.removeItems();
      this._element.style.opacity = 0;
      this._prefix.clear();
      this.onHide();
      /* this._element.blur(); */
    },

    /**
     * Function released when the menu hides.
     * This method is expected to be overridden.
     */
    onHide : function () {},


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

    /**
     * Get the lengthField object.
     */
    lengthField : function () {
      return this._lengthField;
    },

    /**
     * Get the associated slider object.
     */
    slider : function () {
      return this._slider;
    },


    /**
     * Delete all visible items from the menu element
     */
    removeItems : function () {
      var child;

      // Remove all children
      var children = this._element.childNodes;
      // Leave the prefix and lengthField
      for (var i = children.length - 1; i >= 3; i--) {
	this._element.removeChild(
	  children[i]
	);
      };
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
     * Get a specific item from the viewport list
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
     * Length of the filtered item list.
     */
    liveLength : function () {
      if (this._list === undefined)
	this._initList();
      return this._list.length;
    },


    /**
     * Make the next item in the filtered menu active
     */
    next : function () {

      // No active element set
      var newItem;

      if (this.position !== -1) {
	// Set new live item
	if (!this._prefix.active()) {
	  var oldItem = this.liveItem(this.position);
	  oldItem.active(false);
	};
      };

      this.position++;

      newItem = this.liveItem(this.position);

      // The next element is undefined - roll to top or to prefix
      if (newItem === undefined) {

	// Activate prefix
	var prefix = this._prefix;

	// Mark prefix
	if (prefix.isSet() && !prefix.active()) {
	  this.position--;
	  prefix.active(true);
	  return;
	}
	else {
	  this.position = 0;
	  newItem = this.liveItem(0);
	  this._showItems(0);
	};
      }

      // The next element is after the viewport - roll down
      else if (this.position >= (this.limit() + this._offset)) {
	this.screen(this.position - this.limit() + 1);
      }

      // The next element is before the viewport - roll up
      else if (this.position <= this._offset) {
	this.screen(this.position);
      };

      this._prefix.active(false);
      newItem.active(true);
    },

    /*
     * Make the previous item in the menu active
     */
    prev : function () {

      // No active element set
      if (this.position === -1) {
	return;
	// TODO: Choose last item
      };

      var newItem;

      // Set new live item
      if (!this._prefix.active()) {
	var oldItem = this.liveItem(this.position--);
	oldItem.active(false);
      };

      newItem = this.liveItem(this.position);

      // The previous element is undefined - roll to bottom
      if (newItem === undefined) {

	// Activate prefix
	var prefix = this._prefix;
	var offset =  this.liveLength() - this.limit();
	// this._offset = this.liveLength() - this.limit();

	// Normalize offset
	// this._offset = this._offset < 0 ? 0 : this._offset;
	offset = offset < 0 ? 0 : offset;

	this.position = this.liveLength() - 1;

	if (prefix.isSet() && !prefix.active()) {
	  this.position++;
	  prefix.active(true);
	  this._offset = offset;
	  return;
	}
	else {
	  newItem = this.liveItem(this.position);
	  this._unmark();
	  this._showItems(offset);
	};
      }

      // The previous element is before the view - roll up
      else if (this.position < this._offset) {
	this.screen(this.position);
      }

      // The previous element is after the view - roll down
      else if (this.position >= (this.limit() + this._offset)) {
	this.screen(this.position - this.limit() + 2);
      };

      this._prefix.active(false);
      newItem.active(true);
    },

    /**
     * Move the page up by limit!
     */
    pageUp : function () {
      this.screen(this._offset - this.limit());
    },


    /**
     * Move the page down by limit!
     */
    pageDown : function () {
      this.screen(this._offset + this.limit());
    },


    // Unmark all items
    _unmark : function () {
      for (var i in this._list) {
	var item = this._items[this._list[i]];
	item.lowlight();
	item.active(false);	
      };
    },


    // Reset chosen item and prefix
    _reset : function () {
      this._offset = 0;
      this.position = 0;
      this._prefix.clear();
    },


    // Set boundary for viewport
    _boundary : function (bool) {
      this.item(this._list[0]).noMore(bool);
      this.item(this._list[this._list.length - 1]).noMore(bool);
    },


    // Append Items that should be shown
    _showItems : function (off) {

      // optimization: scroll down one step
      if (this._offset === (off - 1)) {
	this._offset = off;
	this._removeFirst();
	var pos = this._offset + this.limit() - 1;
	this._append(this._list[pos]);
      }

      // optimization: scroll up one step
      else if (this._offset === (off + 1)) {
	this._offset = off;
	this._removeLast();
	this._prepend(this._list[this._offset]);
      }
      else {
	this._offset = off;

	// Remove all items
	this.removeItems();

	// Use list
	var shown = 0;
	var i;

	for (i in this._list) {

	  // Don't show - it's before offset
	  shown++;
	  if (shown <= off)
	    continue;

	  var itemNr = this._list[i];
	  var item = this.item(itemNr);
	  this._append(itemNr);

	  if (shown >= (this.limit() + off))
	    break;
	};
      };

      // set the slider to the new offset
      this._slider.offset(this._offset);
    },


    // Append item to the shown list based on index
    _append : function (i) {
      var item = this.item(i);

      // Highlight based on prefix
      if (this.prefix().length > 0) {
	item.highlight(this.prefix().toLowerCase());
      };


      // Append element
      this.element().appendChild(item.element());
    },


    // Prepend item to the shown list based on index
    _prepend : function (i) {
      var item = this.item(i);

      // Highlight based on prefix
      if (this.prefix().length > 0) {
	item.highlight(this.prefix().toLowerCase());
      };

      var e = this.element();
      // Append element after lengthField/prefix/slider
      e.insertBefore(
	item.element(),
	e.children[3]
      );
    },


    // Remove the HTML node from the first item
    _removeFirst : function () {
      // this.item(this._list[this._offset]).lowlight();
      // leave lengthField/prefix/slider
      this._element.removeChild(this._element.children[3]);
    },


    // Remove the HTML node from the last item
    _removeLast : function () {
      // this.item(this._list[this._offset + this.limit() - 1]).lowlight();
      this._element.removeChild(this._element.lastChild);
    }
  };
});
