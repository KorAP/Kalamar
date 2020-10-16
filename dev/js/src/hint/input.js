// Input field for queries
/*
 * TODO: Support alert for query problems.
 */

"use strict";

define(['util'], function () {

  return {

    /**
     * Create a new input field.
     */
    create : function (element) {
      return Object.create(this)._init(element);
    },


    // Initialize new input field
    _init : function (element) {
      this._element = element;

      this._container = document.createElement("div");
      this._container.setAttribute('id', 'hint');

      // Create mirror for searchField
      // This is important for positioning
      // if ((this._mirror = document.getElementById("searchMirror")) === null) {
      this._mirror = document.createElement("div");
      const m = this._mirror;
      m.classList.add('hint', 'mirror');
      m.addE("span");
      m.appendChild(this._container);
      m.style.height = "0px";
      document.getElementsByTagName("body")[0].appendChild(m);

      // Update position of the mirror
      const re = this.reposition.bind(this);
      window.addEventListener('resize', re);
      this._element.addEventListener('onfocus', re);
      this.reposition();
      return this;
    },


    /**
     * Get the mirrored input field.
     */
    mirror : function () {
      return this._mirror;
    },


    /**
     * Get the container element.
     * This contains the hint helper / menus
     * and probably an
     * error message.
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
     * Get the value of the input field mirror.
     */
    mirrorValue : function () {
      return this._mirror.firstChild.textContent;
    },


    /**
     * Reset the input value
     */
    reset : function () {
      this._element.value = "";
    },


    /**
     * Update the mirror content.
     */
    update : function () {
      this._mirror.firstChild.textContent = this._split()[0];
      this._container.style.left = this._rightPos() + 'px';
      return this;
    },


    /**
     * Insert text into the mirror.
     * This is a prefix of the input field's
     * value.
     */
    insert : function (text) {
      const splittedText = this._split();
      const s = this._element;
      s.value = splittedText[0] + text + splittedText[1];
      s.selectionStart = (splittedText[0] + text).length;
      s.selectionEnd = s.selectionStart;

      // Maybe update?
      this._mirror.firstChild.textContent = splittedText[0] + text;
      return this;
    },


    /**
     * Move hinthelper to given character position
     */
    moveto : function (charpos) {
      const e = this._element;
      e.selectionStart = charpos;
      e.selectionEnd = charpos;
      e.focus();
      return this.update();
    },


    /**
     * Reposition the input mirror directly
     * below the input box.
     */
    reposition : function () {
      const inputClientRect = this._element.getBoundingClientRect();
      const inputStyle = window.getComputedStyle(this._element, null);

      const bodyClientRect = 
            document.getElementsByTagName('body')[0].getBoundingClientRect();

      // Reset position
      const mirrorStyle = this._mirror.style;
      mirrorStyle.left  = parseInt(inputClientRect.left) + "px";
      mirrorStyle.top   = parseInt(inputClientRect.bottom - bodyClientRect.top) + "px";
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


    // Get the right position
    _rightPos : function () {
      const box = this._mirror.firstChild.getBoundingClientRect();
      return box.right - box.left;
    },


    /*
     * Return two substrings,
     * splitted at a given position
     * or at the current cursor position.
     */
    _split : function (start) {
      const s = this._element;
      const value = s.value;

      // Get start from cursor position
      if (arguments.length === 0)
        start = s.selectionStart;

      return new Array(
        value.substring(0, start),
        value.substring(start, value.length)
      );
    }
  }
});
