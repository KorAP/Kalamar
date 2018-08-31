/**
 * Hint menu for Kalamar.
 * Based on menu object.
 *
 * @author Nils Diewald
 */
/*
 * TODO: Check for cnx/syn=
 * TODO: List can be shown when prefix is like 'base/s=pcorenlp/'
 * TODO: Sometimes the drop-down box down vanish when list is shown
 * TODO: Create should expect an input text field
 * TODO: Embed only one single menu (not multiple)
 *       By holding the current menu in _active
 * TODO: show() should accept a context field (especially for no-context fields,
 *       like fragments)
 * TODO: Improve context analyzer from hint!
 * TODO: Marked annotations should be addable to "fragments"
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
      this._active = null;

      // No annotation helper available
      if (!KorAP.annotationHelper) {
        console.log("No annotationhelper defined");
        return;
      };
      
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

      // Add touch events
      inputFieldElement.addEventListener(
        'touchstart',
        this._touch.bind(this),
        false
      );
      inputFieldElement.addEventListener(
        'touchend',
        this._touch.bind(this),
        false
      );
      inputFieldElement.addEventListener(
        'touchmove',
        this._touch.bind(this),
        false
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
      this.active(this._alert);
      return true;
    },
    
    _unshowAlert : function () {
      this._alert.hide();
      this.active(null);
    },

    update : function () {
      this._inputField.update();
      if (this._alert.hide())
        this.active(null);
    },


    /**
     * Return hint menu and probably init based on an action
     */
    menu : function (action) {
      if (this._menu[action] === undefined) {

        // No matching hint menu
        if (KorAP.annotationHelper[action] === undefined)
          return;

        // Create matching hint menu
        this._menu[action] = menuClass.create(
          this, action, KorAP.annotationHelper[action]
        );
      };

      // Return matching hint menu
      return this._menu[action];
    },

    /**
     * Get the correct menu based on the context
     */
    contextMenu : function (ifContext) {
      
      // Get context (aka left text)
      var context = this._inputField.context();

      if (context === undefined || context.length === 0) {
        return ifContext ? undefined : this.menu("-");
      };

      // Get context (aka left text matching regex)
      context = this._analyzer.test(context);

      if (context === undefined || context.length == 0) {
        return ifContext ? undefined : this.menu("-");
      };

      return this.menu(context) || (ifContext ? undefined : this.menu('-'));
    },

    /**
     * Activate a certain menu.
     * If a menu is passed, the menu will be activated.
     * If null is passed, the active menu will be deactivated.
     * If nothing is passed, returns the active menu.
     */
    active : function (obj) {

      // A menu or null was passed
      if (arguments.length === 1) {
        var c = this._inputField.container();

        // Make the menu active
        if (obj !== null) {
          c.classList.add('active');
          this._active = obj;
        }

        // Make the menu inactive
        else {
          c.classList.remove('active');
          this._active = null;
        }
      };

      // Return
      return this._active;
    },


    /**
     * Show the menu.
     * Remove all old menus.
     *
     * @param {boolean} Boolean value to indicate if context
     *        is necessary (true) or if the main context should
     *        be shown if context fails.
     *        
     */
    show : function (ifContext) {

      // Remove the active object
      this._unshow();
      
      // Get the menu
      var menu;
      if (menu = this.contextMenu(ifContext)) {
        this.active(menu);

        var c = this._inputField.container();        
        c.appendChild(menu.element());

        menu.show();
        menu.focus();
        // Focus on input field
        // this.inputField.element.focus();
      }
      else {
        this._inputField.element().focus();
      };
    },
    
    // This will get the context of the field
    getContext : function () {},

    /**
     * Deactivate the current menu and focus on the input field.
     */
    unshow_old : function () {
      this.active(null);
      this.inputField().element().focus();
    },

    /**
     * Deactivate the current menu and focus on the input field.
     */
    unshow : function () {
      this._unshow();
      this._inputField.element().focus();
    },


    // Catch touch events
    _touch : function (e) {

      if (e.type === 'touchstart') {
        var t = e.touches[0];
        this._lastTouch = t.clientY;
      }
      else if (e.type === 'touchend') {
        this._lastTouch = undefined;
      }
      else if (e.type == 'touchmove') {
        var t = e.touches[0];
        if ((this._lastTouch + 10) < t.clientY) {
          this.show();
          this._lastTouch = undefined;
        };
        e.halt();
      }
    },

    
    _unshow : function () {
      if (this.active() !== null) {
        // var act = this.active();

        // This does not work for alert currently!
        //if (act._type !== 'alert') {
        if (!this._alert.active) {

          // This does not work for webkit!
          var c = this._inputField.container();
          c.removeChild(this._active.element());
        }
        else {
          this._unshowAlert();
        };
        
        // this._active.hide();
        this.active(null);
      };
    }
  };
});
