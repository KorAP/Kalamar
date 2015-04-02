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


  /**
   * Initialize user interface elements
   */
  KorAP.init = function () {

    /**
     * Add actions to match entries
     */
    var inactiveLi = document.querySelectorAll(
      '#search > ol > li:not(.active)'
    );
    var i = 0;
    for (i = 0; i < inactiveLi.length; i++) {
      inactiveLi[i].addEventListener('click', function (e) {
	if (this._match !== undefined)
	  this._match.open();
	else
	  KorAP.Match.create(this).open();
	e.halt();
      });
    };


    /**
     * Toggle the alignment (left <=> right)
     */
    if (i > 0) {
      var br = document.getElementById('button-right');
      if (br !== null) {
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

    /**
     * Init hint helper
     */
    KorAP.Hint.create();
  };

}(this.KorAP));
