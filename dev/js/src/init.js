/*
 * Initialize The JS frontend part and decorate
 * the static HTML data.
 *
 * @author Nils Diewald
 *
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
  'vc/array',
  'lib/alertify',
  'session',
  'selectMenu',
  'panel/result',
  'api',
  'mailToChiffre',
  'util'
], function (matchClass,
             hintClass,
             vcClass,
             tutClass,
             domReady,
             vcArray,
             alertifyClass,
             sessionClass,
             selectMenuClass,
             resultPanelClass) {

  // Localization values
  const loc = KorAP.Locale;
  loc.VC_allCorpora    = loc.VC_allCorpora    || 'all corpora';
  loc.VC_oneCollection = loc.VC_oneCollection || 'a virtual corpus';

  const d = document;

  KorAP.session = sessionClass.create('KalamarJS');

  // Override KorAP.log
  window.alertify = alertifyClass;
  KorAP.log = function (code, msg, src) {

    if (src) {
      msg += '<code class="src">'+src+'</code>';
    };

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

    // What should be visible in the beginning?
    var show = KorAP.session.get('show') || {};

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
    var vcname, vcchoose;
    var input = d.getElementById('collection');
    if (input) {
      input.style.display = 'none';
      vcname = d.createElement('span');
      vcname.setAttribute('id', 'vc-choose');
      vcname.classList.add('select');

      var currentVC = loc.VC_allCorpora;
      if (KorAP.koralQuery !== undefined && KorAP.koralQuery["collection"]) {
        currentVC = loc.VC_oneCollection;
      };

      vcchoose = vcname.addE('span');

      vcchoose.addT(
        d.getElementById('collection-name').value || currentVC
      );

      input.parentNode.insertBefore(vcname, input);
    };

    /**
     * Add actions to match entries
     */
    var inactiveLi = d.querySelectorAll(
      '#search > ol > li:not(.active)'
    );
    var matchCount = 0;

    for (matchCount = 0; matchCount < inactiveLi.length; matchCount++) {
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
      inactiveLi[matchCount].addEventListener('keydown', function (e) {
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
    var aside = d.getElementsByTagName('aside')[0];

    if (aside && aside.classList.contains('active') == false) {

      // Horrible lock to deal with sidebar clicks
      var asideClicked = false;
      
      // Make aside active on focus
      aside.addEventListener('focus', function(e) {
        this.classList.add('active');
      });

      // Deactivate focus when clicking anywhere else
      var body = d.getElementsByTagName('body')[0];
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
    var qlField = d.getElementById('ql-field');
    if (qlField !== null) {
      KorAP.QLmenu = selectMenuClass.create(
        d.getElementById('ql-field').parentNode
      ).limit(5);
    };

    var resultInfo = d.getElementById('resultinfo');

    /**
     * Add result panel
     */
    var resultPanel = resultPanelClass.create(show);

    if (resultInfo != null) {

      // Move buttons to resultinfo
      resultInfo.appendChild(resultPanel.actions.element());

      // The views are at the top of the search results
      var sb = d.getElementById('search');
      sb.insertBefore(resultPanel.element(), sb.firstChild);
    };

    
    // There is a koralQuery
    if (KorAP.koralQuery !== undefined) {    

      // Add KoralQuery view to result panel
      if (resultInfo !== null) {
        resultPanel.addKqAction()
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
    };

    
    /*
     * There is more than 0 matches, so allow for
     * alignment toggling (left <=> right)
     */
    if (matchCount > 0)
      resultPanel.addAlignAction();


    /*
     * Toggle the Virtual Collection builder
     */
    if (vcname) {
      var vc;
      var vcclick = function () {
        var view = d.getElementById('vc-view');

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

      // Click, if the VC should be shown
      if (show['collection']) {
        vcclick.apply();
      }

      // else
      else if (_checkVCrewrite(vcClass)) {
        vcchoose.classList.add('rewritten');
      };
    };

    
    /**
     * Init Tutorial view
     */
    if (d.getElementById('view-tutorial')) {
      window.tutorial = tutClass.create(
        d.getElementById('view-tutorial'),
        KorAP.session
      );
      obj.tutorial = window.tutorial;
    }

    // Tutorial is in parent
    else if (window.parent) {
      obj.tutorial = window.parent.tutorial;
    };

    // Initialize queries for d
    if (obj.tutorial) {
      obj.tutorial.initQueries(d);

      // Initialize documentation links
      obj.tutorial.initDocLinks(d);
    };


    /**
     * Add VC creation on submission.
     */
    var form = d.getElementById('searchform');
    if (form !== null) {
      form.addEventListener('submit', function (e) {
        var qf = d.getElementById('q-field');

        // No query was defined
        if (qf.value === undefined || qf.value === '') {
          qf.focus();
          e.halt();
          KorAP.log(700, "No query given");
          return;
        };

        // Store session information
        KorAP.session.set("show", show);

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

    // Add the hinthelper to the KorAP object to make it manipulatable globally
    KorAP.Hint = obj.hint;

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


function _checkVCrewrite (vcClass) {
  if (KorAP.koralQuery !== undefined && KorAP.koralQuery["collection"]) {
    return vcClass.checkRewrite(KorAP.koralQuery["collection"]);
  };
  return false;
}
