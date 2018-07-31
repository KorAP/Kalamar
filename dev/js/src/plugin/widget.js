/**
 * The plugin system is based
 * on registered widgets (iframes) from
 * foreign services.
 * The widget component represents a single iframe and is
 * implemented as a view object.
 *
 * @author Nils Diewald
 */

define(["view","util"], function (viewClass) {
  "use strict";

  return {

    /**
     * Create new widget
     */
    create : function (name, src, id) {
      return Object.create(viewClass)._init(['widget']).upgradeTo(this)._init(name, src, id);
    },

    // Initialize widget
    _init : function (name, src, id) {
      if (!name || !src || !id)
        throw Error("Widget not well defined");
      this.name = name;
      this.src = src;
      this.id = id;
      return this;
    },

    /**
     * The element of the widget as embedded in the view
     */
    show : function () {

      if (this._show)
        return this._show;

      // Spawn new iframe
      var i = document.createElement('iframe');
      i.setAttribute('allowTransparency',"true");
      i.setAttribute('frameborder', 0);
      i.setAttribute('sandbox','allow-scripts');
      i.style.height = '0px';
      i.setAttribute('name', this.id);
      i.setAttribute('src', this.src);

      // Per default there should at least be a button
      // for settings, if the plugin requires settings.
      // Otherwise a button indicating this is a plugin
      // is a nice idea as well.

      this.actions.add(
        this.name, ['button-icon', 'plugin'], function (e) {

          // Temporary
          window.alert("Basic information about this plugin");
      }.bind(this));
      
      this._show = i;
      return i;
    },

    // Resize iframe
    resize : function (data) {
      this.show().style.height = data.height + 'px';
    },


    // On closing the widget view
    onClose : function () {
      if (this._mgr) {
        this._mgr._closeWidget(this._id);
        this._mgr = undefined;
      };
    }
  }
});
