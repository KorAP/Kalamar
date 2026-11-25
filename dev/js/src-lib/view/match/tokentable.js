import viewClass from '../view.js';
import matchTableClass from '../../match/table.js';
import infoLayerClass from '../../match/match/infolayer.js';
import '../../util/util.js';

  const d = document;
  
  export default class TokenTableView extends viewClass {
    constructor (match) {
      super(['tokentable']);
      this._match = match;
    }
    

    /**
     * TokenTable view element
     */
    show () {
      if (this._show)
        return this._show;

      // Append default table
      const matchtable = d.createElement('div');
      matchtable.classList.add('matchtable', 'loading');
      this._show = matchtable;
      return matchtable;
    }


    /**
     * Do after embedding
     */
    afterEmbed () {
      // TODO:
      //   Create try-catch-exception-handling

      // TODO:
      //   Loading should have a timeout on view-level
      //   matchtable.classList.remove('loading');

      // var that = this;
      const matchtable = this._show;

      // Create the table asynchronous
      this.getData(undefined, function (table) {

        if (table !== null) {
          matchtable.appendChild(table.element());
          table.toMark();
	      };
      });

      // Load data
      matchtable.classList.remove('loading');      
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
    getData (tokens, cb) {
      let focus = [];

      // Get all tokens
      if (tokens === undefined) {
        focus = this._match.getTokens();
      }

      // Get only some tokens
      else {
        
        // Push newly to focus array
        tokens.forEach(function(term) {
          try {
            // Create info layer objects
            const layer = new infoLayerClass(term);
            layer.type = "tokens";
            focus.push(layer);
          }
          catch (e) {
            return;
          };
        });
      };
      
      // No tokens chosen
      if (focus.length == 0)
        cb(null);

      try {
        // Get info (may be cached)
        KorAP.API.getMatchInfo(
          this._match,
          { 'spans' : false, 'layer' : focus },
        
          // Callback for retrieval
          function (matchResponse) {

            if (matchResponse === undefined)
              cb(null);

            // Get snippet from match info
            if (matchResponse["snippet"] !== undefined) {
              cb(
                this._table = new matchTableClass(matchResponse["snippet"])
              );
            };
          }.bind(this)
        );
      }
      catch (e) {
        KorAP.log(0, e);
        cb(null);
      };

      /*
      // Todo: Store the table as a hash of the focus
      return null;
      */
    }


    // Delete circular references
    onClose () {
      this._match = undefined;
    }
  }
