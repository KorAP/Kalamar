/**
 * Corpus specific localization, here for DeReKo (http://www1.ids-mannheim.de/kl/projekte/korpora.html)
 * 
 * @author Helge Stallkamp
 */

"use strict";

define(['vc', 'vc/doc'], function (vcClass, docClass) {
  const loc = KorAP.Locale;
  
  //Query example for guided tour
  if (loc.TOUR_Qexample == undefined)
    loc.TOUR_Qexample = "laufen";

  /* To define vc for guided tour */
  if (loc.TOUR_vcQuery == undefined)
    loc.TOUR_vcQuery = {
      '@type' : 'koral:doc',
      'key' : 'docSigle', 
      'match': 'match:eq',
      'value' : 'WPD17/D01',   
    };
  
  if (loc.TOUR_Relations == undefined)
    loc.TOUR_Relations = "corenlp/c";

  if (loc.TOUR_DocSigle == undefined)
    loc.TOUR_DocSigle = "WPD17/D01"; 
});
