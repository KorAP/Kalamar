define([
  'match',
  'hint',
  'vc',
  'tutorial',
  'lib/domReady',
  'hint/array',
  'vc/array',
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
	     vcArray,
	     alertifyClass) {

  // Set hint array for hint helper
  KorAP.hintArray = hintArray;

  // Localization values
  var loc = KorAP.Locale;
  loc.VC_allCorpora    = loc.VC_allCorpora  || 'all Corpora';
  loc.VC_oneCollection = loc.VC_oneCollection  || 'one Collection';
  loc.TOGGLE_ALIGN = loc.TOGGLE_ALIGN  || 'toggle Alignment';
  loc.SHOW_KQ = loc.SHOW_KQ  || 'show KoralQuery';

  // Override KorAP.log
  window.alertify = alertifyClass;
  KorAP.log = function (code, msg) {

    // Use alertify to log errors
    alertifyClass.log(
      (code === 0 ? '' : code + ': ') +
	msg,
      'error',
      10000
    );
  };

  domReady(function (event) {
    var obj = {};

    /**
     * Release notifications
     */
    if (KorAP.Notifications !== undefined) {
      var n = KorAP.Notifications;
      for (var i = 0; i < n.length; i++) {
	alertifyClass.log(n[i][1], n[i][0], 10000);
      };
    };

    /**
     * Replace Virtual Collection field
     */
    var vcname;
    var input = document.getElementById('collection');
    if (input) {
      input.style.display = 'none';
      vcname = document.createElement('span');
      vcname.setAttribute('id', 'vc-choose');

      var currentVC = loc.VC_allCorpora;
      if (KorAP.koralQuery !== undefined && KorAP.koralQuery["collection"]) {
	currentVC = loc.VC_oneCollection;
      };

      vcname.appendChild(
	document.createTextNode(
	  document.getElementById('collection-name').value || currentVC
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

    var result = document.getElementById('resultinfo');
    var resultButton;
    if (result != null) {
      resultButton = result.appendChild(document.createElement('div'));
      resultButton.classList.add('result', 'button'); 
    };

    // There is a koralQuery
    if (KorAP.koralQuery !== undefined && resultButton !== null) {
      var kq;
      
      var toggle = document.createElement('a');
      toggle.setAttribute('title', loc.SHOW_KQ)
      toggle.classList.add('show-kq', 'button');
      toggle.appendChild(document.createElement('span'))
	.appendChild(document.createTextNode(loc.SHOW_KQ));
      resultButton.appendChild(toggle);

      if (toggle !== undefined) {
      
	// Show koralquery
	toggle.addEventListener(
	  'click', function () {
	    if (kq === undefined) {
	      kq = document.createElement('div');
	      kq.setAttribute('id', 'koralquery');
	      kq.style.display = 'none';
	      var kqInner = document.createElement('div');
	      kq.appendChild(kqInner);
	      kqInner.innerHTML = JSON.stringify(KorAP.koralQuery, null, '  ');
	      hljs.highlightBlock(kqInner);
	      var sb = document.getElementById('search');
	      sb.insertBefore(kq, sb.firstChild);
	    };

	    kq.style.display = (kq.style.display === 'none') ? 'block' : 'none';
	  }
	);
      };
    };


    /**
     * Toggle the alignment (left <=> right)
     */
    // querySelector('div.button.right');
    if (i > 0 && resultButton !== null) {
      var toggle = document.createElement('a');
      toggle.setAttribute('title', loc.TOGGLE_ALIGN);
      // Todo: Reuse old alignment from query
      var cl = toggle.classList;
      cl.add('align', 'right', 'button');
      toggle.addEventListener(
	'click',
	function (e) {
	  var ol = document.querySelector('#search > ol');
	  ol.toggleClass("align-left", "align-right");
	  this.toggleClass("left", "right");
	});
      toggle.appendChild(document.createElement('span'))
	.appendChild(document.createTextNode(loc.TOGGLE_ALIGN));
      resultButton.appendChild(toggle);
    };


    /**
     * Toggle the Virtual Collection builder
     */
    if (vcname) {
      var collectionShow = document.getElementById('collection-show');
      var vc;
      var vcclick = function () {
	var view = document.getElementById('vc-view');

	// The vc is visible
	if (this.classList.contains('active')) {
	  view.removeChild(vc.element());
	  this.classList.remove('active');
	  delete collectionShow['value'];
	}

	// The vc is not visible
	else {
	  if (vc === undefined)
	    vc = _getCurrentVC(vcClass, vcArray);
	  view.appendChild(vc.element());
	  this.classList.add('active');
	  collectionShow.value = 'true';
	};
      };
      vcname.onclick = vcclick;
      if (collectionShow.value === 'true') {
	vcclick.apply();
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


    /**
     * Add VC creation on submission.
     */
    var form = document.getElementById('searchform');
    if (form !== undefined) {
      form.addEventListener('submit', function (e) {
	if (vc === undefined)
	  vc = _getCurrentVC(vcClass, vcArray);

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
function _getCurrentVC (vcClass, vcArray) {
  var vc = vcClass.create(vcArray);
  if (KorAP.koralQuery !== undefined && KorAP.koralQuery["collection"]) {
    vc.fromJson(KorAP.koralQuery["collection"]);
  };
  return vc;
};

