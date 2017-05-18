/**
 * Object representing information
 * about a match's layer annotation.
 */
define(function () {
  var _AvailableRE =
    new RegExp("^([^\/]+?)\/([^=]+?)(?:=(spans|rels|tokens))?$");

  return {
    /**
     * Create new match information
     * object for one layer.
     *
     * Alternatively pass a string as
     * <tt>base/s=span</tt>
     *
     * @param foundry
     */
    create : function (foundry, layer, type) {
      return Object.create(this)._init(foundry, layer, type);
    },

    // Initialize Layer 
    _init : function (foundry, layer, type) {
      if (foundry === undefined)
	      throw new Error("Missing parameters");
      
      if (layer === undefined) {
	      if (_AvailableRE.exec(foundry)) {
	        this.foundry = RegExp.$1;
	        this.layer = RegExp.$2;
	        this.type = RegExp.$3;
	      }
	      else {
	        throw new Error("Missing parameters");
	      };
      }
      else {
	      this.foundry = foundry;
	      this.layer = layer;
	      this.type = type;
      };
      
      if (this.type === undefined)
	      this.type = 'tokens';

      return this;
    }
  };
});

