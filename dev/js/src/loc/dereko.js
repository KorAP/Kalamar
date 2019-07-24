/**
 * Corpus specific localization, here for DeReKo (http://www1.ids-mannheim.de/kl/projekte/korpora.html)
 * 
 * @author Helge Stallkamp
 */

define(['vc', 'vc/doc'], function (vcClass, docClass) {
  const loc = KorAP.Locale;
  
  //Query example for guided tour
  loc.TOUR_Qexample = "laufen";

  /* To define vc for guided tour */
  loc.TOUR_vcQuery = {
      '@type' : 'koral:doc',
      'key' : 'docSigle', 
      'match': 'match:eq',
      'value' : 'GOE/AGI',   
    };
  
});
