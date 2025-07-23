/**
 * Corpus specific localization, here for DeReKo (http://www.ids-mannheim.de/kl/projekte/korpora.html)
 * 
 * @author Helge Stallkamp
 */

"use strict";

window.KorAP = window.KorAP || {};

define(function () {
  const loc = KorAP.Locale;

  if (loc == undefined)
    return;

  //Query example for guided tour
  if (loc.TOUR_Qexample == undefined)
    loc.TOUR_Qexample = "laufen";

  /* To define vc for guided tour */
  if (loc.TOUR_vcQuery == undefined)
    loc.TOUR_vcQuery = {
      '@type' : 'koral:doc',
      'key' : 'pubDate',
      'match': 'match:eq',
      'value' : '2018',
    };

  if (loc.TOUR_Relations == undefined)
    loc.TOUR_Relations = "malt/d";

  if (loc.TOUR_pubDate == undefined)
    loc.TOUR_pubDate = "2018";
});
