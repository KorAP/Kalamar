define({

  /**
   * Create new lengthField object.
   */
  create : function () {
    return Object.create(this)._init();
  },

  // Initialize lengthField object
  _init : function () {
    this._element = document.createElement('div');
    this._element.classList.add('lengthField');
    return this;
  },

  /**
   * Add string to lengthField.
   */
  add : function (string) {
    this._element.appendChild(document.createElement('span'))
      .appendChild(document.createTextNode(string + '-'));
  },

  /**
   * Get the associated dom element.
   */
  element : function () {
    return this._element;
  }
});
