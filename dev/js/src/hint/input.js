// Input field for queries
define({

  /**
   * Create a new input field.
   */
  create : function (element) {
    return Object.create(this)._init(element);
  },
  
  // Initialize new input field
  _init : function (element) {
    this._element = element;

    // Create mirror for searchField
    if ((this._mirror = document.getElementById("searchMirror")) === null) {
      this._mirror = document.createElement("div");
      this._mirror.setAttribute("id", "searchMirror");
      this._mirror.appendChild(document.createElement("span"));
      this._container = this._mirror.appendChild(document.createElement("div"));
      this._mirror.style.height = "0px";
      document.getElementsByTagName("body")[0].appendChild(this._mirror);
    };

    // Update position of the mirror
    var that = this;
    var repos = function () {
      that.reposition();
    };
    window.addEventListener('resize', repos);
    this._element.addEventListener('onfocus', repos);
    that.reposition();

    return this;
  },

  // Get the right position
  _rightPos : function () {
    var box = this._mirror.firstChild.getBoundingClientRect();
    return box.right - box.left;
  },

  /**
   * Get the mirrored input field.
   */
  mirror : function () {
    return this._mirror;
  },


  /**
   * Get the container element.
   * This contains the mirror and
   * the hint helper.
   */
  container : function () {
    return this._container;
  },


  /**
   * Get the input element the
   * hint helper is attached to.
   */
  element : function () {
    return this._element;
  },

  /**
   * Get the value of the input field
   * the hint helper is attached to.
   */
  value : function () {
    return this._element.value;
  },


  /**
   * Update the mirror content.
   */
  update : function () {
    this._mirror.firstChild.textContent = this._split()[0];
    this._container.style.left = this._rightPos() + 'px';
  },

  /**
   * Insert text into the mirror.
   * This is a prefix of the input field's
   * value.
   */
  insert : function (text) {
    var splittedText = this._split();
    var s = this._element;
    s.value = splittedText[0] + text + splittedText[1];
    s.selectionStart = (splittedText[0] + text).length;
    s.selectionEnd = s.selectionStart;
    this._mirror.firstChild.textContent = splittedText[0] + text;
  },
  

  /**
   * Reposition the input mirror directly
   * below the input box.
   */
  reposition : function () {
    var inputClientRect = this._element.getBoundingClientRect();
    var inputStyle = window.getComputedStyle(this._element, null);

    var bodyClientRect = 
      document.getElementsByTagName('body')[0].getBoundingClientRect();

    // Reset position
    var mirrorStyle = this._mirror.style;
    mirrorStyle.left = inputClientRect.left + "px";
    mirrorStyle.top  = (inputClientRect.bottom - bodyClientRect.top) + "px";
    mirrorStyle.width = inputStyle.getPropertyValue("width");
    
    // These may be relevant in case of media depending css
    mirrorStyle.paddingLeft     = inputStyle.getPropertyValue("padding-left");
    mirrorStyle.marginLeft      = inputStyle.getPropertyValue("margin-left");
    mirrorStyle.borderLeftWidth = inputStyle.getPropertyValue("border-left-width");
    mirrorStyle.borderLeftStyle = inputStyle.getPropertyValue("border-left-style");
    mirrorStyle.fontSize        = inputStyle.getPropertyValue("font-size");
    mirrorStyle.fontFamily      = inputStyle.getPropertyValue("font-family");
  },

  /**
   * Get the context, which is the input
   * field's value bounded to the
   * cursor position.
   */
  context : function () {
    return this._split()[0];
  },

  /*
   * Return two substrings,
   * splitted at the current cursor position.
   */
  _split : function () {
    var s = this._element;
    var value = s.value;
    var start = s.selectionStart;
    return new Array(
      value.substring(0, start),
      value.substring(start, value.length)
    );
  }
});
