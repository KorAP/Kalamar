/**
 * The plugin system is based
 * on registered widgets (iframes) from foreign services.
 * The client component is loaded independently
 * in a plugin and communicates with the embedding
 * KorAP service.
 *
 * @author Nils Diewald
 */

/*
* TODO:
*   Some methods require bidirectional
*   calling, like
*   - getKoralQuery()
*   this probably should be done using a callback,
*   like fetch({data}, function () {}, '*'), that will
*   add a unique ID to the message and will call on the cb
*   once the answer to that message arrives.
*/
/*
 * When loading the script from a remote KorAP instance,
 * demand using integrity check:
 * https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
 */
"use strict";

const cs = document.currentScript;

(function () {

  // Similar to randomID in server, but a bit cheaper
  function randomID () {
    let s = '';
    for (let i = 0; i < 16; i++) {
      s += Math.floor((Math.random()*16)%16).toString(16);
    };
    return '_' + s;
  };

  let response = {};
  
  let obj = {

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
      this.widgetID = window.name;
      this.server = cs.getAttribute('data-server') || '*';

      // Establish the 'message' hook.
      this._listener = this._receiveMsg.bind(this);
      window.addEventListener("message", this._listener);
      return this;
    },

    // Send a message
    sendMsg : function (data) {
      data["originID"] = this.widgetID;
      window.parent.postMessage(data, this.server);
    },

    // Request data
    requestMsg : function (data, cb) {
      let id = randomID();
      data["_id"] = id;
      response[id] = cb;
      this.sendMsg(data);
    },
    
    // Receive a call from the embedding platform.
    _receiveMsg : function (e) {
      // Get event data
      let d = e.data;

      // If no data given - fail
      // (probably check that it's an assoc array)
      if (!d)
        return;

      // TODO:
      //   check e.origin and d["originID"]!!!
      //   probably against window.parent!

      // There is an associated callback registered:
      // call and remove the function
      if (d["_id"]) {
        let id = d["_id"];
        if (response[id]) {
          response[id](d);
          delete response[id];
        };
        return;
      };
      
      if (this.onMessage)
        this.onMessage(d)
    },
    
    /**
     * Send a log message to the embedding KorAP
     */
    log : function (code, msg) {
      this.sendMsg({
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
      var de = document.documentElement;
      var height = de.scrollHeight;

      // Add assumed scrollbar height
      if (de.scrollWidth > de.clientWidth) {
        height += 14;
      };
      this.sendMsg({
        'action' : 'resize',
        'height' : height
      });
    }
  };

  // Create plugin on windows load
  window.onload = function () {
    window.KorAPlugin = window.KorAPlugin || obj.create();

    // TODO:
    //   Only do this in case of the client being opened
    //   as a widget!
    window.KorAPlugin.resize();

    if (window.pluginit)
      window.pluginit(window.KorAPlugin);
  };

})();

