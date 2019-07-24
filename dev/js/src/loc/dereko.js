/**
 * Corpus specific localization, here for DeReKo (http://www1.ids-mannheim.de/kl/projekte/korpora.html)
 * 
 * @author Helge Stallkamp
 */

define(['vc', 'vc/doc'], function (vcClass, docClass) {
  const loc = KorAP.Locale;
  
  //Query example for guided tour
  loc.TOUR_Qexample = "laufen";
  
  //Doc to define virtual corpus in  the guided tour
  let doc = docClass.create();
  // Set values
  doc.key("docSigle");
  doc.value("GOE/AGI");
  loc.TOUR_vcQuery = doc;
});
