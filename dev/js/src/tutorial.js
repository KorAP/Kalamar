/**
 * Open and close a tutorial page.
 * The current page is stored and retrieved in a session cookie.
 */
// Todo: add query mechanism!

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
    create : function (obj) {
      if (!obj)
	return null;
      return Object.create(this)._init(obj);
    },

    // Initialize Tutorial object
    _init : function (obj) {

      this._session = sessionClass.create();
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
      return this;
    },

    show : function () {
      var element = this._element;
      if (element.style.display === 'block')
	return;

      if (this._iframe === null) {
	this._iframe = document.createElement('iframe');
	this._iframe.setAttribute('src', this.getPage() || this.start);

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
      this._element.display.style = 'none';
    },

    /**
     * Set a page to be the current tutorial page.
     * Expects either a string or an element.
     */
    setPage : function (obj) {
      var page = obj;
      if (typeof page != 'string') {
	page = window.location.pathname + window.location.search;
	for (i = 1; i < 5; i++) {
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
      this._session.get('tutpage');
    },
  };
});
