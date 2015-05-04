define([
  'match',
  'hint',
  'vc',
  'tutorial',
  'lib/domReady',
  'hint/array',
  'lib/alertify',
  'api',
  'util'
], function (matchClass,
	     hintClass,
	     vcClass,
	     tutClass,
	     domReady,
	     hintArray,
	     alertifyClass) {
  domReady(function (event) {
    var obj = {};

    /**
     * Replace Virtual Collection field
     */
    var vcname;
    var input = document.getElementById('vc');
    if (input) {
      input.style.display = 'none';
      vcname = document.createElement('span');
      vcname.setAttribute('id', 'vc-choose');
      vcname.appendChild(
	document.createTextNode(
	  document.getElementById('vc-name').value
	)
      );
      input.parentNode.insertBefore(vcname, input);
    };


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
	else {
	  matchClass.create(this).open();
	};
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
	cl.add('align', 'right');
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
     * Toggle the Virtual Collection builder
     */
    if (vcname) {
      var vc;
      vcname.onclick = function () {
	var view = document.getElementById('vc-view');

	// The vc is visible
	if (this.classList.contains('active')) {
	  view.removeChild(vc.element());
	  this.classList.remove('active');
	}

	// The vc is not visible
	else {
	  // The vc is not rendered yet
	  if (vc === undefined) {
	    vc = vcClass.create([
	      ['title', 'string'],
	      ['subTitle', 'string'],
	      ['pubDate', 'date'],
	      ['author', 'string']
	    ]);

	    if (KorAP.currentVC !== undefined)
	      vc.fromJson(KorAP.currentVC);
	  };
	  view.appendChild(vc.element());
	  this.classList.add('active');
	};
      };
    };

  
    /**
     * Init Tutorial view
     */
    if (document.getElementById('view-tutorial')) {
      window.tutorial = tutClass.create(
	document.getElementById('view-tutorial')
      );
      obj.tutorial = window.tutorial;
    }

    // Tutorial is in parent
    else if (window.parent) {
      obj.tutorial = window.parent.tutorial;
    };

    // Initialize queries for document
    if (obj.tutorial)
      obj.tutorial.initQueries(document);

    /**
     * Init hint helper
     * has to be final because of
     * reposition
     */
    // Todo: Pass an element, so this works with
    // tutorial pages as well!
    obj.hint = hintClass.create();

    // Set hint array for hint helper
    KorAP.hintArray = hintArray;

    // Override KorAP.log
    KorAP.log = function (type, msg) {

      // Use alertify to log errors
      alertifyClass.log(
	(type === 0 ? '' : type + ': ') +
	  msg,
	'error',
	5000
      );
    };

    return obj;
  });
});
