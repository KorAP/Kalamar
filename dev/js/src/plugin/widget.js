/**
 * The plugin system is based
 * on registered widgets (iframes) from
 * foreign services.
 * The widget component represents a single iframe and is
 * implemented as a view object.
 *
 * @author Nils Diewald
 */
"use strict";

define(["view","plugin/service","util"], function (viewClass, serviceClass) {

  return {

    /**
     * Create new widget
     */
    create : function (data) {
      return Object.create(viewClass)._init(['widget']).upgradeTo(serviceClass)._init(data).upgradeTo(this)._init();
    },

    // Initialize widget
    _init : function () {
      this.isWidget = true;
      return this;
    },

    /**
     * The element of the widget as embedded in the view
     */
    show : function () {

      if (this._load) {
        if (this._el)
          this._el.classList.add('show');
        return this._load;
      }

      let obj = this.load();
      this._load.classList.add("widget", "show");
      obj.setAttribute('loading', 'lazy');

      // Per default there should at least be a button
      // for settings, if the plugin requires settings.
      // Otherwise a button indicating this is a plugin
      // is a nice idea as well.
      
      this.actions.add(
        this.name, {'cls':['button-icon', 'plugin']}, function (e) {

          // Temporary
          let str = this.name;
          if (this.desc !== undefined) {
            str += "\n\n" + this.desc;
          };
          window.alert(str);
      }.bind(this));
      
      return obj;
    },

    // Resize iframe
    resize : function (data) {
      this.show().style.height = data.height + 'px';
    },


    // On closing the widget view
    onClose : function () {
      if (this._mgr) {
        this._mgr._closeService(this.id);
        this._mgr = undefined;
      };
    }
  }
});
