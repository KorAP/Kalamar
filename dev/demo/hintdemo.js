requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

var hint = undefined;

require(['hint','hint/array','lib/domReady'], function (hintClass, hintArray, domReady) {
  KorAP.hintArray = hintArray;
  domReady(function() {
    hint = hintClass.create();
  });
});

function demoAlert (pos, msg) {
  if (hint !== undefined)
    hint.alert(pos, msg);
}
