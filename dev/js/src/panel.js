/**
 * Create a panel for a certain aspect of the system, like
 * the result, a match, or the VC.
 */
define(['buttongroup', 'util'], function (buttonGroupClass) {

  return {

    // TODO:
    //   Support classes
    create : function (viewpos) {
      return Object.create(this)._init(viewpos);
    },

    _init : function (viewpos) {
      this.views = [];

      this._viewpos = (viewpos == 'down' ? viewpos : 'up');

      
      /**
       * Main action buttons for the panel,
       * may be at the bottom (for matches)
       * or as tabs (for the result).
       */
      this.actions = buttonGroupClass.create(['action', 'panel']);
      return this;
    },

    /**
     * The element of the panel
     */
    element : function () {
      if (this._element)
        return this._element;

      // Create panel element
      var e = document.createElement('div');
      e.classList.add('panel');

      if (this._viewpos == 'up') {
        this._viewE = e.addE('div');
      };

      e.appendChild(this.actions.element());

      if (this._viewpos == 'down') {
        this._viewE = e.addE('div');
      };

      this._element = e;
      return e;
    },


    /**
     * The element of the views
     */
    viewElement : function () {
      this.element();
      return this._viewE;
    },


    /**
     * Add a view to the panel
     */
    add : function (view) {

      // Add view to views list
      this.views.push(view);

      // Append element to panel element

      this.viewElement().appendChild(
        view.element()
      );

      view.panel = this;
    },

    /**
     * Delete a closed view from panel
     */
    delView : function (view) {
      for (i in this.views) {
        if (this.views[i] === view) {
          this.views[i] = undefined;
        }
      }
    },

    /**
     * Elements before the action buttons
     * TODO:
     *   Maybe rename actionLine?
     */
    beforeActions : function (element) {
      if (arguments.length > 0)
        this._beforeActions = element;

      return this._beforeActions;
    },

    /**
     * Element after the action buttons
     */
    afterActions : function (element) {
      if (arguments.length > 0)
        this._afterActions = element;

      return this._afterActions;
    }
  }
});
