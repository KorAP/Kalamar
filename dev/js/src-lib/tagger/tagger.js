import p from '../palette.js';
import '../util/util.js';

class Tagger {
   
  constructor(elem) {
      this._nr = 0;
      this._elem = elem;
      elem.addE('div');

      const newCat = elem.addE('input');
      newCat.setAttribute('type', 'text');
      newCat.addEventListener('keypress', function (e) {
        const key = e.key || e.keyCode || e.which;
        if (key === 'Enter' || key === 13) {
          this.addTag(newCat.value);
          newCat.value = '';
        };
      }.bind(this));

      this._cat = [];
    }



    addTag(name) {
      this._cat.push(name);
      this._nr++;

      const cat = document.createElement('span');
      cat.addT(name);
      cat.addE('span').setAttribute('class','close');
      cat.style.backgroundColor = p.getC(this._nr);
      this._elem.firstChild.appendChild(cat);
    }
  }

export default Tagger;
