/**
 * Create a pipe object, that holds a list of services
 * meant to transform the KQ passed before it's finally
 * passed to the search engine or to transform the response
 * afterwards.
 *
 * @author Nils Diewald
 */
const notNullRe = new RegExp("[a-zA-Z0-9]");

  // Trim and check
  function _notNull (service) {
    service = service.trim();
    if (service.match(notNullRe)) {
      return service;
    };
    return null;
  };
  
export default class Pipe {

    /**
     * Constructor
     */
 
    constructor(name='pipe') {
      this._name = name;
      this._pipe = [];
    }
    
    /**
     * Append service to pipe.
     */
    append (service) {
      service = _notNull(service);
      if (service && this._pipe.indexOf(service) === -1) {
        this._pipe.push(service);
        this._update();
      };
    }

    
    /**
     * Prepend service to pipe.
     */
    prepend (service) {
      service = _notNull(service);
      if (service && this._pipe.indexOf(service) === -1) {
        this._pipe.unshift(service);
        this._update();
      };
    }


    /**
     * Remove service from the pipe.
     */
    remove (service) {
      const i = this._pipe.indexOf(service);
      if (i != -1) {
        this._pipe.splice(i, 1);
        this._update();
      };
    }


    /**
     * The number of services in the pipe.
     */
    size () {
      return this._pipe.length;
    }


    /**
     * Return the pipe as a string.
     */
    toString () {
      return this._pipe.join(',');
    }

    /**
     * Return the pipe as a an URI compliant string.
     */
    toUriString () {
      return encodeURIComponent(this.toString());
    }


    /**
     * Update the pipe value.
     */
    _update () {
      if (this.e != null) {
        this.e.setAttribute("value", this.toString());
      };
    }
    

    /**
     * Return the pipe element.
     */
    element () {
      let e = this.e;
      if (e == null) {
        e = this.e = document.createElement('input');
        e.setAttribute("type","text");
        e.setAttribute("name",this._name);
        e.classList.add("pipe");
      };
      return e;
    }
  }
