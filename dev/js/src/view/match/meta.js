"use strict";

define([
  'view',
  'match/meta'
], function (viewClass, matchMetaClass) {

  const d = document;
  
  return {
    create : function (match) {
      return Object.create(viewClass)
        ._init(['metatable'])
        .upgradeTo(this)
        ._init(match);
    },


    _init : function (match) {
      this._match = match;
      return this;
    },
    

    /**
     * Meta view element
     */
    show : function () {
      if (this._show)
        return this._show;

      const metaTable = document.createElement('div');
      metaTable.classList.add('metatable', 'loading');

      this.getData(function (meta) {
        if (meta === null)
          return;

        // Load data
        metaTable.classList.remove('loading');
        metaTable.appendChild(meta.element());
      });


      // TODO:
      //   Loading should have a timeout on view-level
      //   matchtable.classList.remove('loading');

      return this._show = metaTable;
    },


    /**
     * Get match object
     */
    match : function () {
      return this._match;
    },


    /**
     * Retrieve and parse snippet for table
     * representation
     */
    getData : function (cb) {

      const match = this._match;
      try {
        KorAP.API.getTextInfo(
          match, {}, function (textResponse) {
            
            if (textResponse === undefined) {
              cb(null);
              return;
            };

            const doc = textResponse["document"];
            if (doc === undefined) {
              cb(null);
              return;
            };

            const fields = doc["fields"];
            if (fields === undefined) {
              cb(null);
              return;
            };

            // Add metainfo to matchview
            cb(matchMetaClass.create(
              match, fields
            ));
          }
        );
      }
      catch (e) {
        KorAP.log(0, e);
        cb(null);
      };
    },


    // Delete circular references
    onClose : function () {
      this._match = undefined;
    }
  }
});
