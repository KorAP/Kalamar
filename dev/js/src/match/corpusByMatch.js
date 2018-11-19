define(['vc/fragment', 'util'], function (vcFragmentClass) {
  "use strict";
  
  return {
    /**
     * Constructor
     */
    create : function (meta) {
      return Object.create(this)._init(meta);
    },

    // Initialize corpusByMatch
    _init : function (meta) {

      // Meta is an element <dl />
      if (meta === undefined) {
        throw new Error('Missing parameters');
      }
      else if (!(meta instanceof Node)) {
        throw new Error("Requires element");
      };

      // Collect the meta constraints
      this._vc = {};

      // Remember the meta table
      this._meta = meta;

      this._meta.addEventListener(
        "click", this.clickOnMeta.bind(this), false
      );

      this._fragment = vcFragmentClass.create();

      return this;
    },

    clickOnMeta : function (e) {
      e.stopPropagation();
      if (e.target === e.currentTarget) {
        return;
      };

      // Get event target
      let target = e.target;

      let key, value, type;

      // Meta information is a single value
      if (target.tagName === 'DD') {
        type = target.getAttribute("data-type");
        key  = target.previousSibling.innerText;
        value = target.innerText;
      }

      // Meta information is in a list
      else if (target.tagName === 'DIV') {
        type = target.parentNode.getAttribute("data-type");
        key = target.parentNode.previousSibling.innerText;
        value = target.innerText;
      };

      // Ignore stored types
      if (type === "type:store")
        return;

      // Add or remove the constraint to the fragment
      if (key && value) {
        if (target.classList.contains("chosen")) {
          target.classList.remove("chosen");
          this._fragment.remove(key, value);
        }
        else {
          target.classList.add("chosen");
          this._fragment.add(key, value);
        };

        // Check if the fragment is empty
        // If empty - hide!
        if (!this._fragment.isEmpty()) {
          this._meta.parentNode.insertBefore(
            this._fragment.element(),
            this._meta.nextSibling
          );
        }

        // Otherwise show!
        else {
          this._meta.parentNode.removeChild(
            this._fragment.element()
          );
        };
      }
    },

    // Stringify annotation
    toString : function () {
      return '';
    }
  };
});
