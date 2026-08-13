/**
 * View: corpus statistic view
 * 
 * @author Helge Stallkamp
 */

import viewClass from '../../view.js';
import statClass from '../../../vc/vc/statistic.js';
import buttonGroup from '../../../buttongroup/buttongroup.js';
import '../../../util/util.js';

         // Localization values
  const loc   = KorAP.Locale;
  loc.REFRESH = loc.REFRESH || 'Refresh';

  export default class CorpStatV extends viewClass {
    constructor (vc, panel) {
      super([ 'vcstatistic' ]);
      this.vc = vc;
      this.panel = panel;
    }

    /*
     * Returns corpus of the view,
     * vc is used to create the corpus query string 
     * which is needed to receive the corpus statistic from the server 
     * (see also getStatistic : function(cb) {...))
     */
    getvc () {
      return this.vc;
    }


    /**
     * Receive Corpus statistic from the server
     */
    getStatistic (cb) {
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

    }

    /** 
     * Show corpus statistic view 
     */
    show () {
      
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
          new statClass(statistic).element()
        );
      });

      return this._show = statTable;
    }

    
    /**
     * Checks if statistic has to be disabled
     */
    checkStatActive () {
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
    }
   

    /**
     * Disabling corpus statistic if in vc builder a different vc is choosen.
     * After clicking at the reload-button the up-to-date corpus statistic is displayed.
     */   
    disableStat () {
      const statt = this._show;
  
      if (statt.getElementsByClassName('reloadStatB').length == 0) {
        const btg = new buttonGroup(['reloadStatB', 'button-panel']);

        btg.add(loc.REFRESH, {'cls':['refresh', 'button-icon']}, function (e) {
          statt.classList.remove('stdisabled');
          this.panel.reloadCorpStat(); 
        }.bind(this));

        statt.appendChild(btg.element());
        statt.classList.add('stdisabled');
      };
    }

    
    /**
     * Close the view.
     */
    onClose () {
      this.vc = undefined;
    }
  };
