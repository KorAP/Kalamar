/**
 * The query panel
 *
 * @author Nils Diewald
 */
import panelClass from '../panel.js';
import stateClass from '../../state/state.js';

  const d = document;

  // Localization values
  const loc = KorAP.Locale;
  
  export default class Query extends panelClass {
    type = 'query';

    constructor (opened) {
      super(['query']);
      this._opened = opened;
      const a = this.actions();


      // If plugins are enabled, add all buttons for the query panel
      if (KorAP.Plugin) {

        // Add all matchbuttons in order
        KorAP.Plugin
          .buttonGroup("query")
          .forEach(i => a.add.apply(a, i));

        KorAP.Plugin.clearButtonGroup("query")
      };
      
      let colabel = document.getElementById("glimpse");

      if (colabel == undefined) {
	return;
      }
      
      colabel = colabel.parentNode;

      if (colabel == undefined) {
	return;
      };
      
      // Add glimpse button
      const s = new stateClass([true,false]);
      const cof = document.getElementById("q-cutoff-field");
    
      let glimpseChange = {
        setState : function (val) {
          cof.checked = val;
        }
      };
      s.associate(glimpseChange);
      s.set(cof.checked);
      
      let b = a.addToggle(
        "Glimpse", {
          'cls':['glimpse'],
          'desc':colabel.getAttribute('title')
        },
        s
      );

      b.setAttribute('data-testid', 'glimpse');
      
      // Don't show default glimpse
      colabel.style.display = "none";
    }
  };
