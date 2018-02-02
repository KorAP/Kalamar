define(['palette','util'], function (p) {

  // "use strict";

  return {
    create : function (elem) {
      var obj = Object.create(this);
      obj._nr = 0;
      obj._elem = elem;
      elem.addE('div');
      var newCat = elem.addE('input');

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

      this._nr++;

      var cat = document.createElement('span');
      cat.addT(name);
      cat.addE('span').setAttribute('class','close');

      cat.style.backgroundColor = p.getC(this._nr);

      this._elem.firstChild.appendChild(cat);
    }
  };
});
