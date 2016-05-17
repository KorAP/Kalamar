define({

  /**
   * Create new prefix object.
   */
  create : function () {
    return Object.create(this)._init();
  },

  _mousemove : function (e) {

    var offset = parseInt(
      (
	(e.clientY - this._event.init)
	  / this._rulerHeight
      ) * this._screens
    );

    this.offset(offset);

    e.halt();
    /*
      isTouch?e.touches[0]:e
      ,offset = horizontal?client.clientX - lastClient.clientX:client.clientY - lastClient.clientY
      ,barPos = Math.min(Math.max(orgBarPos + offset,0),dir.viewportSize-dir.barSize)
      ;
      //
      inst.viewport[getScroll(horizontal)] = (barPos/dir.viewportSize)*dir.viewportScrollSize;
    */
  },

  _mouseup : function (e) {
    
    window.removeEventListener('mousemove', this._event.mov);
    window.removeEventListener('mouseup', this._event.up);
  },

  _mousedown : function (e) {
    // Bind drag handler
    var ev = this._event;
    ev.init = e.clientY;
    ev.mov = this._mousemove.bind(this);
    ev.up = this._mouseup.bind(this);

    this._rulerHeight = this._element.clientHeight; // offsetHeight?

    window.addEventListener('mousemove', ev.mov);
    window.addEventListener('mouseup', ev.up);

    e.halt();
  },

  // Initialize prefix object
  _init : function () {

    this._offset = 0;
    this._event = {};

    this._element = document.createElement('div');
    this._element.setAttribute('class', 'ruler');

    this._slider = this._element.appendChild(
      document.createElement('span')
    );

    // TODO: Support touch!
    this._slider.addEventListener('mousedown', this._mousedown.bind(this), false);

    this._element.appendChild(document.createElement('div'));
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
    if (off === undefined)
      return this._offset;

    if (off === this._offset || off > this._screens || off < 0)
      return;

    this._offset = off;
    this._slider.style.top = (this._step * off) + '%';
  },

  element : function () {
    return this._element;
  }
});
