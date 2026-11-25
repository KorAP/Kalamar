import viewClass from '../view.js';
import matchMetaClass from '../../match/match/meta.js';

  const d = document;
  
  export default class MetaView extends viewClass {
    constructor (match) {
      super(['metatable']);
      this._match = match;
    }
    

    /**
     * Meta view element
     */
    show () {
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
    }


    /**
     * Get match object
     */
    match () {
      return this._match;
    }


    /**
     * Retrieve and parse snippet for table
     * representation
     */
    getData (cb) {

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
            cb(new matchMetaClass(
              match, fields
            ));
          }
        );
      }
      catch (e) {
        KorAP.log(0, e);
        cb(null);
      };
    }


    // Delete circular references
    onClose () {
      this._match = undefined;
    }
  }
