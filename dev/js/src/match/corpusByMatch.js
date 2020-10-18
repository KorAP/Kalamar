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
      const t = this;

      // Meta is an element <dl />
      if (meta === undefined) {
        throw new Error('Missing parameters');
      }
      else if (!(meta instanceof Node)) {
        throw new Error("Requires element");
      };

      // Collect the meta constraints
      t._vc = {};

      // Remember the meta table
      t._meta = meta;

      // CorpusByMatch can be disabled per configuration.
      // This is necessary, as the feature won't work with
      // indices created before Krill V0.57.
      // This is an undocumented feature and will be
      // removed in future versions.
      // This will also require a change in matchinfo.scss
      if (KorAP.Conf && KorAP.Conf["CorpusByMatchDisabled"]) {
        t._meta.classList.add("cbm-disabled");
        return t;
      };

      t._meta.addEventListener(
        "click", t.clickOnMeta.bind(t), false
      );

      t._fragment = vcFragmentClass.create();      

      t._fragment.element().addEventListener(
        "click", t.toVcBuilder.bind(t), true
      );

      return t;
    },


    /**
     * Join fragment with VC
     */
    toVcBuilder : function (e) {
      if (e)
        e.stopPropagation();

      if (this._fragment.isEmpty())
        return;

      const vc = KorAP.vc;
      if (!vc) {
        console.log("Global VC not established");
        return;
      };

      for (const doc of this._fragment.documents()) {
        vc.addRequired(doc);
      };

      if (!vc.isOpen())
        vc.open();

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
      const target = e.target;

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
      if (type === "type:store" || type === "type:attachement")
        return;

      type = type || "type:string";

      // Add or remove the constraint to the fragment
      if (key && value) {
        const t = this;
        if (target.classList.contains("chosen")) {
          target.classList.remove("chosen");
          t.remove(key, value);
        }
        else {
          target.classList.add("chosen");
          t.add(key, value, type);
        };

        // Check if the fragment is empty
        // If empty - hide!
        if (!t._fragment.isEmpty()) {
          t._meta.parentNode.insertBefore(
            t._fragment.element(),
            t._meta.nextSibling
          );
        }

        // Otherwise show!
        else {
          t._meta.parentNode.removeChild(
            t._fragment.element()
          );
        };
      }
    },

    /**
     * Add constraint to fragment
     */
    add : function (key, value, type) {
      type = type.replace(/^type:/, '');
      this._fragment.add(key, value, type);
    },


    /**
     * Remove constraint from fragment
     */
    remove : function (key, value) {
      this._fragment.remove(key, value);
    },
    
    /**
     * Stringify fragment
     */
    toQuery : function () {
      return this._fragment.toQuery();
    }
  };
});
