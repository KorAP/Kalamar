define({

  /**
   * Create new slider object.
   * The slider will only be used by mouse - touch support
   * shouldn't be necessary.
   */
  create : function (menu) {
    return Object.create(this)._init(menu);
  },

  length : function (i) {
    if (arguments.length === 0)
      return this._length;
    if (i == this._length)
      return;
    this._length = i;
    this._initSize();
  },

  limit : function (i) {
    if (arguments.length === 0)
      return this._limit;
    if (i == this._limit)
      return;
    this._limit = i;
    this._initSize();
  },

  active : function (bool) {
    if (arguments.length === 1) {
      if (bool) {
	if (!this._active) {
	  this._element.classList.add('active');
	  this._active = true;
	};
      }
      else if (this._active) {
	this._element.classList.remove('active');
	this._active = false;
      }
    };
    return this._active;
  },

  movetoRel : function (relativePos) {
    var diffHeight = (this._rulerHeight - this._sliderHeight);
    var relativeOffset = (relativePos / diffHeight);

    var off = this.offset(parseInt(relativeOffset * this._screens));
    if (off !== undefined) {
      this._menu.screen(off);
    };
  },

  movetoAbs : function (absPos) {
    var absOffset = (absPos / this._rulerHeight);

    var off = this.offset(parseInt(absOffset * (this._screens + 1)));
    if (off !== undefined) {
      this._menu.screen(off);
    };
  },

  offset : function (off) {
    if (arguments.length === 0)
      return this._offset;

    if (off > this._screens) {
      off = this._screens;
    }
    else if (off < 0) {
      off = 0;
    };

    if (off === this._offset)
      return undefined;

    this._offset = off;
    this._slider.style.top = (this._step * off) + '%';

    return off;
  },

  element : function () {
    return this._element;
  },

  // Initialize prefix object
  _init : function (menu) {

    this._menu = menu;

    this._offset = 0;
    this._event = {};
    this._active = false;

    this._element = document.createElement('div');
    this._element.setAttribute('class', 'ruler');

    this._slider = this._element.appendChild(
      document.createElement('span')
    );

    this._ruler = this._element.appendChild(document.createElement('div'));

    // Do not mark the menu on mousedown
    this._ruler.addEventListener('mousedown', function (e) {
      e.halt()
    }, false);

    // Move the slider to the click position
    this._ruler.addEventListener('click', this._mouseclick.bind(this), false);

    this._slider.addEventListener('mousedown', this._mousedown.bind(this), false);

    return this;
  },

  _initSize : function () {
    if (this._length <= this._limit) {
      this._element.style.display = 'none';
      return;
    }
    else {
      this._element.style.display = 'block';
    };

    this._height = ((this._limit / this._length) * 100);
    this._screens = this._length - this._limit;
    this._step = (100 - this._height) / this._screens;
    this._slider.style.height = this._height + '%';
  },

  _initClientHeight : function () {
    this._rulerHeight  = this._element.clientHeight; // offsetHeight?
    this._sliderHeight = this._slider.clientHeight;  // offsetHeight?
  },

  _mousemove : function (e) {
    this.movetoRel(e.clientY - this._event.init);
    e.halt();
    // Support touch!
  },

  _mouseup : function (e) {
    this.active(false);
    window.removeEventListener('mousemove', this._event.mov);
    window.removeEventListener('mouseup', this._event.up);
    this._menu.focus();
  },

  _mousedown : function (e) {
    // Bind drag handler
    var ev = this._event;
    ev.init = e.clientY - (this._step * this._offset);
    ev.mov = this._mousemove.bind(this);
    ev.up = this._mouseup.bind(this);

    // TODO: This may not be necessary all the time
    this._initClientHeight();

    this.active(true);

    window.addEventListener('mousemove', ev.mov);
    window.addEventListener('mouseup', ev.up);

    e.halt();
  },

  _mouseclick : function (e) {
    this._initClientHeight();

    this.movetoAbs(
      e.clientY - this._ruler.getClientRects()[0].top
    );
    e.halt();
  }
});
