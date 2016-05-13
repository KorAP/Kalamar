define({

  /**
   * Create new prefix object.
   */
  create : function () {
    return Object.create(this)._init();
  },

  // Initialize prefix object
  _init : function () {

    this._offset = 0;

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

  _initSize : function () {
    this._height = ((this._limit / this._length) * 100);
    this._step = (100 - this._height) / (this._length - this._limit);
  },

  show : function (i) {
    this._slider.style.height = this._height + '%';
  },

  length : function (i) {
    this._length = i;
    this._initSize();
  },

  limit : function (i) {
    this._limit = i;
    this._initSize();
  },

  offset : function (off) {
    if (off === undefined)
      return this._offset;

    this._offset = off;
    this._slider.style.top = (this._step * off) + '%';
  },

  element : function () {
    return this._element;
  }
});
