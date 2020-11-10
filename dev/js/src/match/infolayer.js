/**
 * Object representing information
 * about a match's layer annotation.
 */
"use strict";

define(function () {

  const _AvailableRE =
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

      const t = this;
      
      if (layer === undefined) {
	      if (_AvailableRE.exec(foundry)) {
	        t.foundry = RegExp.$1;
	        t.layer = RegExp.$2;
	        t.type = RegExp.$3;
	      }
	      else {
	        throw new Error("Missing parameters");
	      };
      }
      else {
	      t.foundry = foundry;
	      t.layer = layer;
	      t.type = type;
      };
      
      if (t.type === undefined)
	      t.type = 'tokens';

      return t;
    }
  };
});

