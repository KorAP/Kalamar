/**
 * View: corpus statistic view
 * 
 * @author Helge Stallkamp
 */
"use strict";

define(['view', 'vc/statistic', 'buttongroup'],
       function (viewClass, statClass, buttonGroup) {

         // Localization values
  const loc   = KorAP.Locale;
  loc.REFRESH = loc.REFRESH || 'Refresh';

  return {
    create : function(vc, panel) {
      return Object.create(viewClass).
        _init([ 'vcstatistic' ]).
        upgradeTo(this).
        _init(vc, panel);
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
    getStatistic : function (cb) {
      const vc = this.vc;

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
            const notif = statResponse["notifications"];
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
      
      const statTable = document.createElement('div');
      statTable.classList.add('stattable', 'loading');
  
      /*
       * Get corpus statistic, remove "loading"-image and
       * append result to statTable
       */
      this.getStatistic(function(statistic) {
        statTable.classList.remove('loading');

        if (statistic === null)
          return;

        statTable.appendChild(
          statClass.create(statistic).element()
        );
      });

      return this._show = statTable;
    },

    
    /**
     * Checks if statistic has to be disabled
     */
    checkStatActive : function () {
      let newString = KorAP.vc.toQuery();
      const oldString = this.vc.oldvcQuery;
      /*
       * Do ignore surrounding round brackets
       * Definining an incomplete docGroup in the vc builder: 
       * (foo = bar and author = Goethe) and ... 
       * leads to 
       * vc.toQuery() -> (foo = bar and author=Goethe)
       */
  
      if (newString || newString === '') {
        if (newString.startsWith('(')) {
          newString = newString.slice(1, newString.length-1);
        };
       
        if (newString != oldString) {
          this.disableStat();
        }
      }
    },
   

    /**
     * Disabling corpus statistic if in vc builder a different vc is choosen.
     * After clicking at the reload-button the up-to-date corpus statistic is displayed.
     */   
    disableStat : function(){
      const statt = this._show;
  
      if (statt.getElementsByClassName('reloadStatB').length == 0) {
        const btg = buttonGroup.create(['reloadStatB', 'button-panel']);

        btg.add(loc.REFRESH, {'cls':['refresh', 'button-icon']}, function (e) {
          statt.classList.remove('stdisabled');
          this.panel.reloadCorpStat(); 
        }.bind(this));

        statt.appendChild(btg.element());
        statt.classList.add('stdisabled');
      };
    },

    
    /**
     * Close the view.
     */
    onClose : function() {
      this.vc = undefined;
    }
  }
});
