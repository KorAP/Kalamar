/*
 * TODO: Create lazy loading of objects including
 * - obj.hint()
 * - obj.alertify()
 * - obj.session()
 * - obj.tutorial()
 * - obj.vc() // toggle
 * - obj.matchCreate() (using webpack)
 * - obj.koral() (show result, parse for errors ...)
 * - obj.alignment() // toggle
 */

define([
  'match',
  'hint',
  'vc',
  'tutorial',
  'lib/domReady',
  'hint/array',
  'vc/array',
  'lib/alertify',
  'session',
  'tagger',
  'selectMenu',
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
             alertifyClass,
             sessionClass,
             tagger,
             selectMenuClass) {

  // Set hint array for hint helper
  KorAP.hintArray = hintArray;

  // Localization values
  var loc = KorAP.Locale;
  loc.VC_allCorpora    = loc.VC_allCorpora    || 'all Corpora';
  loc.VC_oneCollection = loc.VC_oneCollection || 'one Collection';
  loc.TOGGLE_ALIGN     = loc.TOGGLE_ALIGN     || 'toggle Alignment';
  loc.SHOW_KQ          = loc.SHOW_KQ          || 'show KoralQuery';
  loc.SHOW_META        = loc.SHOW_META        || 'show Metadata';


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

    var session = sessionClass.create('KalamarJS');

    // What should be visible?
    var show = session.get('show') || {};

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
      vcname.classList.add('select');

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
          // lazyLoad
          matchClass.create(this).open();
        };
        // This would prevent the sidebar to go back
        // e.halt();
      });
      inactiveLi[i].addEventListener('keydown', function (e) {
        var code = _codeFromEvent(e);
        
        switch (code) {
        case 32:
          if (this._match !== undefined)
            this._match.toggle();
          else {
            // lazyLoad
            matchClass.create(this).open();
          };
          e.halt();
          break;
        };
      });
    };

    // Add focus listener to aside
    var aside = document.getElementsByTagName('aside')[0];

    if (aside && aside.classList.contains('active') == false) {

      // Horrible lock to deal with sidebar clicks
      var asideClicked = false;
      
      // Make aside active on focus
      aside.addEventListener('focus', function(e) {
        this.classList.add('active');
      });

      // Deactivate focus when clicking anywhere else
      var body = document.getElementsByTagName('body')[0];
      if (body !== null) {
        body.addEventListener('click', function() {
          if (!asideClicked) {
            aside.classList.remove('active');
          }
          else {
            asideClicked = false;
          };
        });
      };

      /* Stop click event on aside
       * (to not trickle down to body)
       */
      aside.addEventListener('click', function(e) {
        asideClicked = true;
      });
    };

      
    // Replace QL select menus with KorAP menus
    var qlField = document.getElementById('ql-field');
    if (qlField !== null) {
      selectMenuClass.create(
        document.getElementById('ql-field').parentNode
      ).limit(5);
    };

    var result = document.getElementById('resultinfo');
    var resultButton = null;
    var leftButton = null;
    if (result != null) {

      // Add right buttons
      resultButton = result.appendChild(document.createElement('div'));
      resultButton.classList.add('result', 'button');

      leftButton =  result.appendChild(document.createElement('div'));
      leftButton.classList.add('result', 'button', 'left');
    };

    // There is a koralQuery
    if (KorAP.koralQuery !== undefined) {

      if (resultButton !== null) {
        var kq;
        var toggle = document.createElement('a');
        toggle.setAttribute('title', loc.SHOW_KQ)
        toggle.classList.add('show-kq', 'button');
        toggle.appendChild(document.createElement('span'))
          .appendChild(document.createTextNode(loc.SHOW_KQ));
        resultButton.appendChild(toggle);

        var showKQ = function () {
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

          if (kq.style.display === 'none') {
            kq.style.display = 'block';
            show['kq'] = true;
          }
          else {
            kq.style.display = 'none';
            delete show['kq'];
          };
        };

        if (toggle !== undefined) {
          
          // Show koralquery
          toggle.addEventListener('click', showKQ);
        };
      };

      if (KorAP.koralQuery["errors"]) {
        var errors = KorAP.koralQuery["errors"];
        for (var i in errors) {

          // Malformed query
          if (errors[i][0] === 302 && errors[i][2]) {
            obj.hint = hintClass.create();
            obj.hint.alert(errors[i][2], errors[i][1]);
            break;
          }

          // no query
          else if (errors[i][0] === 301) {
            obj.hint = hintClass.create();
            obj.hint.alert(0, errors[i][1]);      
          }
        }
      };

      // Session has KQ visibility stored
      if (show["kq"])
        showKQ.apply();
    };

    // There is more than 0 matches and there is a resultButton
    if (i > 0) {

      if (resultButton !== null) {

        /**
         * Toggle the alignment (left <=> right)
         */
        // querySelector('div.button.right');
        
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

      /*
      // Not ready yet
      if (leftButton !== null) {
        var metaInfo = document.createElement('a');
        metaInfo.setAttribute('title', loc.SHOW_META)

        var cl = metaInfo.classList;
        cl.add('show-meta', 'button');
        metaInfo.appendChild(document.createElement('span'))
          .appendChild(document.createTextNode(loc.SHOW_META));
        leftButton.appendChild(metaInfo);
      };
      */
    };

    /**
     * Toggle the Virtual Collection builder
     */
    if (vcname) {
      var vc;
      var vcclick = function () {
        var view = document.getElementById('vc-view');

        // The vc is visible
        if (vcname.classList.contains('active')) {
          view.removeChild(vc.element());
          vcname.classList.remove('active');
          delete show['collection'];
        }

        // The vc is not visible
        else {
          if (vc === undefined)
            vc = _getCurrentVC(vcClass, vcArray);
          view.appendChild(vc.element());
          vcname.classList.add('active');
          show['collection'] = true;
        };
      };
      vcname.onclick = vcclick;
      if (show['collection']) {
        vcclick.apply();
      };
    };

    
    /**
     * Init Tutorial view
     */
    if (document.getElementById('view-tutorial')) {
      window.tutorial = tutClass.create(
        document.getElementById('view-tutorial'),
        session
      );
      obj.tutorial = window.tutorial;
    }

    // Tutorial is in parent
    else if (window.parent) {
      obj.tutorial = window.parent.tutorial;
    };

    // Initialize queries for document
    if (obj.tutorial) {
      obj.tutorial.initQueries(document);

      // Initialize documentation links
      obj.tutorial.initDocLinks(document);
    };


    /**
     * Add VC creation on submission.
     */
    var form = document.getElementById('searchform');
    if (form !== null) {
      form.addEventListener('submit', function (e) {
        var qf = document.getElementById('q-field');

        // No query was defined
        if (qf.value === undefined || qf.value === '') {
          qf.focus();
          e.halt();
          KorAP.log(700, "No query given");
          return;
        };

        // Store session information
        session.set("show", show);

        // Set Virtual collection 
        if (vc === undefined) {
          vc = _getCurrentVC(vcClass, vcArray);
        };

        if (vc !== undefined) {
          input.value = vc.toQuery();
        }
        else {
          delete input['value'];
        };
      });
    };

    /**
     * Init hint helper
     * has to be final because of
     * reposition
     */
    // Todo: Pass an element, so this works with
    // tutorial pages as well!
    if (obj.hint === undefined)
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
