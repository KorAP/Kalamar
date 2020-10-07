define(function () {
  "use strict";

  // Limit the supported sandbox permissions, especially
  // to disallow 'same-origin'.
  let allowed = {
    "scripts" : 1,
    "presentation" : 1,
    "forms": 1,
    "downloads-without-user-activation" : 1,
    "downloads" : 1
  };

  return {
    create : function (data) {
      return Object.create(this)._init(data);
    },

    // Initialize service
    _init : function (data) {
      if (!data || !data["name"] || !data["src"] || !data["id"])
        throw Error("Service not well defined");

      this.name = data["name"];
      this.src = data["src"];
      this.id = data["id"];
      this.desc = data["desc"];
      let _perm = new Set();
      let perm = data["permissions"];
      if (perm && Array.isArray(perm)) {
        perm.forEach(function (p) {
          if (p in allowed) {
            _perm.add(p)
          }
          else {
            KorAP.log(0, "Requested permission not allowed");
          }
        });
      };

      this._perm = _perm;
      
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
      e.setAttribute('sandbox', Array.from(this._perm).sort().map(function(i){ return "allow-"+i }).join(" "));
      e.style.height = '0px';
      e.setAttribute('name', this.id);
      e.setAttribute('src', this.src);
      
      this._load = e;
      return e;
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
