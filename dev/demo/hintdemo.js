requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

var hint = undefined;

require(['hint','hint/foundries/cnx','lib/domReady'], function (hintClass, hintArray, domReady) {
  KorAP.hintArray = hintArray;
  KorAP.Hint = null;
  domReady(function() {
    KorAP.Hint = hintClass.create();
  });
});

function demoAlert (pos, msg) {
  if (KorAP.hint !== undefined)
    KorAP.Hint.alert(pos, msg);
}
