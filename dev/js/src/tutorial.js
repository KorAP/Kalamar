/**
 * Open and close a tutorial page.
 * The current page is stored and retrieved in a session cookie.
 */
// TODO: Add query mechanism!
// TODO: Highlight current section:
//       http://stackoverflow.com/questions/24887258/highlight-navigation-link-as-i-scroll-down-the-page
define(['session', 'util'], function (sessionClass) {
  "use strict";

  // Localization values
  var loc   = KorAP.Locale;
  loc.CLOSE = loc.CLOSE || 'Close';

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

      if (session === undefined) {
	this._session = sessionClass.create();
      }
      else {
	this._session = session;
      };
    

      if (obj) {
	this._show = obj;
	this.start = obj.getAttribute('href');
	obj.removeAttribute('href');
	var that = this;
	obj.onclick = function () {
	  that.show();
	};

	// Injects a tutorial div to the body
	var div = document.createElement('div');
	div.setAttribute('id', 'tutorial');
	div.style.display = 'none';
	document.getElementsByTagName('body')[0].appendChild(div);
	this._iframe = null;
	this._element = div;

	// Some fields
	this._ql     = document.getElementById("ql-field");
	this._q      = document.getElementById("q-field")
	this._cutoff = document.getElementById("q-cutoff-field");
      };

      return this;
    },


    /**
     * Initialize a search with a defined query.
     */
    useQuery : function (e) {
      var q  = e.getAttribute("data-query");
      var ql = e.getAttribute("data-query-language");
      var qc = e.getAttribute("data-query-cutoff");
      if (qc !== 0 && qc !== "0" && qc !== "off" && qc !== null) {
	this._cutoff.checked = true;
      };

      var qlf = this._ql.options;
      for (var i in qlf) {
	if (qlf[i].value == ql) {
	  qlf[i].selected = true;
	};
      };

      this._q.value = q;
      this.setPage(e);
      this.hide();
    },

    /**
     * Decorate a page with query event handler.
     */
    initQueries : function (d) {
      var qs = d.querySelectorAll('pre.query.tutorial');
      var that = this;
      for (var i = 0; i < qs.length; i++) {
	qs[i].onclick = function (e) {
	  that.useQuery(this,e);
	};
      };
    },

    /**
     * Decorate a page with documentation links
     */
    initDocLinks : function (d) {
      var dl = d.getElementsByClassName('doc-link');
      var that = this;
      for (var i = 0; i < dl.length; i++) {
	dl[i].onclick = function (e) {
	  that.setPage(this.getAttribute('href'));
	  return true;
	};
      };      
    },


    /**
     * Show the tutorial page embedded.
     */
    show : function () {
      var element = this._element;
      if (element.style.display === 'block')
	return;

      if (this._iframe === null) {
	this._iframe = document.createElement('iframe');
	this._iframe.setAttribute(
	  'src',
	  (this.getPage() || this.start) + '?embedded=true'
	);

	var ul = document.createElement('ul');
	ul.classList.add('action', 'right');

	// Add close button
	var close = document.createElement('li');
	close.appendChild(document.createElement('span'))
	  .appendChild(document.createTextNode(loc.CLOSE));
	close.classList.add('close');
	close.setAttribute('title', loc.CLOSE);
	close.onclick = function () {
	  element.style.display = 'none';
	};

	// Add open in new window button
	// Add scroll to top button
	/*
	  var info = document.createElement('li');
	  info.appendChild(document.createElement('span'))
	  .appendChild(document.createTextNode(loc.SHOWINFO));
	  info.classList.add('info');
	  info.setAttribute('title', loc.SHOWINFO);
	*/
	
	ul.appendChild(close);

	element.appendChild(ul);
	element.appendChild(this._iframe);
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
      var page = obj;
      if (typeof page != 'string') {
	var l = this._iframe !== null ? window.frames[0].location : window.location;
	page = l.pathname + l.search;

	for (var i = 1; i < 5; i++) {
	  if (obj.nodeName === 'SECTION') {
	    if (obj.hasAttribute('id'))
	      page += '#' + obj.getAttribute('id');
	    break;
	  }
	  else if (obj.nodeName === 'PRE' && obj.hasAttribute('id')) {
	    page += '#' + obj.getAttribute('id');
	    break;
	  }
	  else {
	    obj = obj.parentNode;
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

