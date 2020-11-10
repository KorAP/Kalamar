/**
 * Create a view that can be added to a panel,
 * like a tree view or the metadata view.
 */

"use strict";

define(['buttongroup', 'util'], function (buttonGroupClass) {

  const loc = KorAP.Locale;
  loc.CLOSE = loc.CLOSE     || 'Close';  

  return {
    create : function (classes) {
      return Object.create(this)._init(classes);
    },

    // Override by inheriting object
    _init : function (classes) {
      this.panel = undefined;
      this._classes = classes;
      this._shown = false;

      // The buttonclass is bind to the view
      const c = ['action', 'button-view'];
      if (classes)
        c.push.apply(c,classes);
      
      this.actions = buttonGroupClass.create(c).bind(this);

      this.actions.add(loc.CLOSE, {'cls':['button-icon','close']}, function (e) {
        this.close();
      });

      // Warning: This is circular
      this.actions.view = this;

      return this;
    },


    /**
     * Element of the view
     */
    element : function () {
      if (this._el) {
        this._el.classList.add('show');
        return this._el;
      };

      // Create panel element
      const e = document.createElement('div');
      const cl = e.classList;

      cl.add('view', 'show');
      if (this._classes)
        cl.add.apply(cl, this._classes);

      // TODO: The show may need to be wrapped in another DIV!
      if (this.show !== undefined) {
        const s = this.show();
        if (s) {
          e.appendChild(s);
        } else {
          return e
        };
      }

      this._shown = true;

      e.appendChild(this.actions.element());

      return this._el = e;
    },


    /**
     * Is the object shown?
     */
    shown : function () {
      return this._shown;
    },

    
    /**
     * Hide the widget if shown.
     */
    minimize : function () {
      if (this._el) {
        this._el.classList.remove("show");
      }
    },


    // onClose : function () {},

    
    /**
     * Close the view.
     */
    close : function () {

      // Close embedded things before
      if (this.onClose)
        this.onClose();

      const e = this.element();
      if (e.parentNode) {
        e.parentNode.removeChild(e);
      };
      this.panel.delView(this);
      this._shown = false;
    },


    /**
     * Upgrade this object to another object,
     * while private data stays intact.
     *
     * @param {Object] An object with properties.
     */
    upgradeTo : function (props) {
      for (let prop in props) {
        this[prop] = props[prop];
      };
      return this;
    }
  };
});
