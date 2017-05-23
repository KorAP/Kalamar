requirejs.config({
  baseUrl: '../js/src'
});

require(['match/relations'], function (relClass) {
  var rel = relClass.create();
  document.getElementById("tree").appendChild(rel.element());

  /*
   * Start and end may be spans, i.e. arrays
   */

  rel
    .addToken("Der")
    .addToken("alte")
    .addToken("Mann")
    .addToken("ging")
    .addToken("über")
    .addToken("die")
    .addToken("breite")
    .addToken("nasse")
    .addToken("Straße")
  ;

  rel
    .addRel({ start: 0, end: 1, label: "a"})
    .addRel({ start: 0, end: 1, label: "b" })
    .addRel({ start: 1, end: 2, label: "c", direction: "bi"   })
    .addRel({ start: 0, end: 2, label: "d" })
    .addRel({ start: [2,4], end: 5, label: "e", direction: "uni"  })
    .addRel({ start: [5,6], end: 7, label: "g" })
    .addRel({ start: 4, end: [6,8], label: "f", direction: "bi" })
  ;
  
  rel.show();
});
