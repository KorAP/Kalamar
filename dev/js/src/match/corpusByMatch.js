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

      // CorpusByMatch can be disabled per configuration.
      // This is necessary, as the feature won't work with
      // indices created before Krill V0.57.
      // This is an undocumented feature and will be
      // removed in future versions.
      // This will also require a change in matchinfo.scss
      if (KorAP.Conf && KorAP.Conf["CorpusByMatchDisabled"]) {
        this._meta.classList.add("cbm-disabled");
        return this;
      };

      this._meta.addEventListener(
        "click", this.clickOnMeta.bind(this), false
      );

      this._fragment = vcFragmentClass.create();      

      this._fragment.element().addEventListener(
        "click", this.toVcBuilder.bind(this), true
      );

      return this;
    },

    /**
     * Join fragment with VC
     */
    toVcBuilder : function (e) {
      if (e)
        e.stopPropagation();

      if (this._fragment.isEmpty())
        return;

      let vc = KorAP.vc;
      if (!vc) {
        console.log("Global VC not established");
        return;
      };

      for (let doc of this._fragment.documents()) {
        vc.addRequired(doc);
        console.log("Add " + doc.toQuery());
      };

      if (!vc.isOpen()) {
        vc.open();
      };

      // Scroll to top
      window.scrollTo(0, 0);
    },

    // Event handler for meta constraint creation
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
        key  = target.previousElementSibling.innerText;
        value = target.innerText;
      }

      // Meta information is in a list
      else if (target.tagName === 'DIV') {
        type = target.parentNode.getAttribute("data-type");
        key = target.parentNode.previousElementSibling.innerText;
        value = target.innerText;
      };

      // Ignore stored types
      if (type === "type:store")
        return;

      type = type || "type:string";

      // Add or remove the constraint to the fragment
      if (key && value) {
        if (target.classList.contains("chosen")) {
          target.classList.remove("chosen");
          this.remove(key, value);
        }
        else {
          target.classList.add("chosen");
          this.add(key, value, type);
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

    // Add constraint
    add : function (key, value, type) {
      type = type.replace(/^type:/, '');
      this._fragment.add(key, value, type);
    },

    // Remove constraint
    remove : function (key, value) {
      this._fragment.remove(key, value);
    },
    
    // Stringify annotation
    toQuery : function () {
      return this._fragment.toQuery();
    }
  };
});
