/**
 * Create a panel for a certain aspect of the system, like
 * the result, a match, or the VC.
 *
 * The buttons are associated with the panel's views,
 * though they are integrated independently
 */
"use strict";

define(['buttongroup', 'util'], function (buttonGroupClass) {

  return {
    type : 'base',
    
    create : function (classes) {
      return Object.create(this)._init(classes);
    },


    // Override by inheriting object
    _init : function (classes) {
      const t = this;
      t.views = [];

      /**
       * Main action buttons for the panel,
       * may be at the bottom (for matches)
       * or as tabs (for the result).
       */

      t._classes = classes;
      const c = ['action', 'button-panel'];

      if (classes)
        c.push.apply(c,classes);

      t._actions = buttonGroupClass.create(c).bind(this);

      //prepend or append views of the panel
      t.prepend = false;
      
      // Warning: This is circular
      t._actions.panel = t;
      return t;
    },


    /**
     * The actions of the panel.
     * Can be represented as a buttongroup,
     * a list, ..., requires an "add()" minimum at least.
     */
    actions : function () {
      return this._actions;
    },
    

    /**
     * The element of the panel
     */
    element : function () {
      if (this._el)
        return this._el;

      // Create panel element
      const e = document.createElement('div');
      const cl = e.classList;
      cl.add('panel');
   
      if (this._classes)
        cl.add.apply(cl, this._classes);

      this._viewE = e.addE('div');

      // Per default the action buttons are below the view
      // and integrated
      const aElem = this.actions().element();
      if (!aElem.parentNode)
        e.appendChild(aElem);

      return this._el = e;
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

      // Append or prepend element to panel element
      if (this.prepend){
        this._viewElement().prepend(
          view.element()
        );
      }
      else{
        this._viewElement().appendChild(
          view.element()
        );
      }
      
      if (view.afterEmbed)
        view.afterEmbed();
      
      view.panel = this;
    },


    /**
     * Delete a closed view from panel
     */
    delView : function (view) {
      this.views.forEach(function(e, i, a) {
        if (e === view)
          a[i] = undefined;
      });
    }
  }
});
