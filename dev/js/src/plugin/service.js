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
      
      // Spawn new iframe
      let e = document.createElement('iframe');
      e.setAttribute('allowTransparency',"true");
      e.setAttribute('frameborder', 0);
      e.setAttribute('sandbox','allow-scripts');
      e.style.height = '0px';
      e.setAttribute('name', this.id);
      e.setAttribute('src', this.src);
      
      this._load = e;
      return e;
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
