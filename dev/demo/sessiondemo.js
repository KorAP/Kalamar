requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

var cookey;

function add (val) {
  var list = document.getElementById('number');
  list.textContent += '-' + val;
  cookey.set('n', list.textContent);
};

function removeCookie () {
  cookey.clear();
};

define(['session', 'lib/domReady'], function (sessionClass, domReady) {
  domReady(function () {
    cookey = sessionClass.create('peter');
    document.getElementById('number').textContent = cookey.get('n') || '';

    var elements = document.getElementsByClassName('num');
    for (var i = 0; i < elements.length; i++) {
      elements[i].addEventListener(
	'click',
	function (e) {
          add(this.textContent);
	}
      );
    };
  });
})
