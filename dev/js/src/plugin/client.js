/**
 * The plugin system is based
 * on registered widgets (iframes) from foreign services.
 * The client component is loaded independently
 * in a plugin and communicates with the embedding
 * KorAP service.
 *
 * @author Nils Diewald
 */

(function () {
  "use strict";

  var obj = {

    /**
     * Create new plugin
     */
    create : function () {
      return Object.create(this)._init();
    },

    /*
     * Initialize plugin
     */
    _init : function () {
      console.log('Init');
      this.resize();
      return this;
    },

    // Send a message
    _sendMsg : function (data) {

      // TODO: This should send a correct origin
      window.parent.postMessage(data, '*');
    },

    /**
     * Send a log message to the embedding KorAP
     */
    log : function (code, msg) {
      this._sendMsg({
        action : 'log',
        code : code,
        msg : msg
      });
    },

    /**
     * Send a resize command to the
     * embedding KorAP
     */
    resize : function () {
      var body = document.body;

      console.log('Resize');

      // recognize margin of first element
      // (don't know why in FF)
      var cs = getComputedStyle(body.children[0]);

      var offsetHeight = parseInt(body.offsetHeight) +
          parseInt(cs.getPropertyValue("margin-top")) +
          parseInt(cs.getPropertyValue("margin-bottom"));

      this._sendMsg({
        'action' : 'resize',
        'height' : offsetHeight
      });
    }
  };

  // Create plugin on windows load
  window.onload = function () {
    window.KorAPlugin = window.KorAPlugin || obj.create();
  };
})();


