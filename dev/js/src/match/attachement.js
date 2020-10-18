/**
 * Parse Data URI scheme for attachement fields
 * Afterwards the object has the parameters
 * - contentType (defaults to text/plain)
 * - base64 (if the data was base64 encoded)
 * - isLink (if the contentType is application/x.korap-link)
 * - param (as a map of arbitrary parameters)
 * - payload (the URI decoded data)
 *
 * @author Nils Diewald
 */
define(function () {

  "use strict";

  const uriRE = new RegExp("^data: *([^;,]*?(?: *; *[^,;]+?)*) *, *(.+)$");
  const mapRE = new RegExp("^ *([^=]+?) *= *(.+?) *$");

  return {

    /**
     * Constructor
     */
    create : function (url) {
      return Object.create(this)._init(url);
    },

    // Parse URI scheme
    _init : function (url) {
      const t = this;

      // Decode
      url = decodeURIComponent(url);

      if (!uriRE.exec(url))
        return;

      t.payload = RegExp.$2;

      let map = {};
      let start = 0;
      t.base64 = false;
      t.isLink = false;
      t.contentType = "text/plain";

      // Split parameter map
      RegExp.$1.split(/ *; */).map(function (item) {
        const t = this;

        // Check first parameter
        if (!start++ && item.match(/^[-a-z0-9]+?\/.+$/)) {
          t.contentType = item;

          if (item === "application/x.korap-link")
            t.isLink = true;
        }
       
        // Decode b64
        else if (item.toLowerCase() == "base64") {
          t.base64 = true;
          t.payload = window.atob(t.payload);
        }

        // Parse arbitrary metadata
        else if (mapRE.exec(item)) {
          map[RegExp.$1] = RegExp.$2;
        };
      }.bind(t));

      t.param = map;
      return t;
    },

    /**
     * Inline the attachement
     * This should optimally be plugin-treatable
     */ 
    inline : function () {
      if (this.isLink) {
        const title = this.param["title"] || this.payload;
        const a = document.createElement('a');
        a.setAttribute('href', this.payload);
        a.setAttribute('rel', 'noopener noreferrer');
        a.addT(title);
        return a;
      };

      return document.createTextNode(this.payload);
    }
  }
});
