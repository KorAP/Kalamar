/**
 * Create a view that can be added to a panel,
 * like a tree view or the metadata view.
 */

define(['buttongroup', 'util'], function (buttonGroupClass) {

  return {

    // TODO:
    //   Support classes
    create : function () {
      return Object.create(this)._init();
    },

    _init : function () {
      // ..
      this.panel = undefined;

      // The buttonclass is bind to the view
      this.actions = buttonGroupClass.create(['action', 'view']).bind(this);
      this.actions.add('close', ['button-icon','close'], function (e) {
        this.close();
      });

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
      e.classList.add('view');

      e.appendChild(this.actions.element());

      this._element = e;
      return e;
    },

    /**
     * Close the view.
     */
    close : function () {
      var e = this.element();
      e.parentNode.removeChild(e);
      this.panel.delView(this);
    }
  };
});
