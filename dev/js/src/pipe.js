/**
 * Create a pipe object, that holds a list of services
 * meant to transform the KQ passed before it's finally
 * passed to the search engine.
 *
 * @author Nils Diewald
 */
"use strict";
define(function () {
  const notNullRe = new RegExp("[a-zA-Z0-9]");

  // Trim and check
  function _notNull (service) {
    service = service.trim();
    if (service.match(notNullRe)) {
      return service;
    };
    return null;
  };
  
  return {

    /**
     * Constructor
     */
    create : function () {
      const obj = Object.create(this);
      obj._pipe = [];
      return obj;
    },

    
    /**
     * Append service to pipe.
     */
    append : function (service) {
      service = _notNull(service);
      if (service) {
        this._pipe.push(service);
        this._update();
      };
    },

    
    /**
     * Prepend service to pipe.
     */
    prepend : function (service) {
      service = _notNull(service);
      if (service) {
        this._pipe.unshift(service);
        this._update();
      };
    },


    /**
     * Remove service from the pipe.
     */
    remove : function (service) {
      const i = this._pipe.indexOf(service);
      if (i != -1) {
        this._pipe.splice(i, 1);
        this._update();
      };
    },


    /**
     * The number of services in the pipe.
     */
    size : function () {
      return this._pipe.length;
    },


    /**
     * Return the pipe as a string.
     */
    toString : function () {
      return this._pipe.join(',');
    },


    /**
     * Update the pipe value.
     */
    _update : function () {
      if (this.e != null) {
        this.e.setAttribute("value", this.toString());
      };
    },
    

    /**
     * Return the pipe element.
     */
    element : function () {
      let e = this.e;
      if (e == null) {
        e = this.e = document.createElement('input');
        e.setAttribute("type","text");
        e.setAttribute("name","pipe");
        e.classList.add("pipe");
      };
      return e;
    }
  };
});
