requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

require(['datepicker', 'lib/domReady'], function (dpClass, domReady) {
  domReady(function () {
    var dp = dpClass.create();
    document.getElementById('dp').appendChild(
      dp.select(2015,4,12).show(2015,4)
    );
  });
});
