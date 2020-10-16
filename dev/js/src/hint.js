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

  // Initialize hint array

  /**
   * KorAP.Hint.create({
   *   inputField : node,
   *   context : context regex
   * });
   */
  return {

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

      // Active may either hold an alert or a menu
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
      const qfield = param["inputField"] || document.getElementById("q-field");
      if (!qfield)
        return null;

      // Create input field
      this._inputField = inputClass.create(qfield);

      // create alert
      const that = this;

      const c = this._inputField.container();
      c.appendChild(this._alert.element());
      c.addEventListener('click', function (e) {
        if (!this.classList.contains('active')) {
          that.show(false);
        };
      });

      // Move infobox
      const inputFieldElement = this._inputField.element();
      inputFieldElement.addEventListener("keyup", this.update.bind(this));
      inputFieldElement.addEventListener("click", this.update.bind(this));

      // Add event listener for key pressed down
      let _down = function (e) {
        if (_codeFromEvent(e) === 40) {
          this.show(false);
          e.halt();
        };
      };

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
      const t = this;
      if (arguments.length === 0)
        return t._alert;

      // Do not alert if already alerted!
      if (t._alert.active)
        return false;

      // Move to the correct position
      t._inputField.moveto(charPos);

      // Set container to active (aka hide the hint helper button)

      t._alert.show(msg);
      t.active(t._alert);
      return true;
    },
    

    /**
     * Update input field.
     */
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
      const noC = ifContext ? undefined : this.menu("-");
      
      // Get context (aka left text)
      let context = this._inputField.context();

      if (context === undefined || context.length === 0) {
        return noC;
      };

      // Get context (aka left text matching regex)
      context = this._analyzer.test(context);

      if (context === undefined || context.length == 0) {
        return noC;
      };

      return this.menu(context) || noC;
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
        const c = this._inputField.container();
       
        // Make the menu active
        if (obj !== null) {
          console.log("Add class");
          c.classList.add('active');
          this._active = obj;
        }

        // Make the menu inactive
        else {
          console.log("Remove class");
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
      let menu;
      if (menu = this.contextMenu(ifContext)) {

        this.active(menu);

        let e = menu.element();
        console.log(">>>");
        console.log("Chrome may send a blur on the old menu here");
        console.log("Active:");
        this._active.element().blur();
        console.log(this._inputField.container());
        this._inputField.container().appendChild(e);
        console.log("<<<");

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
    unshow : function () {
      this._unshow();
      this._inputField.element().focus();
    },


    // Catch touch events
    _touch : function (e) {
      if (e.type === 'touchstart') {
        this._lastTouch = e.touches[0].clientY;
      }

      else if (e.type === 'touchend') {
        this._lastTouch = undefined;
      }
      
      else if (e.type == 'touchmove') {
        if ((this._lastTouch + 10) < e.touches[0].clientY) {
          this.show();
          this._lastTouch = undefined;
        };
        e.halt();
      }
    },


    // Unshow the hint menu
    _unshow : function () {
      if (this.active() !== null) {

        console.log("UNSHOW");
        console.log(this._active.element());
        // this._active.element().blur();
        
        // This does not work for alert currently!
        if (!this._alert.active) {

          // TODO: This does not work for webkit?
          this._inputField
            .container()
            .removeChild(this._active.element());
        }

        else {
          this._unshowAlert();
        };
        
        this.active(null);
      };
    },

    // Unshow alert
    _unshowAlert : function () {
      this._alert.hide();
      this.active(null);
    }
  };
});
