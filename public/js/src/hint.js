/**
 * Context aware drop down menu
 * for annotation related query hints.
 *
 * @author Nils Diewald
 */

// - http://www.cryer.co.uk/resources/javascript/script20_respond_to_keypress.htm
// - https://developers.google.com/closure/compiler/docs/js-for-compiler
// TODO:
// - Add help option that opens the tutorial, e.g. to the foundry
// - http://en.wikipedia.org/wiki/JSDoc

/**
 * The KorAP namespace for project related scripts
 * @namespace
 */
var KorAP = KorAP || {};

/*
    this._search.addEventListener(
      "keyup",
      function () {
	that.update();
      },
      false
    );
*/

(function (KorAP) {
  "use strict";

  // Don't let events bubble up
  if (Event.halt !== undefined) {
    Event.prototype.halt = function () {
      this.stopPropagation();
      this.preventDefault();
    };
  };

  // Default log message
  KorAP.log = KorAP.log || function (type, msg) {
    console.log(type + ": " + msg);
  };

  /* TODO: Add event listener on windows resize to change that! */

  /** @define {number} Limited view of menu items */
  KorAP.limit = 8;

  /**
   * @define {regex} Regular expression for context
   */
  KorAP.context =
    "(?:^|[^-_a-zA-Z0-9])" +   // Anchor
    "((?:[-_a-zA-Z0-9]+?)\/" + // Foundry
    "(?:" +
    "(?:[-_a-zA-Z0-9]+?)=" +   // Layer
    "(?:(?:[^:=\/ ]+?):)?" +   // Key
    ")?" +
    ")$";

  // Initialize hint array
  KorAP.hintArray = KorAP.hintArray || {};


  KorAP.updateKeyDown = function (event) {
  };

  KorAP.InputField = {
    create : function (element) {
      return Object.create(KorAP.InputField)._init(element);
    },
    _init : function (element) {
      this._element = element;

      // Create mirror for searchField
      if ((this._mirror = document.getElementById("searchMirror")) === null) {
	this._mirror = document.createElement("div");
	this._mirror.setAttribute("id", "searchMirror");
	this._mirror.appendChild(document.createElement("span"));
	this._mirror.style.height = "1px";
	document.getElementsByTagName("body")[0].appendChild(this._mirror);
      };

      // Update position of the mirror
      var that = this;
      window.resize = function () {
	that.reposition();
      };
/*
      // Add event listener for key down
      element.addEventListener(
	"keydown",
	function (e) {
//	  KorAP.updateKeyDown(e).bind(that)
	},
	false
      );
*/
      return this;
    },
    get mirror () {
      return this._mirror;
    },
    get element () {
      return this._element;
    },
    get value () {
      return this._element.value;
    },
    update : function () {
      this._mirror.firstChild.textContent = this.split()[0];
    },
    insert : function (text) {
      var splittedText = this.split();
      var s = this.element;
      s.value = splittedText[0] + text + splittedText[1];
      s.selectionStart = (splittedText[0] + text).length;
      s.selectionEnd = s.selectionStart;
      this._mirror.firstChild.textContent = splittedText[0] + text;
    },
    // Return two substrings, splitted at current position
    split : function () {
      var s = this._element;
      var value = s.value;
      var start = s.selectionStart;
      return new Array(
	value.substring(0, start),
	value.substring(start, value.length)
      );
    },
    // Position the input mirror directly below the input box
    reposition : function () {
      var inputClientRect = this._element.getBoundingClientRect();
      var inputStyle = window.getComputedStyle(this._element, null);
      var mirrorStyle = this._mirror.style;
      mirrorStyle.left = inputClientRect.left + "px";
      mirrorStyle.top = inputClientRect.bottom + "px";

      // These may be relevant in case of media depending css
      mirrorStyle.paddingLeft     = inputStyle.getPropertyValue("padding-left");
      mirrorStyle.marginLeft      = inputStyle.getPropertyValue("margin-left");
      mirrorStyle.borderLeftWidth = inputStyle.getPropertyValue("border-left-width");
      mirrorStyle.borderLeftStyle = inputStyle.getPropertyValue("border-left-style");
      mirrorStyle.fontSize        = inputStyle.getPropertyValue("font-size");
      mirrorStyle.fontFamily      = inputStyle.getPropertyValue("font-family");
    },
    get context () {
      return this.split()[0];
    }
  };

  KorAP.Hint = {
    _firstTry : true,
    create : function (param) {
      return Object.create(KorAP.Hint)._init(param);
    },
    _init : function (param) {
      param = param || {};
      this._menu = {};

      // Get input field
      this._inputField = KorAP.InputField.create(
	param["inputField"] || document.getElementById("q-field")
      );

      var that = this;
      var inputFieldElement = this._inputField.element;

      // Add event listener for key pressed down
      inputFieldElement.addEventListener(
	"keypress", function (e) {that.updateKeyPress(e)}, false
      );

      // Set Analyzer for context
      this._analyzer = KorAP.ContextAnalyzer.create(
	param["context"]|| KorAP.context
      );

      return this;
    },
    _codeFromEvent : function (e) {
      if ((e.charCode) && (e.keyCode==0))
	return e.charCode
      return e.keyCode;
    },
    updateKeyPress : function (e) {
      if (!this._active)
	return;

      var character = String.fromCharCode(
	this._codeFromEvent(e)
      );

      e.halt(); // No event propagation

      console.log("TODO: filter view");
    },
    updateKeyDown : function (e) {
      var code = this._codeFromEvent(e)
      
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
	// TODO: menu.hide();
	break;
      case 40: // 'Down'
	e.halt(); // No event propagation
	
	// Menu is not active
	if (!this._active)
	  this.popUp();
	// Menu is active
	else {
	  // TODO: that.removePrefix();
	  // TODO: menu.next();
	};

	break;
      case 38: // "Up"
	if (!this._active)
	  break;
	e.halt(); // No event propagation
	// TODO: that.removePrefix();
	// TODO: menu.prev();
	break;
      case 13: // "Enter"
	if (!this._active)
	  break;
	e.halt(); // No event propagation
	// TODO: that.insertText(menu.getActiveItem().getAction());
	// TODO: that.removePrefix();
    
	// Remove menu
	// TODO: menu.hide();

	// Fill this with the correct value
	// Todo: This is redundant with click function
	/*
	var show;
	if ((show = that.analyzeContext()) != "-") {
	  menu.show(show);
	  menu.update(
            e.target.getBoundingClientRect().right
	  );
	};
	*/
    
	break;
      default:
	if (!this._active)
	  return;

	// Surpress propagation in firefox
	/*
	if (e.key !== undefined && e.key.length != 1) {
	  menu.hide();
	};
	*/
      };
    },

    getMenuByContext : function () {
      var context = this._inputField.context;
      if (context === undefined || context.length == 0)
	return this.menu("-");

      context = this._analyzer.analyze(context);
      if (context === undefined || context.length == 0)
	return this.menu("-");

      return this.menu(context);
    },
    // Return and probably init a menu based on an action
    menu : function (action) {
      if (this._menu[action] === undefined) {
	if (KorAP.hintArray[action] === undefined)
	  return;
	this._menu[action] = KorAP.menu.create(action, KorAP.hintArray[action]);
      };
      return this._menu[action];
    },
    get inputField () {
      return this._inputField;
    },
    get active () {
      return this._active;
    },
    popUp : function () {
      if (this.active)
	return;

      if (this._firstTry) {
	this._inputField.reposition();
	this._firstTry = false;
      };

      // update

      var menu;
      if (menu = this.getMenuByContext()) {
	menu.show();
// Update bounding box
      }
      else {
//	this.hide();
      };

      // Focus on input field
      this.inputField.element.focus();
    }
  };

  /**
     Regex object for checking the context of the hint
   */
  KorAP.ContextAnalyzer = {
    create : function (regex) {
      return Object.create(KorAP.ContextAnalyzer)._init(regex);
    },
    _init : function (regex) {
      try {
	this._regex = new RegExp(regex);
      }
      catch (e) {
	KorAP.log("error", e);
	return;
      };
      return this;
    },
    test : function (text) {
      if (!this._regex.exec(text))
	return;
      return RegExp.$1;
    }
  };


  /**
   * List of items for drop down menu (complete).
   * Only a sublist of the menu is filtered (live).
   * Only a sublist of the filtered menu is visible (shown).
   */
  KorAP.Menu = {
    _position : 0,  // position in the active list
    _active   : -1, // active item in the item list

    /**
     * Create new Menu based on the action prefix
     * and a list of menu items.
     *
     * @this {Menu}
     * @constructor
     * @param {string} Context prefix
     * @param {Array.<Array.<string>>} List of menu items
     */
    create : function (context, items) {
      return Object.create(KorAP.Menu)._init(context, items);
    },

    /*
     * Make the previous item in the menu active
     */
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

    /**
     * Delete all visible items from the menu element
     */
    delete : function () {
      var child;
      for (var i = 0; i <= this.limit; i++)
	if (child = this.shownItem(i))
	  child.lowlight();
      while (child = this._element.firstChild)
	this._element.removeChild(child);
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
     * Get the prefix for filtering,
     * e.g. &quot;ve"&quot; for &quot;verb&quot;
     */
    get prefix () {
      return this._prefix || '';
    },

    /**
     * Get the numerical value for limit
     */
    get limit () {
      return KorAP.limit;
    },

    /**
     * Get the context of the menue,
     * e.g. &quot;tt/&quot; for the tree tagger menu
     */
    get context () {
      return this._context;
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
     */
    liveItem : function (index) {
      if (this._list === undefined)
	if (!this._initList())
	  return;

      return this._items[this._list[index]];
    },
    /*
     * Get a specific item from the visible list
     *
     * @param {number} index of the list item
     */
    shownItem : function (index) {
      if (index >= this.limit)
	return;
      return this.liveItem(this._offset + index);
    },
    get element () {
      return this._element;
    },
    get length () {
      return this._items.length;
    },
    get liveLength () {
      if (this._list === undefined)
	this._initList();
      return this._list.length;
    },
    chooseHint : function (e) {
/*
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
*/
    },

    _reset : function () {
      this._offset = 0;
      this._pos = 0;
      this._prefix = undefined;
    },
    _boundary : function (bool) {
      this.item(this._list[0]).noMore(bool);
      this.item(this._list[this._list.length - 1]).noMore(bool);
    },
    _initList : function () {
      if (this._list === undefined)
	this._list = [];
      else if (this._list.length != 0) {
	this._boundary(false);
	this._list.length = 0;
      };

      this._offset = 0;

      if (this.prefix.length <= 0) {
	for (var i = 0; i < this._items.length; i++)
	  this._list.push(i);
	return true;
      };

      var pos;
      var paddedPrefix = " " + this.prefix;
      for (pos = 0; pos < this._items.length; pos++) {
	if ((this.item(pos).lcfield.indexOf(paddedPrefix)) >= 0)
	  this._list.push(pos);
      };
      if (this._list.length == 0) {
	for (pos = 0; pos < this._items.length; pos++) {
	  if ((this.item(pos).lcfield.indexOf(this.prefix)) >= 0)
	    this._list.push(pos);
	};
      };

      // Filter was successful
      return this._list.length > 0 ? true : false;
    },

    _removeFirst : function () {
      this.item(this._list[this._offset]).lowlight();
      this._element.removeChild(this._element.firstChild);
    },

    _removeLast : function () {
      this.item(this._list[this._offset + this.limit - 1]).lowlight();
      this._element.removeChild(this._element.lastChild);
    },

    // Append item to the shown list based on index
    _append : function (i) {
      var item = this.item(i);

      // Highlight based on prefix
      if (this.prefix.length > 0)
	item.highlight(this.prefix);

      // Append element
      this.element.appendChild(item.element);
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
    _init : function (context, items) {
      this._context = context;
      this._element = document.createElement("ul");
      this._element.style.opacity = 0;
      this.active = false;
/*
  Todo:
      this._element.addEventListener("click", chooseHint, false);
*/
      this._items = new Array();
      var i;
      for (i in items)
	this._items.push(KorAP.MenuItem.create(items[i]));

      this._reset();
      return this;
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

	if (shown >= (this.limit + this._offset))
	  break;
      };
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
     * Get the name of the item
     */
    get name () {
      return this._name;
    },

    /**
     * Get the action string
     */
    get action () {
      return this._action;
    },

    /**
     * Get the description of the item
     */
    get desc () {
      return this._desc;
    },

    /**
     * Get the lower case field
     */
    get lcfield () {
      return this._lcfield;
    },

    /**
     * Check or set if the item is active
     *
     * @param {boolean|null} State of activity
     */
    active : function (bool) {
      var cl = this.element.classList;
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
      var cl = this.element.classList;
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
    get element () {
      // already defined
      if (this._element !== undefined)
	return this._element;

      // Create list item
      var li = document.createElement("li");
      li.setAttribute("data-action", this._action);

      // Create title
      var name =  document.createElement("strong");
      name.appendChild(document.createTextNode(this._name));

      li.appendChild(name);

      // Create description
      if (this._desc !== undefined) {
	var desc = document.createElement("span");
	desc.appendChild(document.createTextNode(this._desc));
	li.appendChild(desc);
      };
      return this._element = li;
    },

    /**
     * Highlight parts of the item
     *
     * @param {string} Prefix string for highlights
     */
    highlight : function (prefix) {
      var e = this.element;
      this._highlight(e.firstChild, prefix);
      if (this._desc !== undefined)
	this._highlight(e.lastChild, prefix);
    },

    /**
     * Remove highlight of the menu item
     */
    lowlight : function () {
      var e = this.element;
      e.firstChild.innerHTML = this._name;
      if (this._desc !== undefined)
	e.lastChild.innerHTML = this._desc;
    },

    // Initialize menu item
    _init : function (params) {
      if (params[0] === undefined || params[1] === undefined)
	throw new Error("Missing parameters");

      this._name   = params[0];
      this._action = params[1];
      this._lcfield = " " + this._name.toLowerCase();

      if (params.length > 2) {
	this._desc = params[2];
	this._lcfield += " " + this._desc.toLowerCase();
      };
      return this;
    },

    // Highlight a certain element of the menu item
    _highlight : function (elem, prefix) {
      var text   = elem.firstChild.nodeValue;
      var textlc = text.toLowerCase();
      var pos    = textlc.indexOf(prefix);
      if (pos >= 0) {

	// First element
	elem.firstChild.nodeValue = pos > 0 ? text.substr(0, pos) : "";

	// Second element
	var hl = document.createElement("em");
	hl.appendChild(
	  document.createTextNode(text.substr(pos, prefix.length))
	);
	elem.appendChild(hl);

	// Third element
	elem.appendChild(
	  document.createTextNode(text.substr(pos + prefix.length))
	);
      };
    }
  };
}(this.KorAP));
