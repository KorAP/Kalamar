/**
 * The plugin system is based
 * on registered widgets (iframes) from
 * foreign services.
 * The server component spawns new iframes and
 * listens to them.
 *
 * @author Nils Diewald
 */

define(["util"], function () {
  "use strict";

  return {

    /**
     * Create new plugin management system
     */
    create : function () {
      return Object.create(this)._init();
    },

    /*
     * Initialize the plugin manager by establishing
     * the global 'message' hook.
     */
    _init : function () {

      var that = this;
      window.addEventListener("message", function (e) {
        that._receiveMsg(e);
      });
      return this;
    },

    /**
     * Open a new widget on a certain element
     * TODO: and register
     */
    addWidget : function (element, src) {

      // Spawn new iframe
      var iframe = element.addE('iframe');
      iframe.setAttribute('allowTransparency',"true");
      iframe.setAttribute('frameborder',0);
      iframe.setAttribute('sandbox','allow-scripts');
      iframe.classList.add('widget');
      iframe.setAttribute('src', src);
    },

    // Receive a call from an embedded iframe
    _receiveMsg : function (e) {
      // Get event data
      var d = e.data;

      // TODO: Check for e.origin!

      // TODO: Deal with mad iframes
   
      // Resize the iframe
      if (d.action === 'resize') {

        // TODO: Check which iframe it was
        // var iframe = document.getElementById('?');

        // this.resize(iframe, d);
        console.log('Resizing not yet implemented');
      }

      // Log message from iframe
      else if (d.action === 'log') {
        KorAP.log(d.code, d.msg);
      }
    },


    // Resize the calling iframe
    resize : function (iframe, d) {
      iframe.style.height = d.height + 'px';
    }
  }
});
