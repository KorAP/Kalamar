requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

require(['hint','hint/array','lib/domReady'], function (hintClass, hintArray, domReady) {
  KorAP.hintArray = hintArray;
  domReady(function() {
    hintClass.create();
  });
});
