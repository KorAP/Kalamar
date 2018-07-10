define(['util'], function () {
  return {
    /**
     * Create button group
     */
    create : function (classes) {
      return Object.create(this)._init(classes);
    },
    
    // Initialize button group
    _init : function (classes) {
      var e = document.createElement('div');
      var cl = e.classList;
      if (classes !== undefined) {
        cl.add.apply(cl,classes);
      };
      cl.add('button-group');
      this._element = e;
      return this;
    },

    /**
     * Return main element
     */
    element : function () {
      return this._element;
    },

    /**
     * Add button in order
     */
    add : function (title, classes, cb) {
      var b = this._element.addE('span');
      b.setAttribute('title',title);
      if (classes !== undefined) {
        b.classList.add.apply(b.classList, classes);
      };
      b.addE('span').addT(title);

      var that = this;
      b.addEventListener('click', function (e) {

        // Do not bubble
        e.halt();
        
        // Call callback
        cb.apply(that._bind || this, e)
      });
    },

    /**
     * Bind an object to all callbacks of the button group
     */
    bind : function (obj) {
      if (obj !== undefined) {
        this._bind = obj;
      };
      return this._bind || this;
    }
  }
});
