/**
 * Menu showing all predefined virtual corpora.
 * THIS IS EXPERIMENTAL AND MAY BE REMOVED!
 */
"use strict";

define(['vc/menu', 'api'], function (menuClass, itemClass) {
  return {
    create : function (params) {
      return Object.create(menuClass)
	      .upgradeTo(this)
	      ._init(itemClass, undefined, undefined, params);
    },

    /**
     * A click event was released
     */
    release : function (id, name) {
      if (this._cb !== undefined)
	      this._cb(id, name);
    }
  };
}); 
