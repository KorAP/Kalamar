requirejs.config({
  baseUrl: '/js/src',
  paths : {
    'lib': '../lib'
  }
});

define(['app/en','plugin/server','lib/domReady','init','hint/foundries/cnx'], function (lang, pluginClass, domReady) {
  domReady(function () {
    var p = pluginClass.create();

    // Open widget!
    p.addWidget(
      document.getElementById('container'),
      'http://localhost:3003/demo/plugin-client.html'
    );
  });
});
