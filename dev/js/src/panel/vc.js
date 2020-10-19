/**
 * The vc info panel
 * 
 * The vc info panel displays information about the virtual corpus, 
 * for example the corpus statistic
 * 
 * @author Helge Stallkamp
 */

"use strict";

define([
  'panel',
  'view/vc/corpstatv'
], function (panelClass, corpStatVClass) {
  
  const d = document;

  // Localization values
  const loc = KorAP.Locale;
  loc.SHOW_STAT= loc.SHOW_STAT || 'Statistics';
  loc.VERB_SHOWSTAT = loc.VERB_SHOWSTAT    || 'Corpus Statistics';
  
  return {
    create : function (vc) {
      return Object.create(panelClass)._init(['vcinfo']).upgradeTo(this)._init(vc);
    }, 
    
    _init : function(vc){
     this.vc = vc;
     const actions = this.actions;
      actions.add(loc.SHOW_STAT, {'cls':['statistic']}, function() {
        this.addCorpStat();
      }.bind(this));
      return this;
    },
    

    /**
     * Add corpus statistic view to panel
     */
    addCorpStat: function(){
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
        t.statView = corpStatVClass.create(t.vc,t);
        t.add(t.statView);
        t.vc.oldvcQuery = KorAP.vc.toQuery();
      };
    },
    
    /**
     * Reload corpus statistic 
     *
     */
    reloadCorpStat: function(){
      this.statView.close();
      this.addCorpStat();
    }    
  }
});
