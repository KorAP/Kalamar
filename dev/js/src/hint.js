/**
 * Hint menu for Kalamar.
 * Based on menu object.
 *
 * @author Nils Diewald
 */
define([
  'hint/input',
  'hint/menu',
  'hint/contextanalyzer',
  'util'
], function (inputClass, 
	     menuClass, 
	     analyzerClass) {
  "use strict";

  /**
   * @define {regex} Regular expression for context
   */
  KorAP.context = KorAP.context ||
    "(?:^|[^-_a-zA-Z0-9])" +   // Anchor
    "((?:[-_a-zA-Z0-9]+?)\/" + // Foundry
    "(?:" +
    "(?:[-_a-zA-Z0-9]+?)=" +   // Layer
    "(?:(?:[^:=\/ ]+?):)?" +   // Key
    ")?" +
    ")$";
  KorAP.hintArray = KorAP.hintArray || {};

  /**
   * Return keycode based on event
   */
  function _codeFromEvent (e) {
    if ((e.charCode) && (e.keyCode==0))
      return e.charCode
    return e.keyCode;
  };

  // Initialize hint array

  /**
   * KorAP.Hint.create({
   *   inputField : node,
   *   context : context regex
   * });
   */
  return {

    // Some variables
    // _firstTry : true,
    active : false,

    /**
     * Create new hint helper.
     */
    create : function (param) {
      return Object.create(this)._init(param);
    },

    // Initialize hint helper
    _init : function (param) {
      param = param || {};

      // Holds all menus per prefix context
      this._menu = {};

      // Get input field
      var qfield = param["inputField"] || document.getElementById("q-field");
      if (!qfield)
	return null;

      this._inputField = inputClass.create(qfield);

      var inputFieldElement = this._inputField.element();

      var that = this;

      // Add event listener for key pressed down
      inputFieldElement.addEventListener(
	"keydown", function (e) {
	  var code = _codeFromEvent(e);
	  if (code === 40) {
	    that.show(false);
	    e.halt();
	  };
	}, false
      );

      this._inputField.container().addEventListener('click', function (e) {
	if (!this.classList.contains('active')) {
	  that.show(false);
	};
      });

      var _up = function (e) {
	var input = that._inputField;
	input.update();
      };

      // Move infobox
      inputFieldElement.addEventListener("keyup", _up);
      inputFieldElement.addEventListener("click", _up);

      // Set Analyzer for context
      this._analyzer = analyzerClass.create(
	param["context"] || KorAP.context
      );
      return this;
    },

    inputField : function () {
      return this._inputField;
    },

    /**
     * Return hint menu and probably init based on an action
     */
    menu : function (action) {

      if (this._menu[action] === undefined) {

	// No matching hint menu
	if (KorAP.hintArray[action] === undefined)
	  return;

	// Create matching hint menu
	this._menu[action] = menuClass.create(
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

      // Get the menu
      var menu;
      if (menu = this.contextMenu(ifContext)) {
	var c = this._inputField.container();
	c.classList.add('active');
	c.appendChild(menu.element());
	menu.show('');
	menu.focus();
      // Focus on input field
      // this.inputField.element.focus();
      };
    }
  };
});
