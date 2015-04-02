/**
 * Hint menu for Kalamar.
 *
 * @author Nils Diewald
 */

// requires menu.js

var KorAP = KorAP || {};

(function (KorAP) {
  "use strict";

  // Default log message
  KorAP.log = KorAP.log || function (type, msg) {
    console.log(type + ": " + msg);
  };

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

  // Input field for queries
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
	this._container = this._mirror.appendChild(document.createElement("div"));
	this._mirror.style.height = "1px";
	document.getElementsByTagName("body")[0].appendChild(this._mirror);
      };

      // Update position of the mirror
      var that = this;
      window.resize = function () {
	that.reposition();
      };

      that.reposition();

      return this;
    },

    rightPos : function () {
      var box = this._mirror.getBoundingClientRect();
      return box.right - box.left;
    },

    mirror : function () {
      return this._mirror;
    },

    container : function () {
      return this._container;
    },

    element : function () {
      return this._element;
    },

    value : function () {
      return this._element.value;
    },

    update : function () {
      this._mirror.firstChild.textContent = this.split()[0];
    },

    insert : function (text) {
      var splittedText = this.split();
      var s = this._element;
      s.value = splittedText[0] + text + splittedText[1];
      s.selectionStart = (splittedText[0] + text).length;
      s.selectionEnd = s.selectionStart;
      this._mirror.firstChild.textContent = splittedText[0] + text;
    },

    // Return two substrings, splitted at current cursor position
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

      // Reset position
      var mirrorStyle = this._mirror.style;
      mirrorStyle.left = inputClientRect.left + "px";
      mirrorStyle.top  = inputClientRect.bottom + "px";

      // These may be relevant in case of media depending css
      mirrorStyle.paddingLeft     = inputStyle.getPropertyValue("padding-left");
      mirrorStyle.marginLeft      = inputStyle.getPropertyValue("margin-left");
      mirrorStyle.borderLeftWidth = inputStyle.getPropertyValue("border-left-width");
      mirrorStyle.borderLeftStyle = inputStyle.getPropertyValue("border-left-style");
      mirrorStyle.fontSize        = inputStyle.getPropertyValue("font-size");
      mirrorStyle.fontFamily      = inputStyle.getPropertyValue("font-family");
    },
    context : function () {
      return this.split()[0];
    }
  };


  /**
   * Regex object for checking the context of the hint
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
   * Hint menu item based on MenuItem
   */
  KorAP.HintMenuItem = {
    create : function (params) {
      return Object.create(KorAP.MenuItem)
	.upgradeTo(KorAP.HintMenuItem)
	._init(params);
    },
    content : function (content) {
      if (arguments.length === 1) {
	this._content = content;
      };
      return this._content;
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
    onclick : function () {
      var m = this.menu();
      var h = m.hint();
      m.hide();

      h.inputField().insert(this._action);
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

  KorAP.HintMenuPrefix = {
    create : function (params) {
      return Object.create(KorAP.MenuPrefix).upgradeTo(KorAP.HintMenuPrefix)._init(params);
    },
    onclick : function () {
      var m = this.menu();
      var h = m.hint();
      m.hide();

      h.inputField().insert(this.value());
      h.active = false;
    }
  };

  KorAP.HintMenu = {
    create : function (hint, context, params) {
      var obj = Object.create(KorAP.Menu)
	.upgradeTo(KorAP.HintMenu)
	._init(KorAP.HintMenuItem, KorAP.HintMenuPrefix, params);
      obj._context = context;
      obj._element.classList.add('hint');
      obj._hint = hint;

      // This is only domspecific
      obj.element().addEventListener('blur', function (e) {
	this.menu.hide();
      });

      // Focus on input field on hide
      obj.onHide = function () {
	var input = this._hint.inputField();
	input.element().focus();
      };

      return obj;
    },
    // Todo: Is this necessary?
    context : function () {
      return this._context;
    },
    hint : function () {
      return this._hint;
    }
  };


  /**
   * KorAP.Hint.create({
   *   inputField : node,
   *   context : context regex
   * });
   */
  KorAP.Hint = {

    // Some variables
    // _firstTry : true,
    active : false,

    create : function (param) {
      return Object.create(KorAP.Hint)._init(param);
    },

    _init : function (param) {
      param = param || {};

      // Holds all menus per prefix context
      this._menu = {};

      // Get input field
      this._inputField = KorAP.InputField.create(
	param["inputField"] || document.getElementById("q-field")
      );

      var inputFieldElement = this._inputField.element();

      var that = this;

      // Add event listener for key pressed down
      inputFieldElement.addEventListener(
	"keypress", function (e) {
	  var code = _codeFromEvent(e);
	  if (code === 40) {
	    that.show(false);
	    e.halt();
	  };
	}, false
      );

      // Move infobox 
      inputFieldElement.addEventListener(
	"keyup", function (e) {
	  var input = that._inputField;
	  input.update();
	  input.container().style.left = input.rightPos() + 'px';
	}
      );

      // Set Analyzer for context
      this._analyzer = KorAP.ContextAnalyzer.create(
	param["context"] || KorAP.context
      );
      return this;
    },

    inputField : function () {
      return this._inputField;
    },

    /**
     * A new update by keypress
     */
    /*
updateKeyPress : function (e) {
      if (!this._active)
	return;

      var character = String.fromCharCode(_codeFromEvent(e));

      e.halt(); // No event propagation

      // Only relevant for key down
      console.log("TODO: filter view");
    },
    */

    // updateKeyDown : function (e) {},

    /**
     * Return hint menu and probably init based on an action
     */
    menu : function (action) {

      if (this._menu[action] === undefined) {

	// No matching hint menu
	if (KorAP.hintArray[action] === undefined)
	  return;

	// Create matching hint menu
	this._menu[action] = KorAP.HintMenu.create(
	  this, action, KorAP.hintArray[action]
	);

      };

      // Return matching hint menu
      return this._menu[action];
    },

    /**
     * Get the correct menu based on the context
     */
    contextMenu : function (ifContext) {
      var context = this._inputField.context();
      if (context === undefined || context.length == 0)
	return ifContext ? undefined : this.menu("-");

      context = this._analyzer.test(context);
      if (context === undefined || context.length == 0)
	return ifContext ? undefined : this.menu("-");

      return this.menu(context);
    },


    /**
     * Show the menu
     */
    show : function (ifContext) {

      // Menu is already active
      if (this.active)
	return;

      // Initialize the menus position
      /*
      if (this._firstTry) {
	this._inputField.reposition();
	this._firstTry = false;
      };
      */

      // update

      // Get the menu
      var menu;
      if (menu = this.contextMenu(ifContext)) {
	this._inputField.container().appendChild(menu.element());
	menu.show('');
	menu.focus();
// Update bounding box
/*
      }
      else if (!ifContext) {
	//	this.hide();
      };
*/
      // Focus on input field
      // this.inputField.element.focus();
      };
    }
  };


  /**
   * Return keycode based on event
   */
  function _codeFromEvent (e) {
    if ((e.charCode) && (e.keyCode==0))
      return e.charCode
    return e.keyCode;
  };

}(this.KorAP));
