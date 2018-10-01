define(['vc/fragment', 'util'], function (vcFragmentClass) {
  "use strict";

  return {
    /**
     * Constructor
     */
    create : function (meta) {
      return Object.create(this)._init(meta);
    },

    // Initialize corpusByMatch
    _init : function (meta) {
      if (meta === undefined) {
        throw new Error('Missing parameters');
      }
      else if (!(meta instanceof Node)) {
        throw new Error("Requires element");
      };

      // Collect the meta constraints
      this._vc = {};

      // Remember the meta table
      this._meta = meta;

      this._fragment = vcFragmentClass.create();

      return this;
    },

    // Stringify annotation
    toString : function () {
      return '';
    }
  };
});
