define({

  /**
   * Create new prefix object.
   */
  create : function (menu) {
    return Object.create(this)._init(menu);
  },

  _mousemove : function (e) {
    var relativePos = e.clientY - this._event.init;
    var diffHeight = (this._rulerHeight - this._sliderHeight);
    var relativeOffset = (relativePos / diffHeight);

    var off = this.offset(parseInt(relativeOffset * this._screens));
    if (off !== undefined) {
      this._menu.screen(off);
    };

    e.halt();

    // Support touch!
  },

  _mouseup : function (e) {
    this._element.classList.remove('active');
    window.removeEventListener('mousemove', this._event.mov);
    window.removeEventListener('mouseup', this._event.up);
  },

  _mousedown : function (e) {
    // Bind drag handler
    var ev = this._event;
    ev.init = e.clientY - (this._step * this._offset);
    ev.mov = this._mousemove.bind(this);
    ev.up = this._mouseup.bind(this);

    this._rulerHeight  = this._element.clientHeight; // offsetHeight?
    this._sliderHeight = this._slider.clientHeight;  // offsetHeight?

    this._element.classList.add('active');

    window.addEventListener('mousemove', ev.mov);
    window.addEventListener('mouseup', ev.up);

    e.halt();
  },

  // Initialize prefix object
  _init : function (menu) {

    this._menu = menu;

    this._offset = 0;
    this._event = {};

    this._element = document.createElement('div');
    this._element.setAttribute('class', 'ruler');

    this._slider = this._element.appendChild(
      document.createElement('span')
    );

    this._element.appendChild(document.createElement('div'))
    // Do not mark the menu on mousedown
    .addEventListener('mousedown', function (e) {
      e.halt()
    });

    // TODO: Support touch!
    this._slider.addEventListener('mousedown', this._mousedown.bind(this), false);

    return this;
  },

  _initSize : function () {
    this._height = ((this._limit / this._length) * 100);
    this._screens = this._length - this._limit;
    this._step = (100 - this._height) / this._screens;
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
    if (arguments.length === 0)
      return this._offset;

    if (off === this._offset || off > this._screens || off < 0)
      return undefined;

    this._offset = off;
    this._slider.style.top = (this._step * off) + '%';
    return off;
  },

  element : function () {
    return this._element;
  }
});
