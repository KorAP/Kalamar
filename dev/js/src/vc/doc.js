/**
 * A new document criterion
 */
"use strict";

define([
  'vc/jsonld',
  'vc/rewritelist',
  'vc/stringval',
  'vc/docgroupref',
  'util'
], function (jsonldClass, rewriteListClass, stringValClass, docGroupRefClass) {

  /*
   * TODO:
   *   Improve error handling by using window.onerror() to
   *   capture thrown errors and log them.
   */

  const errstr802 = "Match type is not supported by value type";
  const errstr804 = "Unknown value type";
  const loc = KorAP.Locale;
  loc.EMPTY = loc.EMPTY || '⋯';

  return {

    // The JSON-LD type
    _ldType : "doc",

    // The object ... maybe not important
    _obj : function () { return '???'; /*KorAP.Doc*/ },
    

    /**
     * Create a new document criterion
     * by passing the parent object and a json construct.
     */
    create : function (parent, json) {

      // Create the object, inheriting from Json-LD class
      const obj = Object(jsonldClass).
            create().
            upgradeTo(this).
            fromJson(json);

      if (obj === undefined) {
        console.log(json);
        return;
      };

      // Bind the parent
      if (parent !== undefined)
        obj._parent = parent;
      
      obj.__changed = true;
      return obj;
    },


    /**
     * Update the elements content.
     */
    update : function () {
      const t = this;

      if (t._element === undefined)
        return t.element();
      
      // Get element
      const e = t._element;

      // Check if there is a change in the underlying data
      if (!t.__changed)
        return e;

      // Set ref - TODO: Cleanup!
      e.refTo = t;


      // Was rewritten
      if (t.rewrites() !== undefined) {
        e.classList.add("rewritten");
      };

      // Added key
      const keyE = t._keyE = document.createElement('span');
      keyE.setAttribute('class', 'key');

      // Change key
      keyE.addEventListener('click', t._changeKey.bind(t));

      if (t.key()) {
        const k = t.key();
        if (loc['VC_' + k] !== undefined)
          k = loc['VC_' + k];
        keyE.addT(k);
      };

      // Added match operator
      const matchopE = t._matchopE = document.createElement('span');
      matchopE.setAttribute('data-type', t.type());
      matchopE.setAttribute('class', 'match');
      matchopE.addT(t.matchop());

      // Change matchop
      t._matchopE.addEventListener(
        'click',
        t._changeMatchop.bind(t)
      );

      // Added value operator
      const valueE = t._valueE = document.createElement('span');
      valueE.setAttribute('data-type', t.type());
      valueE.setAttribute('class', 'value');

      if (t.value()) {
        valueE.addT(t.value());
      }
      else {
        valueE.addT(loc.EMPTY);
        valueE.classList.add('unspecified');
      };

      // Change value
      valueE.addEventListener(
        'click',
        t._changeValue.bind(t)
      );

      // Remove all element children
      _removeChildren(e);

      // Add spans
      e.appendChild(keyE);
      e.appendChild(matchopE);
      e.appendChild(valueE);

      t.__changed = false;

      if (t._rewrites !== undefined) {
        e.appendChild(t._rewrites.element());
      };

      if (t._parent !== undefined) {
        
        // Set operators
        // Append new operators
        e.appendChild(t.operators(
          true,
          true,
          true
        ).element());
      };
      
      if (KorAP.vc){
        KorAP.vc.element().dispatchEvent(
          new CustomEvent('vcChange', {'detail' : t})
        );
      }
      
      return e;
    },


    /**
     * Get the associated element
     */
    element : function () {
      const t = this;
      if (t._element !== undefined)
        return t._element;

      t._element = document.createElement('div');
      t._element.setAttribute('class', 'doc');
      t.update();
      return t._element;
    },


    /**
     * Wrap a new operation around the doc element
     */
    wrap : function (op) {
      const parent = this.parent();
      const group = require('vc/docgroup').create(parent);
      group.operation(op);
      group.append(this);
      group.append();
      return parent.replaceOperand(this, group).update();
    },


    replaceWith : function (op) {
      const p = this.parent();

      if (p.ldType() === 'docGroup') {
        p.replaceOperand(this, op);
      }
      else if (p.ldType() == null) {
        p.root(op);
      };

      p.update();

      this.destroy();
    },
    

    /**
     * Deserialize from json
     */
    fromJson : function (json) {
      const t = this;
      if (json === undefined)
        return t;

      if (json["@type"] === undefined) {
        KorAP.log(701, "JSON-LD group has no @type attribute");
        return;
      };

      if (json["value"] === undefined ||
          typeof json["value"] != 'string') {
        KorAP.log(805, "Value is invalid");
        return;
      };

      let rewrite;

      // There is a defined key
      if (json["key"] !== undefined &&
          typeof json["key"] === 'string') {

        // Set key
        t.key(json["key"]);

        // Set match operation
        if (json["match"] !== undefined) {
          if (typeof json["match"] === 'string') {
            t.matchop(json["match"]);
          }
          else {
            KorAP.log(802, errstr802);
            return;
          };
        };
        
        // Type is unspecified - but may be known by the menu
        if (json["type"] === undefined && KorAP._vcKeyMenu) {

          // Check the VC list if the field is known
          const type = KorAP._vcKeyMenu.typeOf(t.key());
          if (type != undefined) {
            json["type"] = "type:" + type;
          };
        };

        // Type is still undefined
        if (json["type"] === undefined) {
        
          // Check match type
          if (!KorAP._validUnspecMatchRE.test(t.matchop())) {
            KorAP.log(802, errstr802);

            // Rewrite method
            t.matchop('eq');
            rewrite = 'modification';
          };

          // Set string value
          t.value(json["value"]);
        }

        // Field is string type
        else if (json["type"] == "type:string") {
          t.type("string");

          // Check match type
          if (!KorAP._validStringMatchRE.test(t.matchop())) {
            KorAP.log(802, errstr802);

            // Rewrite method
            t.matchop('eq');
            rewrite = 'modification';
          };
          
          // Set string value
          t.value(json["value"]);
        }

        // Field is specified
        else if (json["type"] == "type:text") {
          t.type("text");

          // Check match type
          if (!KorAP._validTextMatchRE.test(t.matchop())) {
            KorAP.log(802, errstr802);

            // Rewrite method
            t.matchop('eq');
            rewrite = 'modification';
          };

          // Set string value
          t.value(json["value"]);
        }

        // Key is a date
        else if (json["type"] === "type:date") {
          t.type("date");

          if (json["value"] !== undefined &&
              KorAP._validDateRE.test(json["value"])) {

            if (!KorAP._validDateMatchRE.test(t.matchop())) {
              KorAP.log(802, errstr802);

              // Rewrite method
              t.matchop('eq');
              rewrite = 'modification';
            };

            // Set value
            t.value(json["value"]);
          }
          else {
            KorAP.log(806, "Value is not a valid date string");
            return;
          };
        }

        // Key is a regular expression
        else if (json["type"] === "type:regex") {
          t.type("regex");

          try {

            // Try to create a regular expression
            let check = new RegExp(json["value"]);

            if (!KorAP._validStringMatchRE.test(t.matchop())) {
              KorAP.log(802, errstr802);

              // Rewrite method
              t.matchop('eq');
              rewrite = 'modification';
            };

            t.value(json["value"]);
          }

          catch (e) {
            KorAP.log(807, "Value is not a valid regular expression");
            return;
          };
          t.type("regex");
        }

        else {
          KorAP.log(804, errstr804 + ": " + t.type());
          throw new Error(errstr804 + ": " + t.type());
        };
      };

      // Rewrite coming from the server
      if (json["rewrites"] !== undefined) {
        t.rewrite(json["rewrites"]);
      }

      // Rewrite coming from Kalamar
      else if (rewrite !== undefined) {
        t.rewrite(rewrite);
      };

      return t;
    },


    /**
     * Get or set the key
     */
    key : function (value) {
      if (arguments.length === 1) {
        this._key = value;
        this._changed();
        return this;
      };
      return this._key;
    },


    // Click on the key, show me the menu
    _changeKey : function (e) {
      const menu = KorAP._vcKeyMenu;

      // Insert menu
      this._element.insertBefore(
        menu.element(),
        this._keyE
      );

      // Release event
      const that = this;
      menu.released(function (key, type) {

        if (type === 'ref') {
          // KorAP._delete.bind(that);
          that.replaceWith(
            docGroupRefClass.create(that.parent())
          );
        }

        else {
          const doc = that.key(key).type(type);

          // This may not be compatible - then switch to default
          doc.matchop(doc.matchop());
          doc.value(doc.value());

          // Update the doc
          doc.update();
        };

        // hide!
        this.hide();
      });

      // TODO: Highlight the old value!
      menu.show();
      menu.focus();
    },


    /**
     * Get or set the match operator
     */
    matchop : function (match) {
      const t = this;

      if (arguments.length === 1) {
        const m = match.replace(/^match:/, '');

        if (
          (t._type == undefined) // && KorAP._validUnspecMatchRE.test(m))
            ||
            (
              (t._type === 'string' || t._type === 'regex') &&
                KorAP._validStringMatchRE.test(m)
            )
            ||
            (t._type === 'text' && KorAP._validTextMatchRE.test(m))
            ||
            (t._type === 'date' && KorAP._validDateMatchRE.test(m))
        ) {
          t._matchop = m;
        }
        else {
          t._matchop = "eq";
        };

        t._changed();
        return t;
      };

      return t._matchop || "eq";
    },


    // Click on the match operator, show me the menu
    _changeMatchop : function (e) {
      const menu = KorAP._vcMatchopMenu[this.type()];

      if (menu === undefined) {
        KorAP.log(0, "Unable to init menu for " + this.type());
        return;
      };

      // Insert menu
      this._element.insertBefore(
        menu.element(),
        this._matchopE
      );

      // Release event
      const that = this;
      menu.released(function (mo) {
        that.matchop(mo).update();
        this.hide();
      });

      menu.show();
      menu.focus();
    },


    /**
     * Get or set the type
     */
    type : function (type) {
      if (arguments.length === 1) {
        this._type = type;
        this._changed();
        return this;
      };
      return this._type || "string";
    },


    /**
     * Get or set the value
     */
    value : function (value) {
      const t = this;
      if (arguments.length === 1) {
        if (t._type === 'date' && !KorAP._validDateRE.test(value)) {
          delete t._value;
        }
        else {
          t._value = value;
        };
        t._changed();
        return t;
      };
      return t._value;
    },


    // Click on the match operator, show me the menu
    _changeValue : function (e) {
      const that = this;
     
      // Show datepicker
      if (this.type() === 'date') {
        const dp = KorAP._vcDatePicker;
        dp.fromString(this.value());

        // Todo: change this
        dp.onclick(function (selected) {

          // There are values selected
          if (selected['year']) {
            that.value(this.toString());
            that.update();
            return;
          };

          // Remove datepicker
          that._element.removeChild(
            dp.element()
          );
        });

        this._element.insertBefore(
          dp.show(), // Get element of the date picker
          this._valueE
        );

        dp.input().focus();
      }

      else {
        const regex = this.type() === 'regex' ? true : false;
        const str = stringValClass.create(this.value(), regex);
        const strElem = str.element();

        str.store = function (value, regex) {
          that.value(value);
          if (regex === true)
            that.type('regex');
          else
            that.type('string');
          
          that._element.removeChild(
            this._element
          );
          that.update();
        };

        // Insert element
        this._element.insertBefore(
          strElem,
          this._valueE
        );

        str.focus();
      };
    },


    rewrites : function () {
      return this._rewrites;
    },


    rewrite : function (value) {
      if (typeof value === 'string') {
        value = [{
          "@type" : "koral:rewrite",
          "operation" : "operation:" + value,
          "src" : "Kalamar"
        }];
      };
      this._rewrites = rewriteListClass.create(value);
    },


    // Mark the underlying data as being changed.
    // This is important for rerendering the dom.
    // This will also remove rewrite markers, when the data
    // change happened by the user
    _changed : function () {
      this.__changed = true;

      if (this._rewrites === undefined)
        return;

      delete this["_rewrites"];
      
      if (this._element === undefined)
        return;

      this._element.classList.remove("rewritten");
    },


    toJson : function () {
      const t = this;

      if (!t.matchop() || !t.key())
        return {};
      
      return {
        "@type" : "koral:" + t.ldType(),
        "key"   : t.key(),
        "match" : "match:" + t.matchop(),
        "value" : t.value() || '',
        "type"  : "type:" + t.type()
      };
    },


    incomplete : function () {
      return !(this.matchop() && this.key() && this.value());
    },


    toQuery : function () {
      if (this.incomplete())
        return "";

      // Build doc string based on key
      let string = this.key() + ' ';

      // Add match operator
      switch (this.matchop()) {
      case "ne":
        string += '!=';
        break;
      case "contains":
        string += '~';
        break;
      case "excludes":
        string += '!~';
        break;
      case "containsnot":
        string += '!~';
        break;
      case "geq":
        string += 'since';
        break;
      case "leq":
        string += 'until';
        break;
      default:
        string += (this.type() == 'date') ? 'in' : '=';
        break;
      };

      string += ' ';

      // Add value
      switch (this.type()) {
      case "date":
        return string + this.value();
      case "regex":
        return string + '/' + this.value().escapeRegex() + '/';
      case "string":
      case "text":
        return string + this.value().quote();
      };

      return "";
    }
  };
});
