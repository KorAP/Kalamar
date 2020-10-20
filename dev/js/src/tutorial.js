/**
 * Open and close a tutorial page.
 * The current page is stored and retrieved in a session cookie.
 */
// TODO: Make this a panel
// TODO: Add query mechanism!
// TODO: Highlight current section:
//       http://stackoverflow.com/questions/24887258/highlight-navigation-link-as-i-scroll-down-the-page
"use strict";

define(['session','buttongroup','util'], function (sessionClass, buttonGroupClass) {

  // Localization values
  const loc   = KorAP.Locale;
  loc.CLOSE = loc.CLOSE || 'Close';

  const d = document;
  
  return {

    /**
     * Create new tutorial object.
     * Accepts an element to bind the tutorial window to.
     */
    create : function (obj,session) {
      if (!obj)
	      return null;
      return Object.create(this)._init(obj,session);
    },


    // Initialize Tutorial object
    _init : function (obj, session) {
      const t = this;

      if (session === undefined) {
	      t._session = sessionClass.create();
      }
      else {
	      t._session = session;
      };
    
      if (obj) {
	      t._show = obj;
	      t.start = obj.getAttribute('href');

        // Unknown which tutorial to show
        if (!t.start)
          return null;
        
	      obj.removeAttribute('href');

	      obj.onclick = function () {
	        this.show();
	      }.bind(t);

	      // Injects a tutorial div to the body
	      const div = d.createElement('div');
	      div.setAttribute('id', 'tutorial');
	      div.style.display = 'none';
	      d.getElementsByTagName('body')[0].appendChild(div);

	      t._iframe = null;
	      t._element = div;

	      // Some fields
	      t._ql     = d.getElementById("ql-field");
	      t._q      = d.getElementById("q-field")
	      t._cutoff = d.getElementById("q-cutoff-field");
      };

      return t;
    },


    /**
     * Initialize a search with a defined query.
     */
    useQuery : function (e) {
      const t = this;
      const q  = e.getAttribute("data-query"),
            ql = e.getAttribute("data-query-language"),
            qc = e.getAttribute("data-query-cutoff");

      if (qc !== 0 && qc !== "0" && qc !== "off" && qc !== null) {
        if (t._cuttoff)
	        t._cutoff.checked = true;
      };

      if (KorAP.QLmenu) {
        KorAP.QLmenu.selectValue(ql);
      }

      else if (t._ql) {
        let found = Array.from(t._ql.options).find(o => o.value === ql);
        if (found)
          found.selected = true;
      };

      if (t._q)
        t._q.value = q;

      t.setPage(e);
      t.hide();
    },


    /**
     * Decorate a page with query event handler.
     */
    initQueries : function (d) {
      Array.from(d.querySelectorAll('pre.query.tutorial:not(.unsupported)')).forEach(
        i =>
	        i.onclick = function (e) {
	          this.useQuery(this,e);
	        }.bind(this)
      );
    },

    /**
     * Decorate a page with documentation links
     */
    initDocLinks : function (d) {
      const that = this;
      Array.from(d.getElementsByClassName('doc-link')).forEach(
	      i =>
          i.onclick = function () {
	          that.setPage(this.getAttribute('href'));
	          return true;
	        }
      );
    },


    /**
     * Show the tutorial page embedded.
     */
    show : function () {
      const t = this;
      const element = t._element;
      if (element.style.display === 'block')
	      return;

      if (t._iframe === null) {
	      t._iframe = d.createElement('iframe');
	      t._iframe.setAttribute(
	        'src',
	        (t.getPage() || t.start) + '?embedded=true'
	      );

        const btn = buttonGroupClass.create(
          ['action','button-view']
        );

        btn.add(loc.CLOSE, {'cls':['button-icon','close']}, function () {
          element.style.display = 'none';
        });

        element.appendChild(btn.element());

	      // Add open in new window button
	      // Add scroll to top button
	      /*
	        var info = document.createElement('li');
	        info.appendChild(document.createElement('span'))
	        .appendChild(document.createTextNode(loc.SHOWINFO));
	        info.classList.add('info');
	        info.setAttribute('title', loc.SHOWINFO);

	        ul.appendChild(close);
	        element.appendChild(ul);
        */
	      element.appendChild(t._iframe);
      };

      element.style.display = 'block';
    },


    /**
     * Close tutorial window.
     */
    hide : function () {
      this._element.style.display = 'none';
    },


    /**
     * Set a page to be the current tutorial page.
     * Expects either a string or an element.
     */
    setPage : function (obj) {
      let page = obj;

      if (typeof page != 'string') {
	      const l = this._iframe !== null ? window.frames[0].location : window.location;

	      page = l.pathname + l.search;

	      for (let i = 1; i < 5; i++) {
	        if ((obj.nodeName === 'SECTION' || obj.nodeName === 'PRE') && obj.hasAttribute('id')) {
	          page += '#' + obj.getAttribute('id');
	          break;
	        }
	        else {
	          obj = obj.parentNode;
            if (obj === null)
              break;
	        };
	      };
      };

      this._session.set('tutpage', page);
    },


    /**
     * Get the current tutorial URL
     */
    getPage : function () {
      return this._session.get('tutpage');
    }
  };
});

