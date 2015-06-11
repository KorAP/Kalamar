define([
  'match',
  'hint',
  'vc',
  'tutorial',
  'lib/domReady',
  'hint/array',
  'lib/alertify',
  'api',
  'mailToChiffre',
  'lib/highlight/highlight.pack',
  'util'
], function (matchClass,
	     hintClass,
	     vcClass,
	     tutClass,
	     domReady,
	     hintArray,
	     alertifyClass) {

  // Set hint array for hint helper
  KorAP.hintArray = hintArray;

  // Localization values
  var loc = KorAP.Locale;
  loc.VC_allCorpora    = loc.VC_allCorpora  || 'all Corpora';
  loc.VC_oneCollection = loc.VC_oneCollection  || 'one Collection';

  // Override KorAP.log
  window.alertify = alertifyClass;
  KorAP.log = function (type, msg) {

    // Use alertify to log errors
    alertifyClass.log(
      (type === 0 ? '' : type + ': ') +
	msg,
      'error',
      5000
    );
  };

  domReady(function (event) {
    var obj = {};

    /**
     * Replace Virtual Collection field
     */
    var vcname;
    var input = document.getElementById('collection');
    if (input) {
      input.style.display = 'none';
      vcname = document.createElement('span');
      vcname.setAttribute('id', 'vc-choose');

      vcname.appendChild(
	document.createTextNode(
	  document.getElementById('vc-name').value ||
	  (KorAP.currentVC !== undefined) ? loc.VC_oneCollection : loc.VC_allCorpora
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
      var br = document.querySelector('div.button.right');
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
	  if (vc === undefined)
	    vc = _getCurrentVC(vcClass);
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

    // Initialize documentation links
    obj.tutorial.initDocLinks(document);

/*
    if (KorAP.currentQuery !== undefined) {
      var sb = document.getElementById('searchbar');
      var kq = document.createElement('div');
      kq.setAttribute('id', 'koralquery');
      sb.parentNode.insertBefore(kq, sb.nextSibling);
      kq.innerHTML = JSON.stringify(KorAP.currentQuery, null, '  ');
      hljs.highlightBlock(kq);
    };
*/

    /**
     * Add VC creation on submission.
     */
    var form = document.getElementById('searchform');
    if (form !== undefined) {
      form.addEventListener('submit', function (e) {
	if (vc === undefined)
	  vc = _getCurrentVC(vcClass);

	if (vc !== undefined)
	  input.value = vc.toQuery();
      });
    };

    /**
     * Init hint helper
     * has to be final because of
     * reposition
     */
    // Todo: Pass an element, so this works with
    // tutorial pages as well!
    obj.hint = hintClass.create();

    return obj;
  });
});

// Render Virtual collection
function _getCurrentVC (vcClass) {
  var vc = vcClass.create([
    ['title', 'string'],
    ['subTitle', 'string'],
    ['pubDate', 'date'],
    ['author', 'string']
  ]);
  if (KorAP.currentVC !== undefined)
    vc.fromJson(KorAP.currentVC);

  return vc;
};

