/**
 * Create a panel for a certain aspect of the system, like
 * the result, a match, or the VC.
 *
 * The buttons are associated with the panel's views,
 * though they are integrated independently
 */
define(['buttongroup', 'util'], function (buttonGroupClass) {

  return {
    create : function (classes) {
      return Object.create(this)._init(classes);
    },


    // Override by inheriting object
    _init : function (classes) {
      this.views = [];

      /**
       * Main action buttons for the panel,
       * may be at the bottom (for matches)
       * or as tabs (for the result).
       */

      this._classes = classes;
      var c = ['action', 'button-panel'];
      if (classes)
        c.push.apply(c,classes);
      this.actions = buttonGroupClass.create(c).bind(this);

      // Warning: This is circular
      this.actions.panel = this;
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
      var cl = e.classList;
      cl.add('panel');
   
      if (this._classes)
        cl.add.apply(cl, this._classes);

      this._viewE = e.addE('div');

      // Per default the action buttons are below the view
      // and integrated
      var aElem = this.actions.element();
      if (!aElem.parentNode)
        e.appendChild(aElem);

      this._element = e;
      return e;
    },


    /*
     * The element of the views
     */
    _viewElement : function () {
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

      this._viewElement().appendChild(
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
  }
});
