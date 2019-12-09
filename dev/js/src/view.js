/**
 * Create a view that can be added to a panel,
 * like a tree view or the metadata view.
 */

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
      var c = ['action', 'button-view'];
      if (classes)
        c.push.apply(c,classes);
      
      this.actions = buttonGroupClass.create(c).bind(this);

      this.actions.add(loc.CLOSE, ['button-icon','close'], function (e) {
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
      if (this._element)
        return this._element;

      // Create panel element
      var e = document.createElement('div');

      var cl = e.classList;
      cl.add('view');
      if (this._classes)
        cl.add.apply(cl, this._classes);

      // TODO: The show may need to be wrapped in another DIV!
      if (this.show !== undefined)
        e.appendChild(this.show());

      this._shown = true;

      e.appendChild(this.actions.element());

      this._element = e;
      return e;
    },


    /**
     * Is the object shown?
     */
    shown : function () {
      return this._shown;
    },

    // onClose : function () {},

    /**
     * Close the view.
     */
    close : function () {

      // Close embedded things before
      if (this.onClose)
        this.onClose();

      var e = this.element();
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
      for (var prop in props) {
        this[prop] = props[prop];
      };
      return this;
    }
  };
});
