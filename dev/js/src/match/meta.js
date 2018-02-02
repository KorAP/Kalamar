define(['util'], function () {

  /*
  author, editor title, subTitle textSigle
  in corpusAuthor (corpusEditor), corpusTitle, corpusSubTitle, corpusSigle
  in docAuthor    (docEditor),    docTitle,    docSubTitle,    docSigle
  publisher
  reference
  creationDate
  foundries
  keywords
  textClass
  textColumn
  textDomain
  textType
  textTypeArt
  textTypeRef
  language
  license
  pages
  pubDate
  layerInfo
  tokenSource
  biblEditionStatement
  fileEditionStatement
*/

  // Localization values
  const loc   = KorAP.Locale;
  loc.METADATA   = loc.METADATA   || 'Metadata';

  return {

    /**
     * Create new match object
     */
    create : function (match) {
      return Object.create(this)._init(match);
    },

    /**
     * Initialize object
     */
    _init : function (match) {
      this._match = match;
      this.opened = false;
      return this;
    },

    /**
     * Get match object
     */
    match : function () {
      return this._match;
    },

    /**
     * Create match reference view.
     */
    element : function (metaInfo) {
      if (this._element !== undefined)
        return this._element;
      
      /*
      var header = metaTable.appendChild(
        document.createElement('h6')
      );

      header.appendChild(
        document.createElement('div')
      ).appendChild(
        document.createTextNode(loc.METADATA)
      );
      */

      var metaDL = document.createElement('dl');

      this._element = metaDL;

      // TODO: Meta fields should be separated
      var keys = Object.keys(metaInfo);
      for (var i in keys.sort()) {
        var k = keys[i];
        if (k !== "UID" &&
            k !== "corpusID" &&
            k !== "docID" &&
            k !== "textID" &&
            /*
            k !== "corpusSigle" &&
            k !== "docSigle" &&
            */
            k !== "layerInfos") {

          var metaL = document.createElement('div');
          metaL.addE('dt').addT(k);
          metaL.addE('dd').addT(metaInfo[k]);

          metaDL.appendChild(metaL);
        };
      };
      return this._element;
    }
  };
});
