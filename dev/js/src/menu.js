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

      this._itemClass = params["itemClass"] || defaultItemClass;

      // Add prefix object
      if (params["prefixClass"] !== undefined) {
        this._prefix = params["prefixClass"].create();
      }
      else {
        this._prefix = defaultPrefixClass.create();
      };
      this._prefix._menu = this;

      // Add lengthField object
      if (params["lengthFieldClass"] !== undefined) {
        this._lengthField = params["lengthFieldClass"].create();
      }
      else {
        this._lengthField = defaultLengthFieldClass.create();
      };
      this._lengthField._menu = this;

      // Initialize slider
      this._slider = sliderClass.create(this);

      // Create the element
      var el = document.createElement("ul");
      with (el) {
        style.outline = 0;
        setAttribute('tabindex', 0);
        classList.add('menu', 'roll');
        appendChild(this._prefix.element());
        appendChild(this._lengthField.element());
        appendChild(this._slider.element());
      };

      // This has to be cleaned up later on
      el["menu"] = this;

      // Arrow keys
      el.addEventListener(
        'keydown',
        this._keydown.bind(this),
        false
      );

      // Strings
      el.addEventListener(
        'keypress',
        this._keypress.bind(this),
        false
      );

      // Mousewheel
      el.addEventListener(
        'wheel',
        this._mousewheel.bind(this),
        false
      );

      // Touch
      el.addEventListener(
        'touchstart',
        this._touch.bind(this),
        false
      );
      el.addEventListener(
        'touchend',
        this._touch.bind(this),
        false
      );
      el.addEventListener(
        'touchmove',
        this._touch.bind(this),
        false
      );

      
      this._element = el;

      this._limit = menuLimit;
      
      this._items = new Array();

      // TODO:
      // Make this separate from _init
      this.readItems(list);

      this.dontHide = false;
        
      return this;
    },

    // Read items to add to list
    readItems : function (list) {

      this._list = undefined;

      // Remove circular reference to "this" in items
      for (var i = 0; i < this._items.length; i++) {
        delete this._items[i]["_menu"];
        delete this._items[i];
      };

      this._items = new Array();
      this.removeItems();


      // Initialize items
      this._lengthField.reset();

      var i = 0;
      // Initialize item list based on parameters
      list.forEach(function(i){
        var obj = this._itemClass.create(i);

        // This may become circular
        obj["_menu"] = this;
        this._lengthField.add(i);
        this._items.push(obj);
      }, this);

      this._slider.length(this.liveLength())
        .limit(this._limit)
        .reInit();
      
      this._firstActive = false;
      // Show the first item active always?
      this.offset = 0;
      this.position = 0;
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
      this.offset = 0;

      // There is no prefix set
      if (this.prefix().length <= 0) {

        // add all items to the list and lowlight
        let i = 0;
        for (; i < this._items.length; i++) {
          this._list.push(i);
          this._items[i].lowlight();
        };

        this._slider.length(i).reInit();

        return true;
      };

      /*
       * There is a prefix set, so filter the list!
       */
      var pos;
      var prefixList = this.prefix().toLowerCase().split(" ");

      var items = [];
      var maxPoints = 1; // minimum 1

      // Iterate over all items and choose preferred matching items
      // i.e. the matching happens at the word start
      this._items.forEach(function(it, pos){

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
      },this);

      // The list is empty - so lower your expectations
      // Iterate over all items and choose matching items
      // i.e. the matching happens anywhere in the word
      /*
      prefix = prefix.substring(1);
      if (this._list.length == 0) {
        for (pos = 0; pos < this._items.length; pos++) {
          if ((this.item(pos).lcField().indexOf(prefix)) >= 0)
            this._list.push(pos);
        };
      };
      */

      this._slider.length(this._list.length).reInit();

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
      this._items.forEach(function(i) {
        delete i["_menu"];
      });

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

    // touchmove treatment
    _touch : function (e) {
      var s = this.slider();
      if (e.type === "touchstart") {
        // s.active(true);
        var t = e.touches[0];
        this._lastTouch = t.clientY;
      }
      else if (e.type === "touchend") {
        // s.active(false);
        this._lastTouch = undefined;
      }
      else if (e.type === "touchmove") {
        var t = e.touches[0];

        // TODO:
        // Instead of using 26px, choose the item height
        // or use the menu height // shownItems
        
        // s.movetoRel(t.clientY - this._initTouch);
        if ((this._lastTouch + 26) < t.clientY) {
          this.viewDown();
          this._lastTouch = t.clientY;
        }
        else if ((this._lastTouch - 26) > t.clientY) {
          this.viewUp();
          this._lastTouch = t.clientY;
        }
        e.halt();
      };
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
      if (e.charCode !== 0) {
        e.halt();
        var c = String.fromCharCode(_codeFromEvent(e));
        
        // Add prefix
        this._prefix.add(c);
        this.show();
      };
    },

    /**
     * Show a screen with a given offset
     * in the viewport.
     */
    screen : function (nr) {

      // Normalize negative values
      if (nr < 0) {
        nr = 0
      }

      // The shown list already shows everything
      else if (this.liveLength() < this.limit()) {
        return false;
      }

      // Move relatively to the next screen
      else if (nr > (this.liveLength() - this.limit())) {
        nr = (this.liveLength() - this.limit());
      };

      // no change
      if (this.offset === nr)
        return false;

      this._showItems(nr);

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

      // show menu based on initial offset
      this._unmark();     // Unmark everything that was marked before
      this.removeItems();

      // Initialize the list
      if (!this._initList()) {

        // The prefix is not active
        this._prefix.active(true);

        // finally show the element
        this._element.classList.add('visible');
        
        return true;
      };

      var offset = 0;

      // Set a chosen value to active and move the viewport
      if (arguments.length === 1) {

        // Normalize active value
        if (active < 0) {
          active = 0;
        }
        else if (active >= this.liveLength()) {
          active = this.liveLength() - 1;
        };

        // Item is outside the first viewport
        if (active >= this._limit) {
          offset = active;
          if (offset > (this.liveLength() - this._limit)) {
            offset = this.liveLength() - this._limit;
          };
        };
        
        this.position = active;
      }

      // Choose the first item
      else if (this._firstActive) {
        this.position = 0;
      }

      // Choose no item
      else {
        this.position = -1;
      };

      this.offset = offset;
      this._showItems(offset); // Show new item list

      // Make chosen value active
      if (this.position !== -1) {
        this.liveItem(this.position).active(true);
      };

      // The prefix is not active
      this._prefix.active(false);

      // finally show the element
      this._element.classList.add('visible');

      // Add classes for rolling menus
      this._boundary(true);

      return true;
    },


    /**
     * Hide the menu and call the onHide callback.
     */
    hide : function () {
      if(!this.dontHide){
          this.removeItems();
          this._prefix.clear();
          this.onHide();
          this._element.classList.remove('visible');
      } 
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

      // No list
      if (this.liveLength() === 0)
        return;

      // Deactivate old item
      if (this.position !== -1 && !this._prefix.active()) {
        this.liveItem(this.position).active(false);
      };

      // Get new active item
      this.position++;
      var newItem = this.liveItem(this.position);

      // The next element is undefined - roll to top or to prefix
      if (newItem === undefined) {

        // Activate prefix
        var prefix = this._prefix;

        // Prefix is set and not active - choose!
        if (prefix.isSet() && !prefix.active()) {
          this.position--;
          prefix.active(true);
          return;
        }

        // Choose first item
        else {
          newItem = this.liveItem(0);
          // choose first item
          this.position = 0;
          this._showItems(0);
        };
      }

      // The next element is after the viewport - roll down
      else if (this.position >= (this.limit() + this.offset)) {
        this.screen(this.position - this.limit() + 1);
      }

      // The next element is before the viewport - roll up
      else if (this.position <= this.offset) {
        this.screen(this.position);
      };

      this._prefix.active(false);
      newItem.active(true);
    },

    /*
     * Make the previous item in the menu active
     */
    prev : function () {

      // No list
      if (this.liveLength() === 0)
        return;

      // Deactivate old item
      if (!this._prefix.active()) {

        // No active element set
        if (this.position === -1) {
          this.position = this.liveLength();
        }

        // No active element set
        else {
          this.liveItem(this.position--).active(false);
        };
      };

      // Get new active item
      var newItem = this.liveItem(this.position);

      // The previous element is undefined - roll to bottom
      if (newItem === undefined) {

        // Activate prefix
        var prefix = this._prefix;
        var offset =  this.liveLength() - this.limit();
        
        // Normalize offset
        offset = offset < 0 ? 0 : offset;

        // Choose the last item
        this.position = this.liveLength() - 1;
        
        // Prefix is set and not active - choose!
        if (prefix.isSet() && !prefix.active()) {
          this.position++;
          prefix.active(true);
          this.offset = offset;
          return;
        }

        // Choose last item
        else {
          newItem = this.liveItem(this.position);
          this._showItems(offset);
        };
      }

      // The previous element is before the view - roll up
      else if (this.position < this.offset) {
        this.screen(this.position);
      }

      // The previous element is after the view - roll down
      else if (this.position >= (this.limit() + this.offset)) {
        this.screen(this.position - this.limit() + 2);
      };

      this._prefix.active(false);
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
        var item = this._items[it];
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

      // optimization: scroll down one step
      if (this.offset === (off - 1)) {
        this.offset = off;

        // Remove the HTML node from the first item
        // leave lengthField/prefix/slider
        this._element.removeChild(this._element.children[3]);
        var pos = this.offset + this.limit() - 1;
        this._append(this._list[pos]);
      }

      // optimization: scroll up one step
      else if (this.offset === (off + 1)) {
        this.offset = off;

        // Remove the HTML node from the last item
        this._element.removeChild(this._element.lastChild);

        this._prepend(this._list[this.offset]);
      }
      else {
        this.offset = off;

        // Remove all items
        this.removeItems();

        // Use list
        var shown = 0;
        var i;

        for (let i = 0; i < this._list.length; i++) {

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
      this._slider.offset(this.offset);
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
    }
  };
});
