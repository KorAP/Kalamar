/**
 * View: corpus statistic view
 * 
 * @author Helge Stallkamp
 */

define([ 'view', 'vc/statistic' ], function(viewClass, statClass) {

  const d = document;

  return {
    create : function(vc, panel) {
      return Object.create(viewClass)._init([ 'vcstatistic' ]).upgradeTo(this)
          ._init(vc, panel);
    },

    _init : function(vc, panel) {
      this.vc = vc;
      this.panel = panel;
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

      try {
        KorAP.API.getCorpStat(vc.toQuery(), function(statResponse) {
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
     * Checks if graying necessary
     */
    checkGrayingStatistic : function (){   
     var newString = KorAP.vc.toQuery();
     var oldString = this.vc.oldvcQuery;
     
     /*
      * Do ignore surrounding round brackets
      * Definining an incomplete docGroup in the vc builder: 
      * (foo = bar and author = Goethe) and ... 
      * leads to 
      * vc.toQuery() -> (foo = bar and author=Goethe)
      */
     if(newString.startsWith('(')){
       newString = newString.slice(1, newString.length-1);
     }
     
      if(newString && newString != oldString) {
        this.grayingStat();
      }   
   },
   
    /**
     * Graying corpus statistic if in vc builder a different vc is choosen.
     * After clicking at the reload-button the up-to-date corpus statistic is displayed.
     */   
    grayingStat : function(){
      var statt = this._show;
      
      if(statt.getElementsByClassName('reloadStatB').length == 0){
          var reloadspan = document.createElement('span');
          reloadspan.classList.add('reloadStatB');
          reloadb = reloadspan.addE('span');
          reloadb.classList.add('refresh');
          
          var that = this;
          
          reloadb.addEventListener("click", function (e){    
          statt.classList.remove('greyOut');
          that.panel.actions.element().querySelector(".statistic").classList.remove('greyOut');
          that.panel.reloadCorpStat(); 
             });
          
 
        statt.appendChild(reloadspan);
        statt.classList.add('greyOut');        
        this.panel.actions.element().querySelector(".statistic").classList.add('greyOut');
        
        console.log("Corpus statistic DISABLED");
        }
    },

    
    /**
     * Close the view.
     */
    onClose : function() {
      this.vc = undefined;
    }
  }
});
