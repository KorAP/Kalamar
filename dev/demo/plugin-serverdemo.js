requirejs.config({
  baseUrl: '/js/src',
  paths : {
    'lib': '../lib'
  }
});

define(['app/en','plugin/server','lib/domReady','init','hint/foundries/cnx'], function (lang, pluginClass, domReady) {
  domReady(function () {
    KorAP.Plugin = pluginClass.create();
  });
});
