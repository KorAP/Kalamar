/**
 * Scrollable drop-down menus with view filter.
 *
 * @author Nils Diewald
 */
/*
 * TODO: Show the slider briefly on move (whenever screen is called).
 * TODO: Ignore alt+ and strg+ key strokes.
 * TODO: Should scroll to a chosen value after prefixing, if the chosen value is live
 * TODO: Add a "title" to a menu that is not scrollable.
 * TODO: Make the menu responsive by showing less items on smaller screens
 *       or anytime items would be outside the screen.
 * TODO: Add a .match() method to items for scrolling and probably for prefixing.
 * TODO: Add static header (for title, sortation fields, but also for menu points like "fragments" and "history".
 * TODO: Support space separated list of prefixes so "co no" will highlight "common noun"
 */

"use strict";
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
  const menuLimit = 8;

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
     *
     * Accepts an associative array containg the elements
     * itemClass, prefixClass, lengthFieldClass
     *
     * @this {Menu}
     * @constructor
     * @param {string} Context prefix
     * @param {Array.<Array.<string>>} List of menu items
     */
    create : function (list, params) {
      return Object.create(this)._init(list, params);
    },

    // Initialize list
    _init : function (list, params) {
      
      if (params === undefined)
        params = {};

      const t = this;

      t._itemClass = params["itemClass"] || defaultItemClass;

      // Add prefix object
      if (params["prefixClass"] !== undefined) {
        t._prefix = params["prefixClass"].create();
      }
      else {
        t._prefix = defaultPrefixClass.create();
      };
      t._prefix._menu = t;

      // Add lengthField object
      if (params["lengthFieldClass"] !== undefined) {
        t._lengthField = params["lengthFieldClass"].create();
      }
      else {
        t._lengthField = defaultLengthFieldClass.create();
      };
      t._lengthField._menu = t;

      // Initialize slider
      t._slider = sliderClass.create(t);

      // Create the element
      var el = document.createElement("ul");
      el.style.outline = 0;
      el.setAttribute('tabindex', 0);
      el.classList.add('menu', 'roll');
      el.appendChild(t._prefix.element());
      el.appendChild(t._lengthField.element());
      el.appendChild(t._slider.element());

      // This has to be cleaned up later on
      el["menu"] = t;

      // Arrow keys
      el.addEventListener(
        'keydown',
        t._keydown.bind(t),
        false
      );

      // Strings
      el.addEventListener(
        'keypress',
        t._keypress.bind(t),
        false
      );

      // Mousewheel
      el.addEventListener(
        'wheel',
        t._mousewheel.bind(t),
        false
      );

      // Touch events
      ['touchstart', 'touchend', 'touchmove'].forEach(
        e => el.addEventListener(e, t._touch.bind(t), false)
      );

      
      t._element = el;

      t._limit = menuLimit;
      
      t._items = new Array();

      // TODO:
      // Make this separate from _init
      t.readItems(list);

      t.dontHide = false;
        
      return t;
    },

    // Read items to add to list
    readItems : function (list) {
      const t = this;

      t._list = undefined;

      // Remove circular reference to "this" in items
      for (let i = 0; i < t._items.length; i++) {
        delete t._items[i]["_menu"];
        delete t._items[i];
      };

      t._items = new Array();
      t.removeItems();


      // Initialize items
      t._lengthField.reset();

      // Initialize item list based on parameters
      list.forEach(function(i){
        const obj = this._itemClass.create(i);

        // This may become circular
        obj["_menu"] = this;
        this._lengthField.add(i);
        this._items.push(obj);
      }, t);

      t._slider.length(t.liveLength())
        .limit(t._limit)
        .reInit();
      
      t._firstActive = false;
      // Show the first item active always?
      t.offset = 0;
      t.position = 0;
    },
    
    // Initialize the item list
    _initList : function () {
      const t = this;

      // Create a new list
      if (t._list === undefined) {
        t._list = [];
      }
      else if (t._list.length !== 0) {
        t._boundary(false);
        t._list.length = 0;
      };

      // Offset is initially zero
      t.offset = 0;

      // There is no prefix set
      if (t.prefix().length <= 0) {

        // add all items to the list and lowlight
        let i = 0;
        for (; i < t._items.length; i++) {
          t._list.push(i);
          t._items[i].lowlight();
        };

        t._slider.length(i).reInit();

        return true;
      };

      /*
       * There is a prefix set, so filter the list!
       */
      let pos;
      const prefixList = t.prefix().toLowerCase().split(" ");

      const items = [];
      let maxPoints = 1; // minimum 1

      // Iterate over all items and choose preferred matching items
      // i.e. the matching happens at the word start
      t._items.forEach(function(it, pos){

        let points = 0;

        prefixList.forEach(function(p) {

          // Check if it matches at the beginning
          if ((it.lcField().includes(" " + p))) {
            points += 5;
          }

          // Check if it matches anywhere
          else if (it.lcField().includes(p)) {
            points += 1;
          };
        });

        if (points > maxPoints) {
          this._list = [pos];
          maxPoints = points;
        }
        else if (points == maxPoints) {
          this._list.push(pos);
        }
      }, t);

      t._slider.length(t._list.length).reInit();

      // Filter was successful - yeah!
      return t._list.length > 0 ? true : false;
    },


    /**
     * Destroy this menu
     * (in case you don't trust the
     * mark and sweep GC)!
     */
    destroy : function () {
      const t = this;

      // Remove circular reference to "this" in menu
      if (t._element != undefined)
        delete t._element["menu"]; 

      // Remove circular reference to "this" in items
      t._items.forEach(function(i) {
        delete i["_menu"];
      });

      // Remove circular reference to "this" in prefix
      delete t._prefix['_menu'];
      delete t._lengthField['_menu'];
      delete t._slider['_menu'];
    },


    /**
     * Focus on this menu.
     */
    focus : function () {
      this._element.focus();
    },


    // mouse wheel treatment
    _mousewheel : function (e) {
      const delta = e.deltaY / 120;
      if (delta > 0)
        this.next();
      else if (delta < 0)
        this.prev();
      e.halt();
    },


    // touchmove treatment
    _touch : function (e) {
      const s = this.slider();

      if (e.type === "touchstart") {
        this._lastTouch = e.touches[0].clientY;
      }
      else if (e.type === "touchend") {
        this._lastTouch = undefined;
      }
      else if (e.type === "touchmove") {
        const to = e.touches[0];

        // TODO:
        // Instead of using 26px, choose the item height
        // or use the menu height // shownItems
        
        // s.movetoRel(t.clientY - this._initTouch);
        if ((this._lastTouch + 26) < to.clientY) {
          this.viewDown();
          this._lastTouch = to.clientY;
        }
        else if ((this._lastTouch - 26) > to.clientY) {
          this.viewUp();
          this._lastTouch = to.clientY;
        }
        e.halt();
      };
    },

    // Arrow key and prefix treatment
    _keydown : function (e) {
      const t = this;

      switch (_codeFromEvent(e)) {

      case 27: // 'Esc'
        e.halt();
        t.hide();
        break;

      case 38: // 'Up'
        e.halt();
        t.prev();
        break;

      case 33: // 'Page up'
        e.halt();
        t.pageUp();
        break;

      case 40: // 'Down'
        e.halt();
        t.next();
        break;

      case 34: // 'Page down'
        e.halt();
        t.pageDown();
        break;

      case 39: // 'Right'
        if (t._prefix.active())
          break;

        const item = t.liveItem(t.position);
        
        if (item["further"] !== undefined) {
          item["further"].bind(item).apply();
        };
        
        e.halt();
        break;

      case 13: // 'Enter'
        // Click on prefix
        if (t._prefix.active())
          t._prefix.onclick(e);

        // Click on item
        else
          t.liveItem(t.position).onclick(e);
        e.halt();
        break;

      case 8: // 'Backspace'
        t._prefix.chop();
        t.show();
        e.halt();
        break;
      };
    },


    // Add characters to prefix
    _keypress : function (e) {
      if (e.charCode !== 0) {
        e.halt();
        
        // Add prefix
        this._prefix.add(
          String.fromCharCode(_codeFromEvent(e))
        );

        this.show();
      };
    },


    /**
     * Show a screen with a given offset
     * in the viewport.
     */
    screen : function (nr) {
      const t = this;

      // Normalize negative values
      if (nr < 0) {
        nr = 0
      }

      // The shown list already shows everything
      else if (t.liveLength() < t.limit()) {
        return false;
      }

      // Move relatively to the next screen
      else if (nr > (t.liveLength() - t.limit())) {
        nr = (t.liveLength() - t.limit());
      };

      // no change
      if (t.offset === nr)
        return false;

      t._showItems(nr);

      return true;
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
          this._slider.limit(limit).reInit();
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
      const t = this;

      // show menu based on initial offset
      t._unmark();     // Unmark everything that was marked before
      t.removeItems();

      // Initialize the list
      if (!t._initList()) {

        // The prefix is not active
        t._prefix.active(true);

        // finally show the element
        t._element.classList.add('visible');
        
        return true;
      };

      let offset = 0;

      // Set a chosen value to active and move the viewport
      if (arguments.length === 1) {

        // Normalize active value
        if (active < 0) {
          active = 0;
        }
        else if (active >= t.liveLength()) {
          active = t.liveLength() - 1;
        };

        // Item is outside the first viewport
        if (active >= t._limit) {
          offset = active;
          const newOffset = t.liveLength() - t._limit;
          if (offset > newOffset) {
            offset = newOffset;
          };
        };
        
        t.position = active;
      }

      // Choose the first item
      else if (t._firstActive) {
        t.position = 0;
      }

      // Choose no item
      else {
        t.position = -1;
      };

      t.offset = offset;
      t._showItems(offset); // Show new item list

      // Make chosen value active
      if (t.position !== -1) {
        t.liveItem(t.position).active(true);
      };

      // The prefix is not active
      t._prefix.active(false);

      // finally show the element
      t._element.classList.add('visible');

      // Add classes for rolling menus
      t._boundary(true);

      return true;
    },


    /**
     * Hide the menu and call the onHide callback.
     */
    hide : function () {
      if (!this.dontHide) {
        this.removeItems();
        this._prefix.clear();
        this.onHide();
        this._element.classList.remove('visible');
      }
      // this._element.blur();
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
      // Remove all children
      const children = this._element.childNodes;

      // Leave the prefix and lengthField
      for (let i = children.length - 1; i >= 3; i--) {
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

      return this.liveItem(this.offset + index);
    },


    /**
     * Get the length of the full item list
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
      const t = this;

      // No list
      if (t.liveLength() === 0)
        return;

      // Deactivate old item
      if (t.position !== -1 && !t._prefix.active()) {
        t.liveItem(t.position).active(false);
      };

      // Get new active item
      t.position++;
      let newItem = t.liveItem(t.position);

      // The next element is undefined - roll to top or to prefix
      if (newItem === undefined) {

        // Activate prefix
        const prefix = this._prefix;

        // Prefix is set and not active - choose!
        if (prefix.isSet() && !prefix.active()) {
          t.position--;
          prefix.active(true);
          return;
        }

        // Choose first item
        else {
          newItem = t.liveItem(0);
          // choose first item
          t.position = 0;
          t._showItems(0);
        };
      }

      // The next element is after the viewport - roll down
      else if (t.position >= (t.limit() + t.offset)) {
        t.screen(t.position - t.limit() + 1);
      }

      // The next element is before the viewport - roll up
      else if (t.position <= t.offset) {
        t.screen(t.position);
      };

      t._prefix.active(false);
      newItem.active(true);
    },


    /*
     * Make the previous item in the menu active
     */
    prev : function () {
      const t = this;

      // No list
      if (t.liveLength() === 0)
        return;

      // Deactivate old item
      if (!t._prefix.active()) {

        // No active element set
        if (t.position === -1) {
          t.position = t.liveLength();
        }

        // No active element set
        else {
          t.liveItem(t.position--).active(false);
        };
      };

      // Get new active item
      let newItem = t.liveItem(t.position);

      // The previous element is undefined - roll to bottom
      if (newItem === undefined) {

        // Activate prefix
        const prefix = t._prefix;
        let offset =  t.liveLength() - t.limit();
        
        // Normalize offset
        offset = offset < 0 ? 0 : offset;

        // Choose the last item
        t.position = t.liveLength() - 1;
        
        // Prefix is set and not active - choose!
        if (prefix.isSet() && !prefix.active()) {
          t.position++;
          prefix.active(true);
          t.offset = offset;
          return;
        }

        // Choose last item
        else {
          newItem = t.liveItem(t.position);
          t._showItems(offset);
        };
      }

      // The previous element is before the view - roll up
      else if (t.position < t.offset) {
        t.screen(t.position);
      }

      // The previous element is after the view - roll down
      else if (t.position >= (t.limit() + t.offset)) {
        t.screen(t.position - t.limit() + 2);
      };

      t._prefix.active(false);
      newItem.active(true);
    },


    /**
     * Move the page up by limit!
     */
    pageUp : function () {
      this.screen(this.offset - this.limit());
    },


    /**
     * Move the page down by limit!
     */
    pageDown : function () {
      this.screen(this.offset + this.limit());
    },


    /**
     * Move the view one item up
     */
    viewUp : function () {
      this.screen(this.offset - 1);
    },


    /**
     * Move the view one item down
     */
    viewDown : function () {
      this.screen(this.offset + 1);
    },


    // Unmark all items
    _unmark : function () {
      this._list.forEach(function(it){
        const item = this._items[it];
        item.lowlight();
        item.active(false);
      }, this);
    },


    // Set boundary for viewport
    _boundary : function (bool) {
      if (this._list.length === 0)
        return;

      this.item(this._list[0]).noMore(bool);
      this.item(this._list[this._list.length - 1]).noMore(bool);
    },


    // Append Items that should be shown
    _showItems : function (off) {
      const t = this;

      // optimization: scroll down one step
      if (t.offset === (off - 1)) {
        t.offset = off;

        // Remove the HTML node from the first item
        // leave lengthField/prefix/slider
        t._element.removeChild(t._element.children[3]);

        t._append(
          t._list[t.offset + t.limit() - 1]
        );
      }

      // optimization: scroll up one step
      else if (t.offset === (off + 1)) {
        t.offset = off;

        // Remove the HTML node from the last item
        t._element.removeChild(t._element.lastChild);

        t._prepend(t._list[t.offset]);
      }

      else {
        t.offset = off;

        // Remove all items
        t.removeItems();

        // Use list
        let shown = 0;

        for (let i = 0; i < t._list.length; i++) {

          // Don't show - it's before offset
          shown++;
          if (shown <= off)
            continue;

          t._append(t._list[i]);
          
          if (shown >= (t.limit() + off))
            break;
        };
      };

      // set the slider to the new offset
      t._slider.offset(t.offset);
    },


    // Append item to the shown list based on index
    _append : function (i) {
      const item = this.item(i);

      // Highlight based on prefix
      if (this.prefix().length > 0) {
        item.highlight(this.prefix().toLowerCase());
      };

      // Append element
      this.element().appendChild(item.element());
    },


    // Prepend item to the shown list based on index
    _prepend : function (i) {
      const item = this.item(i);

      // Highlight based on prefix
      if (this.prefix().length > 0) {
        item.highlight(this.prefix().toLowerCase());
      };

      const e = this.element();

      // Append element after lengthField/prefix/slider
      e.insertBefore(
        item.element(),
        e.children[3]
      );
    }
  };
});
