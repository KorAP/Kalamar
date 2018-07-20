/**
 * The plugin system is based
 * on registered widgets (iframes) from
 * foreign services.
 * The server component spawns new iframes and
 * listens to them.
 *
 * @author Nils Diewald
 */

define(["plugin/widget", "util"], function (widgetClass) {
  "use strict";

  // Contains all widgets to address with
  // messages to them
  var widgets = {};

  // This is a counter to limit acceptable incoming messages
  // to a certain amount. For every message, this counter will
  // be decreased (down to 0), for every second this will be
  // increased (up to 100).
  // Once a widget surpasses the limit, it will be killed
  // and called suspicious.
  var maxMessages = 100;
  var limits = {};

  // TODO:
  //   It may be useful to establish a watcher that pings
  //   all widgets every second to see if it is still alive.
  
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

      // TODO:
      //   It is better to establish the listener
      //   only in case there is a widget

      var that = this;
      this._listener = this._receiveMsg.bind(that);
      window.addEventListener("message", this._listener);

      // Every second increase the limits of all registered widgets
      var myTimer = setInterval(function () {
        for (var i in limits) {
          if (limits[i]++ >= maxMessages) {
            limits[i] = maxMessages;
          }
        }
      }, 1000);
      return this;
    },

    /**
     * Open a new widget as a child to a certain element
     */
    addWidget : function (element, src) {

      // Create a unique random ID per widget
      var id = 'id-' + this._randomID();

      // Create a new widget
      var widget = widgetClass.create(src, id);

      // Store the widget based on the identifier
      widgets[id] = widget;
      limits[id] = maxMessages;

      // Open widget in frontend
      element.appendChild(
        widget.element()
      );

      return id;
    },

    // Receive a call from an embedded iframe.
    // The handling needs to be very careful,
    // as this can easily become a security nightmare.
    _receiveMsg : function (e) {
      // Get event data
      var d = e.data;

      // If no data given - fail
      // (probably check that it's an assoc array)
      if (!d)
        return;

      // e.origin is probably set and okay - CHECK!

      // Get origin ID
      var id = d["originID"];

      // If no origin ID given - fail
      if (!id)
        return;

      // Get the widget
      var widget = widgets[id];

      // If the addressed widget does not exist - fail
      if (!widget)
        return;

      // Check for message limits
      if (limits[id]-- < 0) {

        // Kill widget
        KorAP.log(0, 'Suspicious action by widget', widget.src);
        widget.shutdown();
        delete limits[id];
        delete widgets[id];
        return;
      };

      // Resize the iframe
      if (d.action === 'resize') {
        widget.resize(d);
      }

      // Log message from iframe
      else if (d.action === 'log') {
        KorAP.log(d.code, d.msg,  widget.src);
      };

      // TODO:
      //   Close
    },

    // Get a random identifier
    _randomID : function () {
      return randomID(20);
    },

    // Destructor, just for testing scenarios
    destroy : function () {
      limits = {};
      widgets = {};
      window.removeEventListener("message", this._listener);
    }
  }
});
