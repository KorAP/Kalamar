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

"use strict";
define([
  'match',
  'hint',
  'vc',
  'tutorial',
  'lib/domReady',
  'vc/array',
  'lib/alertify',
  'session',
  'state/manager',
  'selectMenu',
  'panel/result',
  'panel/query',
  'panel/pagination',
  'tour/tours',
  'plugin/server',
  'pipe',
  'api',
  'mailToChiffre',
  'util',
  'state'
], function (matchClass,
             hintClass,
             vcClass,
             tutClass,
             domReady,
             vcArray,
             alertifyClass,
             sessionClass,
             stateManagerClass,
             selectMenuClass,
             resultPanelClass,
             queryPanelClass,
             paginationPanelClass,
             tourClass,
             pluginClass,
             pipeClass) {

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

  KorAP.vc = vcClass.create(vcArray); 

  domReady(function (event) {

    const d = document;
    
    // Set base URL
    KorAP.URL = d.body.getAttribute('data-korap-url') || "";
  
    // Create suffix if KorAP is run in a subfolder
    KorAP.session = sessionClass.create(
      KorAP.URL.length > 0 ? 'kalamarJS-' + KorAP.URL.slugify() : 'kalamarJS'
    );

    // Get koralQuery response
    const kqe = d.getElementById('koralQuery');
    if (kqe !== null) {
      KorAP.koralQuery = JSON.parse(kqe.getAttribute('data-koralquery') || "");
    };

    let gt = document.getElementsByClassName('link-guided-tour');
    if (gt.length != null){
      for(let j = 0; j < gt.length; j++){
        gt[j].setAttribute('href', '#');
        gt[j].addEventListener('click', function(){
          tourClass.gTstartSearch().start();

          // Close the burger menu by simulating a click on the burger icon
          const burgerIcon = document.querySelector('.burger-icon');
          if (isBurgerMenuOpen) {
            burgerIcon.click();
          }
        });
      }

      KorAP.tourshowR = function(){
        tourClass.gTshowResults().start();
      };
    }
    
    var obj = {};

    // What should be visible in the beginning?
    var show = KorAP.session.get('show') || {};
    
    KorAP.Panel = KorAP.Panel || {}

    /**
     * Release notifications
     */
    d.querySelectorAll('#notifications div.notify').forEach(
      function(e) {
        let msg = e.textContent;

        let src = e.getAttribute('data-src');
        if (src) {
          msg += '<code class="src">'+src+'</code>';
        };

        let type = e.getAttribute('data-type') || "error";
        alertifyClass.log(msg, type, 10000);
      }
    );

    // Responsive navbar: hide and show burger menu
    const burgerIcon = document.querySelector('.burger-icon');
    let isBurgerMenuOpen = false;

    if (burgerIcon) {
      burgerIcon.addEventListener('click', function() {
        const navbar = document.querySelector('.navbar');
        navbar.classList.toggle('show');

        isBurgerMenuOpen = !isBurgerMenuOpen;
        if (isBurgerMenuOpen) {
          navbar.style.top = '0';
        }
      });
    }
    
    // Fallback solution for login dropdown visibility (if :focus-within is not supported)
    document.addEventListener('DOMContentLoaded', function() {
      const dropdown = document.querySelector('.dropdown');
      const dropdownContent = document.querySelector('.dropdown-content');
      
      dropdown.addEventListener('mouseenter', function() {
        dropdownContent.style.display = 'block';
      });
    
      dropdown.addEventListener('mouseleave', function() {
        // If no input inside the form is focused, then close dropdown content
        if (!dropdown.contains(document.activeElement)) {
          dropdownContent.style.display = 'none';
        }
      });
    
      dropdownContent.addEventListener('focusin', function() {
        dropdownContent.style.display = 'block';
      });
    
      dropdownContent.addEventListener('focusout', function(e) {
        // If focus moved outside the dropdown content, then close it
        if (!dropdownContent.contains(e.relatedTarget)) {
          dropdownContent.style.display = 'none';
        }
      });
    });

    /**
     * Replace Virtual Corpus field
     */
    var vcname, vcchoose;
    var input = d.getElementById('cq');

    var vc = KorAP.vc;
    
    // Add vc name object
    if (input) {
      input.style.display = 'none';
      vcname = d.createElement('span');
      vcname.setAttribute('id', 'vc-choose');
      vcname.classList.add('select');

      // Load virtual corpus object
      // Supports "collection" for legacy reasons
      if (KorAP.koralQuery !== undefined && (KorAP.koralQuery["collection"] || KorAP.koralQuery["corpus"])) {
        try {
          vc.fromJson(KorAP.koralQuery["collection"] || KorAP.koralQuery["corpus"]);
        }
        catch (e) {
          KorAP.log(0,e);
        }
      };

      vcchoose = vcname.addE('span');
      vcchoose.addT(vc.getName());

      if (vc.wasRewritten()) {
        vcchoose.classList.add('rewritten');
      };

      input.parentNode.insertBefore(vcname, input);
    };

    /**
     * Add actions to match entries
     */
    var matchElements = d.querySelectorAll(
      '#search > ol > li'
    );

    matchElements.forEach(function(e) {

      // Define class for active elements
      if (e.classList.contains('active')) {
        if (e._match === undefined) {
          // lazyLoad
          matchClass.create(e).init();
        };
      }

      // Define class for inactive elements
      else {
        e.addEventListener('click', function (e) {
          if (this._match !== undefined)
            this._match.open();
          else {
            // lazyLoad
            matchClass.create(this).open();
          };
          // This would prevent the sidebar to go back
          // e.halt();
        });
        e.addEventListener('keydown', function (e) {
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
    });
    
    // Function to toggle the shifted class on elements
    function shiftContent() {
      // Get elements to perform content shift when sidebar is active
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      const footer = document.querySelector('footer');
      const hint = document.querySelector('#hint');
      const results = document.querySelector('.found');
      const aside = document.querySelector('aside');

      if (aside && aside.classList.contains('active')) {
        header.classList.add('shifted');
        if (!results) {
          main.classList.add('shifted');
        }
        footer.classList.add('shifted');
        if (hint) {
          hint.classList.add('shifted');
          adjustHintPosition();
        }
      } else {
        header.classList.remove('shifted');
        main.classList.remove('shifted');
        footer.classList.remove('shifted');
        if (hint) {
          hint.classList.remove('shifted');
          adjustHintPosition();
        }
      }
    }
    
    // Function to adjust the position of the annotation assistant bar (hint), when user types into the searchbar and clicks the sidebar (or anywhere outside the searchbar) afterwards
    function adjustHintPosition() {
      const hint = document.querySelector('#hint');
      const searchInput = document.querySelector('#q-field');
      const aside = document.querySelector('aside');

      if (hint && searchInput) {
        // Create a temporary span to measure the exact text width
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'pre';
        // Copy the input's font properties
        const inputStyle = window.getComputedStyle(searchInput);
        span.style.font = inputStyle.font;
        span.style.fontSize = inputStyle.fontSize;
        span.style.fontFamily = inputStyle.fontFamily;
        span.textContent = searchInput.value;
        document.body.appendChild(span);

        // Get the actual width of the text
        const inputWidth = searchInput.value.length > 0 ? span.offsetWidth : 0;
        document.body.removeChild(span);
        let hintLeftPosition = inputWidth;

        if (aside && aside.classList.contains('active')) {
          hintLeftPosition += 230;
        }
        
        hint.style.left = `${hintLeftPosition}px`;
      }
    }

    document.querySelector('#q-field').addEventListener('blur', adjustHintPosition);

    // MutationObserver to detect when #hint is injected into the DOM
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          const hint = document.querySelector('#hint');
          if (hint) {
            shiftContent();
            observer.disconnect();
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Add focus listener to aside
    var aside = d.getElementsByTagName('aside')[0];

    if (aside && aside.classList.contains('active') == false) {

      // Horrible lock to deal with sidebar clicks
      var asideClicked = false;

      shiftContent();

      // Make aside active on focus
      aside.addEventListener('focus', function (e) {
        this.classList.add('active');
        shiftContent();
      });

      // Deactivate focus when clicking anywhere else
      var body = d.getElementsByTagName('body')[0];
      if (body !== null) {
        body.addEventListener('click', function () {
          if (!asideClicked) {
            aside.classList.remove('active');
            shiftContent();
          } else {
            asideClicked = false;
          }
        });
      }

      /* Stop click event on aside
       * (to not trickle down to body)
       */
      aside.addEventListener('click', function (e) {
        asideClicked = true;
      });
    }

    // Replace QL select menus with KorAP menus
    var qlField = d.getElementById('ql-field');
    if (qlField !== null) {
      KorAP.QLmenu = selectMenuClass.create(
        d.getElementById('ql-field').parentNode
      ).limit(10);
    };

    var resultInfo = d.getElementById('resultinfo');

    /**
     * Add result panel
     */
    var resultPanel = resultPanelClass.create(show);
   
    if (resultInfo != null) {

      // Move buttons to resultinfo
      resultInfo.appendChild(resultPanel.actions().element());

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
        KorAP.koralQuery["errors"].forEach(function(e) {

          // Malformed query
          if (e[0] === 302 && e[2] !== undefined) {
            obj.hint = hintClass.create();
            obj.hint.alert(e[2], e[1]);
          }

          // no query
          else if (e[0] === 301) {
            obj.hint = hintClass.create();
            obj.hint.alert(0, e[1]);      
          }
        });
      };
    };

    
    /*
     * There is more than 0 matches, so allow for
     * alignment toggling (left <=> right)
     */
    if (matchElements.length > 0)
      resultPanel.addAlignAction();

    KorAP.Panel['result'] = resultPanel;
    /*
     * Toggle the Virtual Corpus builder
     */
    if (vcname) {
      vc.onMinimize = function () {
        vcname.classList.remove('active');
        delete show['vc'];
      };

      vc.onOpen = function () {
        vcname.classList.add('active');

        var view = d.getElementById('vc-view');
        if (!view.firstChild)
          view.appendChild(this.element());
        
        show['vc'] = true;
      };
      
      var vcclick = function () {
        if (vc.isOpen()) {
          vc.minimize()
        }
        else {
          vc.open();
        };
      };

      vcname.onclick = vcclick;

      // Click, if the VC should be shown
      if (show['vc']) {
        vcclick.apply();
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

        if (vc !== undefined) {
          input.value = vc.toQuery();
          if (input.value == '')
            input.removeAttribute('name');
        }
        else {
          input.removeAttribute('value');
          input.removeAttribute('name');
        };

        // This would preferably set the query to be "disabled",
        // but in that case the query wouldn't be submitted
        // at all.
        // Setting the cursor to "progress" fails in current versions
        // of webkit.
        qf.classList.add("loading");
        d.getElementById('qsubmit').classList.add("loading");
      });
    };
 
    
    //Starts the guided tour at the next page
    if(KorAP.session.get("tour")){
      tourClass.gTshowResults().start();
    }
    
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


    /**
     * Add query panel
     */
    var queryPanel = queryPanelClass.create();

    // Get input field
    var vcView = d.getElementById('vc-view')
    if (form && vcView) {
      // The views are below the query bar
      form.insertBefore(queryPanel.element(), vcView);
      KorAP.Panel['query'] = queryPanel;
    };


    /**
     * Add pagination panel
     */
    const paginationPanel = paginationPanelClass.create();

    if (paginationPanel) {
      paginationPanel.addRandomPage();
      KorAP.Panel['pagination'] = paginationPanel;
    };


    /**
     * Initialize password toggle.
     */
    initCopyToClipboard(d);

      
    /**
     * Initialize password toggle.
     */
    initTogglePwdVisibility(d);
      
    /**
     * Initialize Plugin registry.
     */
    let pe;
    if (pe = d.getElementById("kalamar-plugins")) {
      let url = pe.getAttribute('data-plugins');
      if (url !== undefined) {
        KorAP.API.getPluginList(url, function (json) {
          if (json && json.length > 0) {

            // Add state manager
            form = d.getElementById("searchform");
            if (!form) {
              return;
            };

            const input = form.addE("input");
            input.setAttribute("name","state");
            KorAP.States = stateManagerClass.create(input);
            
            // Load Plugin Server first
            KorAP.Plugin = pluginClass.create();

            // Add services container to head
            d.head.appendChild(KorAP.Plugin.element());

            // Add pipe form
            KorAP.Pipe = pipeClass.create();
            d.getElementById("searchform").appendChild(KorAP.Pipe.element());

            try {
              
              // Register all plugins
              json.forEach(i => KorAP.Plugin.register(i));
            }
            catch (e) {
              KorAP.log(0, e);
            }
          }
        });
      };
    };

    window.dispatchEvent(new Event("ui-ready"));
      
    return obj;
  });
  
});
