import viewClass from '../view.js';
import matchTreeHierarchyClass from '../../match/treehierarchy.js';
import matchTreeArcClass from '../../match/treearc.js';
import '../../util/util.js';

  const d = document;
  const loc   = KorAP.Locale;
  loc.DOWNLOAD = loc.DOWNLOAD || 'Download';

  
  export default class RelationsView extends viewClass {
    constructor (match,foundry,layer,type) {
      super(['relations']);
      this._match = match;
      this._foundry = foundry;
      this._layer = layer;
      this._type = type;
    }
    

    /**
     * Meta view element
     */
    show () {

      if (this._show)
        return this._show;

      const matchtree = d.createElement('div');
      matchtree.classList.add('matchtree', 'loading');

      // Add title line
      const h6 = matchtree.addE('h6');
      h6.addE('span').addT(this._foundry);
      h6.addE('span').addT(this._layer);      

      this._tree = matchtree.addE('div');

      return this._show = matchtree;
    }


    /**
     * Do after embedding
     */
    afterEmbed () {

      const foundry = this._foundry,
            layer = this._layer,
            type = this._type;

      const that = this,
            tree = this._tree,
            matchtree = this._show;

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
            that.actions().add(
              loc.DOWNLOAD,
              {'cls':['button-icon','download']},
              function (e) {
                const a = treeObj.downloadLink();
                d.body.appendChild(a);
                a.click();
                d.body.removeChild(a)
              }
            );
          };
          
          treeObj.center();
        };
      });

      matchtree.classList.remove('loading');
    }

    /**
     * Get match object
     */
    match () {
      return this._match;
    }


    /**
     * Retrieve and parse snippet for relation
     * representation
     */
    getData (foundry, layer, type, cb) {
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
                cb(new matchTreeHierarchyClass(matchResponse["snippet"]));
              }
              else if (type === "rels") {
                cb(new matchTreeArcClass(matchResponse["snippet"]));              
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
    }
  

    // Delete circular references
    onClose () {
      this._match = undefined;
    }
  }
