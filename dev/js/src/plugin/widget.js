/**
 * The plugin system is based
 * on registered widgets (iframes) from
 * foreign services.
 * The widget component represents a single iframe.
 *
 * @author Nils Diewald
 */

define(["util"], function () {
  "use strict";

  return {

    /**
     * Create new widget
     */
    create : function (src, id) {
      return Object.create(this)._init(src, id);
    },

    // Initialize widget
    _init : function (src, id) {
      this.src = src;
      this.id = id;
      return this;
    },

    /**
     * The element of the widget
     */
    element : function () {

      if (this._element)
        return this._element;

      // Spawn new iframe
      var i = document.createElement('iframe');
      i.setAttribute('allowTransparency',"true");
      i.setAttribute('frameborder', 0);
      i.setAttribute('sandbox','allow-scripts');
      i.classList.add('widget');
      i.style.height = '0px';
      i.setAttribute('name', this.id);
      i.setAttribute('src', this.src);
      this._element = i;

      return i;
    },

    // Resize iframe
    resize : function (data) {
      this._element.style.height = data.height + 'px';
    },

    // Shutdown suspicious iframe
    shutdown : function () {
      this._element.parentNode.removeChild(this._element);
    }
  }
});
