/**
 * Corpus specific localization, here for KoKoKom (https://www.ids-mannheim.de/digspra/kl/projekte/)
 * 
 * @author Helge Stallkamp
 */

"use strict";

define(function () {
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
      'value' : 'KYC/MAI',   
    };
  
  if (loc.TOUR_Relations == undefined)
    loc.TOUR_Relations = "ud/d";

  if (loc.TOUR_DocSigle == undefined)
    loc.TOUR_DocSigle = "KYC/MAI"; 
});
