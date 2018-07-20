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

  // TODO:
  //   This is a counter to limit acceptable incoming messages
  //   to hundred. For every message, this will be decreased
  //   (down to 0), for every second this will be increased
  //   (up to 100).
  var c = 100;

  // Contains all widgets to address with
  // messages to them
  var widgets = {};

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
     */
    addWidget : function (element, src) {

      // Create a unique random ID per widget
      var id = 'id-' + this._randomID();

      // Create a new widget
      var widget = widgetClass.create(src, id);

      // Store the widget based on the identifier
      widgets[id] = widget;

      // Open widget in frontend
      element.appendChild(
        widget.element()
      );
    },

    // Receive a call from an embedded iframe
    _receiveMsg : function (e) {
      // Get event data
      var d = e.data;

      // e.origin is probably set and okay

      // TODO:
      //   Deal with mad iframes

      // Get the widget
      var widget = widgets[d["originID"]];

      // If the addressed widget does not exist - fail
      if (!widget)
        return;


      // Resize the iframe
      if (d.action === 'resize') {

        widget.resize(d);
      }

      // Log message from iframe
      else if (d.action === 'log') {
        KorAP.log(d.code, d.msg);
      };

      // TODO:
      //   Close
    },

    // Get a random identifier
    _randomID : function () {
      return randomID(20);
    }
  }
});
