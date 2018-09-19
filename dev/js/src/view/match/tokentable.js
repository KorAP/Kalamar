define([
  'view',
  'match/table',
  'match/infolayer'
], function (viewClass, matchTableClass, infoLayerClass) {

  const d = document;
  
  return {
    create : function (match) {
      return Object.create(viewClass)._init(['tokentable']).upgradeTo(this)._init(match);
    },


    _init : function (match) {
      this._match = match;
      return this;
    },
    
    /**
     * TokenTable view element
     */
    show : function () {
      if (this._show)
        return this._show;

      // Append default table
      var matchtable = d.createElement('div');
      matchtable.classList.add('matchtable', 'loading');
      this._show = matchtable;
      return matchtable;
    },

    /**
     * Do after embedding
     */
    afterEmbed : function () {
      // TODO:
      //   Create try-catch-exception-handling

      // TODO:
      //   Loading should have a timeout on view-level
      //   matchtable.classList.remove('loading');

      // var that = this;
      var matchtable = this._show;

      // Create the table asynchronous
      this.getData(undefined, function (table) {

        if (table !== null) {
          matchtable.appendChild(table.element());
          table.toMark();
	      };

      });

      // Load data
      matchtable.classList.remove('loading');      
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
    getData : function (tokens, cb) {
      var focus = [];

      // Get all tokens
      if (tokens === undefined) {
        focus = this._match.getTokens();
      } 

      // Get only some tokens
      else {
        
        // Push newly to focus array
        for (var i = 0; i < tokens.length; i++) {
          var term = tokens[i];
          try {
            // Create info layer objects
            var layer = infoLayerClass.create(term);
            layer.type = "tokens";
            focus.push(layer);
          }
          catch (e) {
            continue;
          };
        };
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
              this._table = matchTableClass.create(matchResponse["snippet"]);
              cb(this._table);
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
    },

    // Delete circular references
    onClose : function () {
      this._match = undefined;
    }
  }
});
