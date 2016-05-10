define({

  /**
   * Create new prefix object.
   */
  create : function () {
    return Object.create(this)._init();
  },

  // Initialize prefix object
  _init : function () {

    this._element = document.createElement('div');
    this._element.setAttribute('class', 'ruler');

    this._slider = this._element.appendChild(
      document.createElement('span')
    );

    this._element.appendChild(document.createElement('div'));

/*
    this._string = '';

    // Add prefix span
    this._element = document.createElement('span');
    this._element.classList.add('pref');
    // Connect action

    if (this["onclick"] !== undefined)
      this._element["onclick"] = this.onclick.bind(this);

*/    
    return this;
  },

  show : function (i) {
    this._slider.style.height = ((this._limit / this._length) * 100) + '%';
  },

  length : function (i) {
    this._length = i;
  },

  limit : function (i) {
    this._limit = i;
  },

  element : function () {
    return this._element;
  }
});
