/**
 * Hint menu for Kalamar.
 * Based on menu object.
 *
 * @author Nils Diewald
 */
/*
 * TODO: List can be shown when prefix is like 'base/s=pcorenlp/'
 * TODO: Sometimes the drop-down box down vanish when list is shown
 * TODO: Create should expect an input text field
 * TODO: Embed only one single menu (not multiple)
 */
define([
  'hint/input',
  'hint/menu',
  'hint/contextanalyzer',
  'hint/alert',
  'util'
], function (inputClass, 
	     menuClass,
	     analyzerClass,
	     alertClass) {
  "use strict";

  /**
   * @define {regex} Regular expression for context
   */
  KorAP.context = KorAP.context ||
    "(?:^|[^-_a-zA-Z0-9])" +   // Anchor
    "((?:[-_a-zA-Z0-9]+?)\/" + // Foundry
    "(?:" +
    "(?:[-_a-zA-Z0-9]+?)=" +   // Layer
    "(?:"+
    "(?:[^:=\/ ]+?):|" +       // Key
    "(?:[^-=\/ ]+?)-" +        // Node
    ")?" +
    ")?" +
    ")$";
  KorAP.hintArray = KorAP.hintArray || {};

  /**
   * Return keycode based on event
   */

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
    // active : false,

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
      this._menu   = {};
      this._alert  = alertClass.create();
      this._active = false;

      // Get input field
      var qfield = param["inputField"] || document.getElementById("q-field");
      if (!qfield)
	return null;

      // Create input field
      this._inputField = inputClass.create(qfield);

      var inputFieldElement = this._inputField.element();

      var c = this._inputField.container();

      // create alert
      c.appendChild(this._alert.element());

      var that = this;

      this._inputField.container().addEventListener('click', function (e) {
	if (!this.classList.contains('active')) {
	  that.show(false);
	};
      });

      var _down = function (e) {
	var code = _codeFromEvent(e);
	if (code === 40) {
	  this.show(false);
	  e.halt();
	};
      };

      // Move infobox
      inputFieldElement.addEventListener("keyup", this.update.bind(this));
      inputFieldElement.addEventListener("click", this.update.bind(this));

      // Add event listener for key pressed down
      inputFieldElement.addEventListener(
	"keydown", _down.bind(this), false
      );

      // Set Analyzer for context
      this._analyzer = analyzerClass.create(
	param["context"] || KorAP.context
      );
      return this;
    },


    /**
     * Return the input field attached to the hint helper.
     */
    inputField : function () {
      return this._inputField;
    },


    /**
     * Altert at a specific character position.
     */
    alert : function (charPos, msg) {

      if (arguments.length === 0)
	return this._alert;

      // Do not alert if already alerted!
      if (this._alert.active)
	return false;

      // Move to the correct position
      this._inputField.moveto(charPos);

      // Set container to active (aka hide the hint helper button)

      this._alert.show(msg);
      this.active(true);
      return true;
    },

    _unshowAlert : function () {
      this._alert.unshow();
      this.active(false);
    },

    update : function () {
      this._inputField.update();
      if (this._alert.unshow())
	this.active(false);
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

    active : function (bool) {
      if (arguments.length === 1) {
	var c = this._inputField.container();
	if (bool && !this._active) {
	  c.classList.add('active');
	  this._active = true;
	}
	else {
	  c.classList.remove('active');
	  this._active = false;
	}
      };
      return this._active;
    },


    /**
     * Show the menu.
     * Currently this means that multiple menus may be loaded
     * but not shown.
     */
    show : function (ifContext) {

      // Menu is already active
      if (this.active()) {

	// Alert is not active
	if (!this._alert.unshow())
	  return;
      };

      // Get the menu
      var menu;
      if (menu = this.contextMenu(ifContext)) {
	var c = this._inputField.container();
	this.active(true);
	// c.classList.add('active');
	c.appendChild(menu.element());
	menu.show();
	menu.focus();
	// Focus on input field
	// this.inputField.element.focus();
      };
    },

    unshow : function () {
      this.active(false);
      this.inputField().element().focus();
    }
  };
});
