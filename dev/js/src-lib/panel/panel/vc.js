/**
 * The vc info panel
 * 
 * The vc info panel displays information about the virtual corpus, 
 * for example the corpus statistic
 * 
 * @author Helge Stallkamp
 */

import panelClass from '../panel.js';
import corpStatVClass from '../../view/vc/corpstatv.js';
  
  const d = document;

  // Localization values
  const loc = KorAP.Locale;
  loc.SHOW_STAT= loc.SHOW_STAT || 'Statistics';
  loc.VERB_SHOWSTAT = loc.VERB_SHOWSTAT    || 'Corpus Statistics';
  
  export default class VCPanel extends panelClass {
    type = 'vc';
    
    constructor (vc) {
      super(['vcinfo']);
      this.vc = vc;
      const actions = this.actions();
      actions.add(loc.SHOW_STAT, {'cls':['statistic']}, function() {
        this.addCorpStat();
      }.bind(this));
    }
    

    /**
     * Add corpus statistic view to panel
     */
    addCorpStat (){
      const t = this;

      //Refreshes corpus statistic
      if (t.statView !== undefined && t.statView.shown()){
        let statt = t.statView.show();
        if (statt.classList.contains('stdisabled')){
          t.reloadCorpStat(); 
          statt.classList.remove('stdisabled');
        }
      };
      
      //Add corpus statistic
      if (t.statView === undefined || !t.statView.shown()) {
        t.statView = new corpStatVClass(t.vc,t);
        t.add(t.statView);
        t.vc.oldvcQuery = KorAP.vc.toQuery();
      };
    }
    
    /**
     * Reload corpus statistic 
     *
     */
    reloadCorpStat (){
      this.statView.close();
      this.addCorpStat();
    }    
  };
