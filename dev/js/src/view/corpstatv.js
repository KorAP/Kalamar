/**
 * View: corpus statistic view
 * 
 * @author Helge Stallkamp
 */
define([ 'view', 'vc/statistic' ], function(viewClass, statClass) {

  const d = document;

  return {
    create : function(vc) {
      return Object.create(viewClass)._init([ 'vcstatistic' ]).upgradeTo(this)
          ._init(vc);
    },

    _init : function(vc) {
      this.vc = vc;
      return this;
    },

    /*
     * Returns corpus of the view,
     * vc is used to create the corpus query string 
     * which is needed to receive the corpus statistic from the server 
     * (see also getStatistic : function(cb) {...))
     */
    getvc : function() {
      return this.vc;
    },


    /**
     * Receive Corpus statistic from the server
     */
    getStatistic : function(cb) {
      // cq = corpusQuery
      var vc = this.vc;
      
       // cq = corpusQuery
      var cq;

      cq = encodeURIComponent(vc.toQuery());
      try {
        KorAP.API.getCorpStat(cq, function(statResponse) {
          if (statResponse === null) {
            cb(null);
            return;
          }
          if (statResponse === undefined) {
            cb(null);
            return;
          }

          // catches notifications
          if (statResponse["notifications"] !== null
              && statResponse["notifications"] !== undefined) {
            notif = statResponse["notifications"];
            KorAP.log(0, notif[0][1]);
            cb(null);
            return;
          }

          cb(statResponse);
        });
      }

      catch (e) {
        KorAP.log(0, e);
        cb(null);
      }

    },

    /** 
     * Show corpus statistic view 
     */
    show : function() {
      if (this._show)
        return this._show;

      var statTable = document.createElement('div');
      statTable.classList.add('stattable', 'loading');
  
      var that = this;
     
      /*
      * Get corpus statistic, remove "loading"-image and
      * append result to statTable
      */
      this.getStatistic(function(statistic) {
        statTable.classList.remove('loading');

        if (statistic === null)
          return;

        statisticobj = statClass.create(statistic);
        statTable.appendChild(statisticobj.element());
      });

      this._show = statTable;
      return statTable;

    },

    /**
     * Close the view.
     */
    onClose : function() {
      this.vc = undefined;
    }
  }
});
