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

  // Localization values
  const loc   = KorAP.Locale;
  loc.CLOSE     = loc.CLOSE     || 'Close';

  return {

    /**
     * Create new widget
     */
    create : function (name, src, id) {
      return Object.create(this)._init(name, src, id);
    },

    // Initialize widget
    _init : function (name, src, id) {
      this.name = name;
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

      var div = document.createElement('div');
      div.classList.add('widget');

      // Spawn new iframe
      var i = div.addE('iframe');
      i.setAttribute('allowTransparency',"true");
      i.setAttribute('frameborder', 0);
      i.setAttribute('sandbox','allow-scripts');
      i.style.height = '0px';
      i.setAttribute('name', this.id);
      i.setAttribute('src', this.src);
      this._iframe = i;

      var ul = div.addE('ul');
      ul.classList.add('action','right');

      // Add close button
      var close = ul.addE('li');
      close.addE('span').addT(loc.CLOSE);
      close.classList.add('close');
      close.setAttribute('title', loc.CLOSE);

      // Add info button on plugin
      var plugin = ul.addE('li');
      plugin.addE('span').addT(this.name);
      plugin.classList.add('plugin');
      plugin.setAttribute('title', this.name);
      
      // Close match
      close.addEventListener('click', function (e) {
        e.halt();
        this.shutdown()
      }.bind(this));
      
      this._element = div;

      return div;
    },

    // Return iframe of widget
    iframe : function () {
      if (this._iframe)
        return this._iframe;
      this.element();
      return this._iframe;
    },

    // Resize iframe
    resize : function (data) {
      this.iframe().style.height = data.height + 'px';
    },

    // Shutdown suspicious iframe
    shutdown : function () {
      this._element.parentNode.removeChild(this._element);
    }
  }
});
