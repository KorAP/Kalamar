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

  KorAP.Panel = KorAP.Panel || {};

  // Contains all widgets to address with
  // messages to them
  var widgets = {};
  var plugins = {};

  // TODO:
  //   These should better be panels and every panel
  //   has a buttonGroup

  // List of panels with dynamic buttons, i.e.
  // panels that may occur multiple times.
  var buttons = {
    match : []
  };

  // List of panels with static buttons, i.e.
  // panels that occur only once.
  var buttonsSingle = {
    query : []
  }
  
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
  //   all widgets every second to see if it is still alive,
  //   otherwise kill
  
  // Load Plugin server
  return {

    /**
     * Create new plugin management system
     */
    create : function () {
      return Object.create(this)._init();
    },

    /*
     * Initialize the plugin manager
     */
    _init : function () {
      return this;
    },

    /**
     * Register a plugin described as a JSON object.
     *
     * This is work in progress.
     *
     * Example:
     *
     *   KorAP.Plugin.register({
     *     'name' : 'CatContent',
     *     'desc' : 'Some content about cats',
     *     'about' : 'https://localhost:5678/',
     *     'embed' : [{
     *       'panel' : 'match',
     *       'title' : loc.TRANSLATE,
     *       'classes' : ['translate']
     *       'onClick' : {
     *         'action' : 'addWidget',
     *         'template' : 'https://localhost:5678/?match={matchid}',
     *       }
     *     }]
     *   });
     *
     */
    register : function (obj) {
      // TODO:
      //   These fields need to be localized for display by a structure like
      //   { de : { name : '..' }, en : { .. } }
      var name = obj["name"];

      if (!name)
        throw new Error("Missing name of plugin");

      // Register plugin by name
      var plugin = plugins[name] = {
        name : name,
        desc : obj["desc"],
        about : obj["about"],
        widgets : []
      };

      if (typeof obj["embed"] !== 'object')
        throw new Error("Embedding of plugin is no list");
 
      // Embed all embeddings of the plugin
      var that = this;
      for (var i in obj["embed"]) {
        var embed = obj["embed"][i];

        if (typeof embed !== 'object')
          throw new Error("Embedding of plugin is no object");

        var panel = embed["panel"];

        if (!panel || !(buttons[panel] || buttonsSingle[panel]))
          throw new Error("Panel for plugin is invalid");

        var onClick = embed["onClick"];

        // Needs to be localized as well
        var title = embed["title"];

        // The embedding will open a widget
        if (!onClick["action"] || onClick["action"] == "addWidget") {

          var cb = function (e) {

            // "this" is bind to the panel

            // Get the URL of the widget
            var url = onClick["template"];
            // that._interpolateURI(onClick["template"], this.match);

            // Add the widget to the panel
            var id = that.addWidget(this, name, url);
            plugin["widgets"].push(id);
          };

          // Add to dynamic button list (e.g. for matches)
          if (buttons[panel]) {
            buttons[panel].push([title, embed["classes"], cb]);
          }

          // Add to static button list (e.g. for query) already loaded
          else if (KorAP.Panel[panel]) {
            KorAP.Panel[panel].actions.add(title, embed["classes"], cb);
          }

          // Add to static button list (e.g. for query) not yet loaded
          else {
            buttonsSingle[panel].push([title, embed["classes"], cb]);
          }
        };
      };
    },


    // TODO:
    //   Interpolate URIs similar to https://tools.ietf.org/html/rfc6570
    //   but as simple as possible
    _interpolateURI : function (uri, obj) {
      // ...
    },


    /**
     * Get named button group - better rename to "action"
     */
    buttonGroup : function (name) {
      if (buttons[name] != undefined) {
        return buttons[name];
      } else if (buttonsSingle[name] != undefined) {
        return buttonsSingle[name];
      };
      return [];
    },

    /**
     * Clear named button group - better rename to "action"
     */
    clearButtonGroup : function (name) {
      if (buttons[name] != undefined) {
        buttons[name] = [];
      } else if (buttonsSingle[name] != undefined) {
        buttonsSingle[name] = [];
      }
    },
    
    /**
     * Open a new widget view in a certain panel and return
     * the id.
     */
    addWidget : function (panel, name, src) {

      if (!src)
        return;

      // Is it the first widget?
      if (!this._listener) {

        /*
         * Establish the global 'message' hook.
         */
        this._listener = this._receiveMsg.bind(this);
        window.addEventListener("message", this._listener);
        
        // Every second increase the limits of all registered widgets
        this._timer = window.setInterval(function () {
          for (var i in limits) {
            if (limits[i]++ >= maxMessages) {
              limits[i] = maxMessages;
            }
          }
        }, 1000);
      };

      // Create a unique random ID per widget
      var id = 'id-' + this._randomID();

      // Create a new widget
      var widget = widgetClass.create(name, src, id);

      // Store the widget based on the identifier
      widgets[id] = widget;
      limits[id] = maxMessages;

      widget._mgr = this;

      // Add widget to panel
      panel.add(widget);

      return id;
    },


    /**
     * Get widget by identifier
     */
    widget : function (id) {
      return widgets[id];
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

        // TODO:
        //   Potentially kill the whole plugin!

        // This removes all connections before closing the widget 
        this._closeWidget(widget.id);
        widget.close();
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

    // Close the widget
    _closeWidget : function (id) {
      delete limits[id];
      delete widgets[id];

      // Remove listeners in case no widget
      // is available any longer
      if (Object.keys(limits).length == 0)
        this._removeListener();
    },

    // Get a random identifier
    _randomID : function () {
      return randomID(20);
    },

    // Remove the listener
    _removeListener : function () {
      window.clearInterval(this._timer);
      this._timer = undefined;
      window.removeEventListener("message", this._listener);
      this._listener = undefined;
    },

    // Destructor, just for testing scenarios
    destroy : function () {
      limits = {};
      for (let w in widgets) {
        widgets[w].close();
      };
      widgets = {};
      for (let b in buttons) {
        buttons[b] = [];
      };
      for (let b in buttonsSingle) {
        buttonsSingle[b] = [];
      };
      this._removeListener();
    }
  };
});
