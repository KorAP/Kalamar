define(function () {
  "use strict";

  return {
    create : function (name, src, id) {
      return Object.create(this)._init(name, src, id);
    },

    // Initialize service
    _init : function (name, src, id) {
      if (!name || !src || !id)
        throw Error("Service not well defined");
      this.name = name;
      this.src = src;
      this.id = id;
      this._perm = new Set();
      
      // There is no close method defined yet
      if (!this.close) {
        this.close = function () {
          this._closeIframe();
        }
      }
      
      return this;
    },

    /**
     * The element of the service as embedded in the panel
     */
    load : function () {
      if (this._load)
        return this._load;

      if (window.location.protocol == 'https:' &&
          this.src.toLowerCase().indexOf('https:') != 0) {
        KorAP.log(0, "Service endpoint is insecure");
        return;
      };

      // Spawn new iframe
      let e = document.createElement('iframe');
      e.setAttribute('allowTransparency',"true");
      e.setAttribute('frameborder', 0);
      // Allow forms in Plugins
      e.setAttribute('sandbox', this._permString());
      e.style.height = '0px';
      e.setAttribute('name', this.id);
      e.setAttribute('src', this.src);
      
      this._load = e;
      return e;
    },

    allow : function (permission) {
      if (Array.isArray(permission)) {
        permission.forEach(
          p => this._perm.add(p)
        );
      }
      else {
        this._perm.add(permission);
      };

      if (this._load) {
        this._load.setAttribute('sandbox', this._permString());
      }
    },

    _permString : function () {
      return Array.from(this._perm).sort().join(" ");
    },

    /**
     * Send a message to the embedded service.
     */
    sendMsg : function (d) {
      let iframe = this.load();
      iframe.contentWindow.postMessage(
        d,
        '*'
      ); // TODO: Fix origin
    },

    // onClose : function () {},

    /**
     * Close the service iframe.
     */
    _closeIframe : function () {
      var e = this._load;
      if (e && e.parentNode) {
        e.parentNode.removeChild(e);
      };
      this._load = null;
    }
  };
});
