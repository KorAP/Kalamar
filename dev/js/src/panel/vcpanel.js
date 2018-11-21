/**
 * The vc info panel
 * 
 * The vc info panel displays information about the virtual corpus, 
 * for example the corpus statistic
 * 
 * @author Helge Stallkamp
 */

define([
  'panel',
  'view/corpstatv'
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
     var actions = this.actions;
     var that = this;
     actions.add(loc.SHOW_STAT, [ 'statistic' ], function() {
       that.addCorpStat();
      });
     
      return this;
    },
    

    /**
     * Add corpus statistic view to panel
     */
    addCorpStat: function(){
      if (this.statView === undefined || !this.statView.shown()) {
        this.statView = corpStatVClass.create(this.vc, this);
        this.add(this.statView);
      }

    },
    
    
  }
});
