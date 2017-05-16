requirejs.config({
  baseUrl: '../js/src'
});

require(['match/relations'], function (relClass) {
  var rel = relClass.create();
  document.getElementById("tree").appendChild(rel.element());
  rel.show();
});
