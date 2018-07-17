define([
  'view',
  'match/treehierarchy',
  'match/treearc'
], function (viewClass, matchTreeHierarchyClass, matchTreeArcClass) {

  const d = document;
  const loc   = KorAP.Locale;
  loc.DOWNLOAD = loc.DOWNLOAD || 'Download';

  
  return {
    create : function (match,foundry,layer,type) {
      return Object.create(viewClass)._init(['relations']).upgradeTo(this)._init(match, foundry, layer, type);
    },


    // Initialize relations object
    _init : function (match,foundry, layer, type) {
      this._match = match;
      this._foundry = foundry;
      this._layer = layer;
      this._type = type;
      return this;
    },
    

    /**
     * Meta view element
     */
    show : function () {

      if (this._show)
        return this._show;

      var matchtree = d.createElement('div');
      matchtree.classList.add('matchtree', 'loading');

      // this.element().appendChild(matchtree);

      // Add title line
      var h6 = matchtree.addE('h6');
      h6.addE('span').addT(this._foundry);
      h6.addE('span').addT(this._layer);      

      this._tree = matchtree.addE('div');

      this._show = matchtree;
      return matchtree;
    },


    /**
     * Do after embedding
     */
    afterEmbed : function () {

      var foundry = this._foundry,
          layer = this._layer,
          type = this._type;

      var that = this;
      var tree = this._tree;
      var matchtree = this._show;

      // Get tree data async
      this.getData(foundry, layer, type, function (treeObj) {

        matchtree.classList.remove('loading');

        // Something went wrong - probably log!!!

        if (treeObj === null) {
          tree.addT('No data available.');
        }
        else {
          tree.appendChild(treeObj.element());
          treeObj.show();

          // Reposition the view to the center
          // (This may in a future release be a reposition
          // to move the root to the actual match)

          // This is currently not supported by relations
          if (type === "spans") {

            // Download link
            that.actions.add(loc.DOWNLOAD, ['button-icon','download'], function (e) {
              var a = treeObj.downloadLink();
              d.body.appendChild(a);
              a.click();
              d.body.removeChild(a)
            });
          };
          
          treeObj.center();
        };
  
        /*
          if (cb)
          cb(treeObj);
          */
      });

      matchtree.classList.remove('loading');
    },

    /**
     * Get match object
     */
    match : function () {
      return this._match;
    },


    /**
     * Retrieve and parse snippet for relation
     * representation
     */
    getData : function (foundry, layer, type, cb) {
      var focus = [];

      try {
        // TODO: Support and cache multiple trees
        KorAP.API.getMatchInfo(
          this._match, {
            'spans' : true,
            'foundry' : foundry,
            'layer' : layer
          },
          function (matchResponse) {
            if (matchResponse === undefined) {
              cb(null);
              return;
            };

            // Get snippet from match info
            if (matchResponse["snippet"] !== undefined) {

              // Todo: This should be cached somehow

              if (type === "spans") {
                cb(matchTreeHierarchyClass.create(matchResponse["snippet"]));
              }
              else if (type === "rels") {
                cb(matchTreeArcClass.create(matchResponse["snippet"]));              
              }

              // Unknown tree type
              else {
                cb(null);
              };
            }
            else {
              cb(null);
            };
          }.bind(this)
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
