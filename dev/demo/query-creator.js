requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

define(['match/querycreator', 'lib/domReady'], function (qc, domReady) {
  domReady(function () {
    qc.create(document.getElementsByClassName('matchinfo')[0]);
  });
});
