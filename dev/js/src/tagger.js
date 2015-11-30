define([], function () {

  // "use strict";

  return {
    create : function (elem) {
      var obj = Object.create(this);
      obj._elem = elem;
      elem.appendChild(
	document.createElement('div')
      );
      var newCat = elem.appendChild(
	document.createElement('input')
      );

      newCat.setAttribute('type', 'text');

      newCat.addEventListener('keypress', function (e) {
	var key = e.keyCode || e.which;
	if (key === 13) {
	  obj.addTag(this.value);
	  this.value = '';
	};
      });

      obj._cat = [];
    },
    addTag : function (name) {
      this._cat.push(name);
      var cat = document.createElement('span');
      cat.appendChild(
	document.createTextNode(name)
      );
      cat.appendChild(
	document.createElement('span')
      ).setAttribute('class','close');
      this._elem.firstChild.appendChild(cat);
    }
  };
});
