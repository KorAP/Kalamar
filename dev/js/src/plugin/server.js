/**
 * The plugin system is based
 * on registered services (iframes) from
 * foreign services.
 * The server component spawns new iframes and
 * listens to them.
 *
 * @author Nils Diewald
 */

define(["plugin/widget", 'plugin/service', 'state', "util"], function (widgetClass, serviceClass, stateClass) {
  "use strict";

  KorAP.Panel = KorAP.Panel || {};

  // Contains all servicess to address with
  // messages to them
  var services = {};
  var plugins  = {};

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
    query : [],
    result : []
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
     *     },{
     *       'title' : 'glemm',
     *       'panel' : 'query',
     *       'onClick' : {
     *         'action' : 'toggle',
     *         'state' : 'glemm',
     *         'service' : {
     *           'id' : 'glemm',
     *           'template' : 'https://localhost:5678/'
     *         }
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
        widgets : [],
        services : []
      };

      if (typeof obj["embed"] !== 'object')
        throw new Error("Embedding of plugin is no list");
 
      // Embed all embeddings of the plugin
      var that = this;
      for (let i in obj["embed"]) {
        let embed = obj["embed"][i];

        if (typeof embed !== 'object')
          throw new Error("Embedding of plugin is no object");

        // Needs to be localized as well
        let title = embed["title"];        
        let panel = embed["panel"];
        let onClick = embed["onClick"];
        let icon = embed["icon"];
        
        if (!panel || !(buttons[panel] || buttonsSingle[panel]))
          throw new Error("Panel for plugin is invalid"); 

        // The embedding will open a widget
        if (!onClick["action"] ||
            onClick["action"] == "addWidget" ||
            onClick["action"] == "setWidget") {
          
          let cb = function (e) {

            // "this" is bind to the panel
            // "this".button is the button
            // "that" is the server object

            // Get the URL of the widget
            let url = onClick["template"];
            // that._interpolateURI(onClick["template"], this.match);

            // The button has a state and the state is associated to the
            // a intermediate object to toggle the view
            if ('state' in this.button && this.button.state.associates() > 0) {

              // TODO:
              //   Use roll() when existing
              let s = this.button.state;
              if (s.get()) {
                s.set(false);
              } else {
                s.set(true);
              };
              return;
            };

            // Add the widget to the panel
            let id = that.addWidget(this, name, url);
            plugin["widgets"].push(id);
            
            // If a state exists, associate with a mediator object
            if ('state' in this.button) {
              this.button.state.associate({
                setState : function (value) {
                  // Minimize the widget
                  if (value == false) {
                    services[id].minimize();
                  }
                  else {
                    services[id].show();                    
                  };
                }
              });
            }
          };


          // Button object
          let obj = {'cls':embed["classes"], 'icon': icon }

          if (onClick["action"] && onClick["action"] == "setWidget") {

            // Create a boolean state value, that initializes to true == opened
            obj['state'] = stateClass.create(true);
          };
          
          // Add to dynamic button list (e.g. for matches)
          if (buttons[panel]) {
            buttons[panel].push([title, obj, cb]);
          }

          // Add to static button list (e.g. for query) already loaded
          else if (KorAP.Panel[panel]) {
            KorAP.Panel[panel].actions.add(title, obj, cb);
          }

          // Add to static button list (e.g. for query) not yet loaded
          else {
            buttonsSingle[panel].push([title, obj, cb]);
          }
        }

        // TODO There is no possibility to add icons to an plugin toggle button right now. 
        else if (onClick["action"] == "toggle") {

          // Todo: Initially false
          let state = stateClass.create(false);

          // TODO:
          //   Lazy registration (see above!)
          KorAP.Panel[panel].actions.addToggle(title, {'cls':["title"]}, state);

          // Get the URL of the service

          // TODO:
          //   Use the "service" keyword
          let url = onClick["template"];
          
          // Add the service
          let id = this.addService(name, url);

          // TODO:
          //   This is a bit stupid to get the service window
          let service = services[id];
          let iframe = service.load();

          // Create object to communicate the toggle state
          // once the iframe is loaded.
          iframe.onload = function () {
            let sendToggle = {
              setState : function (val) {
                service.sendMsg({
                  action: 'state',
                  key : onClick['state'],
                  value : val
                });
              }
            };

            // Associate object with the state
            state.associate(sendToggle);          
          };

          plugin["services"].push(id);
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

    // Optionally initialize the service mechanism and get an ID
    _getServiceID : function () {

      // Is it the first service?
      if (!this._listener) {

        /*
         * Establish the global 'message' hook.
         */
        this._listener = this._receiveMsg.bind(this);
        window.addEventListener("message", this._listener);
        
        // Every second increase the limits of all registered services
        this._timer = window.setInterval(function () {
          for (var i in limits) {
            if (limits[i]++ >= maxMessages) {
              limits[i] = maxMessages;
            }
          }
        }, 1000);
      };

      // Create a unique random ID per service
      return 'id-' + this._randomID();
    },
    
    /**
     * Add a service in a certain panel and return the id.
     */
    addService : function (name, src) {
      if (!src)
        return;

      let id = this._getServiceID();

      // Create a new service
      let service = serviceClass.create(name, src, id);
      
      services[id] = service;
      limits[id] = maxMessages;

      // Add service to panel
      this.element().appendChild(
        service.load()
      );
      
      return id;
    },

    
    /**
     * Open a new widget view in a certain panel and return
     * the id.
     */
    addWidget : function (panel, name, src) {

      let id = this._getServiceID();

      // Create a new widget
      var widget = widgetClass.create(name, src, id);

      // Store the widget based on the identifier
      services[id] = widget;
      limits[id] = maxMessages;

      widget._mgr = this;

      // Add widget to panel
      panel.add(widget);

      return id;
    },


    /**
     * Get service by identifier
     */
    service : function (id) {
      return services[id];
    },

    
    // Receive a call from an embedded service.
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

      // Get the service
      let service = services[id];

      // If the addressed service does not exist - fail
      if (!service)
        return;

      // Check for message limits
      if (limits[id]-- < 0) {

        // Kill service
        KorAP.log(0, 'Suspicious action by service', service.src);

        // TODO:
        //   Potentially kill the whole plugin!

        // This removes all connections before closing the service 
        this._closeService(service.id);

        // if (service.isWidget)
        service.close();
     
        return;
      };

      // Resize the iframe
      switch (d.action) {
      case 'resize':
        if (service.isWidget)
          service.resize(d);
        break;

      // Log message from iframe
      case 'log':
        KorAP.log(d.code, d.msg,  service.src);
        break;

      // Modify pipes
      case 'pipe':
        if (KorAP.Pipe != undefined) {
          if (d.job == 'del') {
            KorAP.Pipe.remove(d.service);
          } else {
            KorAP.Pipe.append(d.service);
          };
        };
        break;

      // Get information from the embedding platform
      case 'get':

        // Get KoralQuery
        if (d.key == 'KQ') {
          if (KorAP.koralQuery !== undefined) {    
            d["value"] = KorAP.koralQuery;
          };
        }

        // Get Query information from from
        else if (d.key == 'QueryForm') {
          let doc = document;
          let v = d["value"] = {};

          var el;
          if (el = doc.getElementById('q-field')) {
            v["q"] = el.value;
          };
          if (el = doc.getElementById('ql-field')) {
            v["ql"] = el.value;
          };
          if (el = KorAP.vc) {
            v["cq"] = el.toQuery();
          };
        }

        // Get Query information from parameters
        else if (d.key == 'QueryParam') {

          // Supported in all modern browsers
          var p = new URLSearchParams(window.location.search);
          let v = d["value"] = {};
          v["q"] = p.get('q');
          v["ql"] = p.get('ql');
          v["cq"] = p.get('cq');
        };
      };

      // data needs to be mirrored
      if (d._id) {
        service.sendMsg(d);
      };

      // TODO:
      //   Close
    },

    // Close the service
    _closeService : function (id) {
      delete limits[id];

      // Close the iframe
      if (services[id] && services[id]._closeIframe) {
        services[id]._closeIframe();

        // Remove from list
        delete services[id];
      };


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

    /**
     * Return the service element.
     */
    element : function () {
      if (!this._element) {
        this._element = document.createElement('div');
        this._element.setAttribute("id", "services");
      }
      return this._element;
    },
    
    // Destructor, just for testing scenarios
    destroy : function () {
      limits = {};
      for (let s in services) {
        services[s].close();
      };
      services = {};
      for (let b in buttons) {
        buttons[b] = [];
      };
      for (let b in buttonsSingle) {
        buttonsSingle[b] = [];
      };

      if (this._element) {
        let e = this._element;
        if (e.parentNode) {
          e.parentNode.removeChild(e);
        };
        this._element = null;
      };
      
      this._removeListener();
    }
  };
});
