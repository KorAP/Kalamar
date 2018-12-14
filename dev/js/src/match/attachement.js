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
  const uriRE = new RegExp("^data: *([^;,]+?(?: *; *[^,;]+?)*) *, *(.+)$");
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

      // Decode
      url = decodeURIComponent(url);

      if (!uriRE.exec(url))
        return;

      this.payload = RegExp.$2;

      let map = {};
      let start = 0;
      this.base64 = false;
      this.isLink = false;
      this.contentType = "text/plain";

      // Split parameter map
      RegExp.$1.split(/ *; */).map(function (item) {

        // Check first parameter
        if (!start++ && item.match(/^[-a-z0-9]+?\/.+$/)) {
          this.contentType = item;

          if (item === "application/x.korap-link")
            this.isLink = true;
        }
       
        // Decode b64
        else if (item.toLowerCase() == "base64") {
          this.base64 = true;
          this.payload = window.atob(this.payload);
        }

        // Parse arbitrary metadata
        else if (mapRE.exec(item)) {
          map[RegExp.$1] = RegExp.$2;
        };
      }.bind(this));

      this.param = map;
      return this;
    },

    /**
     * Inline the attachement
     * This should optimally be plugin-treatable
     */ 
    inline : function () {
      if (this.isLink) {
        let title = this.param["title"] || this.payload;
        let a = document.createElement('a');
        a.setAttribute('href', this.payload);
        a.setAttribute('rel', 'noopener noreferrer');
        a.addT(title);
        return a;
      };

      return document.createTextNode(this.payload);
    }
  }
});
