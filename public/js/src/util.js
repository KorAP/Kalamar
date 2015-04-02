/**
 * These are utility functions for the frontend
 */

// Add toggleClass method similar to jquery
HTMLElement.prototype.toggleClass = function (c1, c2) {
  var cl = this.classList;
  if (cl.contains(c1)) {
    cl.add(c2);
    cl.remove(c1);
  }
  else {
    cl.remove(c2);
    cl.add(c1);
  };
};


// Don't let events bubble up
if (Event.halt === undefined) {
  // Don't let events bubble up
  Event.prototype.halt = function () {
    this.stopPropagation();
    this.preventDefault();
  };
};

var KorAP = KorAP || {};


(function (KorAP) {
  "use strict";

  KorAP.init = function () {

    /**
     * Add actions to match entries
     */
    var inactiveLi = document.querySelectorAll('#search > ol > li:not(.active)');
    var i = 0;
    for (i = 0; i < inactiveLi.length; i++) {
      inactiveLi[i].addEventListener('click', function () {

	if (this._match !== undefined) {
	  this._match.open();
	  console.log('already open');
	}
	else {
	  KorAP.Match.create(this).open();
	  console.log('newly open');
	}

	
      });
    };

    /**
     * Toggle the alignment (left <=> right)
     */
    if (i > 0) {
      var br = document.getElementById('button-right');
      if (br !== undefined) {
	var toggle = document.createElement('a');
	toggle.setAttribute('title', 'toggle Alignment');
	// Todo: Reuse old alignment from cookie!
	var cl = toggle.classList;
	cl.add('align');
	cl.add('right');
	toggle.addEventListener(
	  'click',
	  function (e) {
	    var ol = document.querySelector('#search > ol');
	    ol.toggleClass("align-left", "align-right");
	    this.toggleClass("left", "right");
	  });
	toggle.appendChild(document.createElement('span'))
	  .appendChild(document.createTextNode('Alignment'));
	br.appendChild(toggle);
      };
    };
  };

  /*
  function _openMatch (e) {
    e.halt();
    this.classList.add("active");
    var matchElement = this;

    // Todo: Add object to element
    var ul = document.createElement('ul');
    ul.classList.add('action', 'right');
    matchElement.appendChild(ul);

    // Todo:: Localize!
    var close = document.createElement('li');
    close.appendChild(document.createElement('span'))
      .appendChild(document.createTextNode('Close'));
    close.classList.add('close');
    close.setAttribute('title', 'Close');

    close.addEventListener('click', function (ie) {
      ie.halt();
      var match = matchElement['_match'];
      match.destroy();
      matchElement.classList.remove('active');
      matchElement.removeChild(ul);
    });

    // Todo:: Localize!
    var info = document.createElement('li');
    info.appendChild(document.createElement('span'))
      .appendChild(document.createTextNode('Info'));
    info.classList.add('info');
    info.setAttribute('title', 'Information');

    // Add information, unless it already exists
    info.addEventListener('click', function (ie) {
      ie.halt();
      KorAP.Match.create(matchElement).addInfo();
    });

    ul.appendChild(close);
    ul.appendChild(info);
  };
*/

  /**
  function _closeMatch (e) {
    e.halt();
    this.parentNode.parentNode.classList.remove("active");
  };
  */

}(this.KorAP));
