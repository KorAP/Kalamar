/**
 * Date picker for the
 * Virtual Collection builder.
 *
 * @author Nils Diewald
 */
define(['util'], function () {

  "use strict";

  KorAP._validDateMatchRE = new RegExp("^(?:[lg]?eq|ne)$");
  KorAP._validDateRE      = new RegExp("^(?:\\d{4})(?:-\\d\\d(?:-\\d\\d)?)?$");

  /*
   * Localizations
   */
  const loc = KorAP.Locale;
  loc.WDAY = loc.WDAY || [
    'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'
  ];
  loc.MONTH = loc.MONTH || [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November',
    'December'
  ];

  const d = document;

  // The datepicker class
  return {

    /**
     * Create a new datepicker view.
     */
    create : function () {
      return Object.create(this)._init();
    },


    // Init datepicker
    _init : function () {
      this._selected = [];
      return this;
    },


    /**
     * Get or select a specific date.
     */
    select : function (year, month, day) {
      const t = this;
      if (arguments.length >= 1) {
        t._selected = {'year' : year};
        t._showYear = year;
        if (arguments.length >= 2) {
          t._selected['month'] = month;
          t._showMonth = month;
          if (arguments.length >= 3) {
            t._selected['day'] = day;
            t._showDay = day;
          };
        };

        return t;
      };

      return t._selected;
    },


    /**
     * Select a specific date and
     * init the accompanied action.
     */
    set : function (year, month, day) {
      this.select(year, month, day);
      this._store();
    },


    // Store the selected value
    _store : function () {
      if (this._click !== undefined)
        this._click(this._selected);
      else 
        console.dir(this._selected);
    },

    
    /**
     * Set the action for clicking as a callback.
     * The callback will retrieve a an object with
     * an optional year attribute,
     * an optional month attribute,
     * and an optional day attribute
     */
    onclick : function (cb) {
      this._click = cb;
    },


    /**
     * The associated input field.
     */
    input : function () {
      return this._input;
    },
    

    /**
     * Show the datepicker.
     * Will either show the selected year/month
     * or the current date.
     * Will return the element for appending to the dom.
     */
    show : function (year, month) {

      const e = this._element = d.createElement('div');
      e.setAttribute('tabindex', 0);
      e.style.outline = 0;
      e.classList.add('datepicker');
      
      const today = new Date();
      const t = this;

      // Show year
      t._showYear = (year !== undefined) ? year :
        (t._selected['year'] ? this._selected['year'] :
         today.getYear() + 1900);

      // Show month
      t._showMonth = month ? month :
        (t._selected['month'] ? t._selected['month'] :
         (today.getMonth() + 1));

      // Append all helpers
      e.appendChild(t._monthHelper());
      e.appendChild(t._yearHelper());
      e.appendChild(t._dayHelper());
      t._input = e.appendChild(t._stringHelper());

      // Always focus
      e.addEventListener(
        'mousedown',
        function (ev) {
          this._inField = true
        }.bind(t)
      );

      e.addEventListener(
        'mouseup',
        function (ev) {
          this._inField = false;
          this._input.focus();
        }.bind(t)
      );

      t._input.addEventListener(
        'blur',
        function (ev) {
          if (!this._inField) {
            if (this.fromString(this._input.value)) {
              this._store();
            };
          };
          ev.halt();
        }.bind(t)
      );

      t._input.focus();

      return t._element;
    },

    _stringHelper : function () {

      // Create element
      // Add input field
      const input = d.createElement('input');
      input.value = this.toString();
      input.setAttribute('tabindex', 0);

      input.addEventListener(
        'keyup',
        function (e) {
          if (this.fromString(input.value)) {
            this._updateYear();
            this._updateMonth();
            this._updateDay();
          };
        }.bind(this)
      );

      input.addEventListener(
        'keypress',
        function (e) {
          if (e.keyCode == 13) {
            if (this.fromString(input.value))
              this._store();

            e.halt();
            return false;
          }
        }.bind(this)
      )

      return input;
    },


    /**
     * Get the HTML element associated with the datepicker.
     */
    element : function () {
      return this._element;
    },


    /**
     * Get the current date in string format.
     */
    today : function () {
      const today = new Date();
      let str = today.getYear() + 1900;
      const m = today.getMonth() + 1;
      const d = today.getDate();
      str += '-' + (m < 10 ? '0' + m : m);
      str += '-' + (d < 10 ? '0' + d : d);
      return str;
    },


    /**
     * Stringification
     */
    toString : function () {
      // There are values selected
      let v = '';
      const s = this._selected;
      if (s['year']) {
        v += s['year'];
        if (s['month']) {
          v += '-';
          v += s['month'] < 10 ? '0' + s['month'] : s['month'];
          if (s['day']) {
            v += '-';
            v += s['day'] < 10 ? '0' + s['day'] : s['day'];
          };
        };
      };
      return v;
    },


    /**
     * Increment the year.
     */
    incrYear : function () {
      const t = this;
      if (t._showYear < 9999) {
        t._showYear++;
        t._updateYear();
        t._updateMonth();
        t._updateDay();
        return t;
      };
      return;
    },


    /**
     * Decrement the year.
     */
    decrYear : function () {
      const t = this;
      if (t._showYear > 0) {
        t._showYear--;
        t._updateYear();
        t._updateMonth();
        t._updateDay();
        return t;
      };
      return;
    },


    /**
     * Increment the month.
     */
    incrMonth : function () {
      const t = this;
      t._showMonth++;
      if (t._showMonth > 12) {
        t._showMonth = 1;
        t.incrYear();
      }
      else {
        t._updateMonth();
        t._updateDay();
      };
      return t;
    },


    /**
     * Decrement the month.
     */
    decrMonth : function () {
      const t = this;
      t._showMonth--;
      if (t._showMonth < 1) {
        t._showMonth = 12;
        t.decrYear();
      }
      else {
        t._updateMonth();
        t._updateDay();
      };

      return t;
    },


    // Create the year helper element.
    _yearHelper : function () {
      const t = this;
      const year = d.createElement('div');
      year.classList.add('year');

      // Decrement year
      year.addE('span')
        .onclick = t.decrYear.bind(t);

      t._yElement = year.addE('span');
      t._yElement.addT(t._showYear);

      t._yElement.onclick = function () {
        t.set(t._showYear);
      }.bind(t);
      t._selectYear();

      // Increment year
      year.addE('span')
        .onclick = t.incrYear.bind(t);

      return year;
    },


    // Update the year helper view.
    _updateYear : function () {
      this._yElement.firstChild.data = this._showYear;
      this._selectYear();
    },


    // Check if the viewed year is current
    _selectYear : function () {
      if (this._showYear === this.select()['year'])
        this._yElement.classList.add('selected');
      else
        this._yElement.classList.remove('selected');
    },


    // Create the month helper element.
    _monthHelper : function () {
      const t = this;
      const month = d.createElement('div');
      month.classList.add('month');

      // Decrement month
      month.addE('span')
        .onclick = t.decrMonth.bind(t);
      
      t._mElement = month.addE('span');
      t._mElement.addT(loc.MONTH[t._showMonth-1]);
      t._mElement.onclick = function () {
        this.set(this._showYear, this._showMonth);
      }.bind(t);

      t._selectMonth();
      
      // Increment month
      month.addE('span')
        .onclick = t.incrMonth.bind(t);

      return month;
    },

    // Update the month helper view.
    _updateMonth : function () {
      if (this._showMonth === undefined || this._showMonth > 12)
        this._showMonth = 1;

      this._mElement.firstChild.data = loc.MONTH[this._showMonth-1];
      this._selectMonth();
    },


    // Check if the viewed month is current
    _selectMonth : function () {
      const t = this;
      if (t._showYear === t.select()['year'] &&
          t._showMonth === t.select()['month'])
        t._mElement.classList.add('selected');
      else
        t._mElement.classList.remove('selected');
    },


    // Create the day (calendar) helper element.
    _dayHelper : function () {
      const table = d.createElement('table');

      // Localized day view
      const tr = table.addE('thead').addE('tr');
      for (let i = 0; i < 7; i++) {
        tr.addE('th').addT(loc.WDAY[i]);
      };

      this._dBElement = this._dayBody();

      table.appendChild(this._dBElement);
      return table;
    },


    // Create day body for calendar table
    _dayBody : function () {
      const showDate = new Date(
        this._showYear,
        this._showMonth - 1,
        1,
        0,
        0,
        0,
        0
      );
      const date = new Date(
        this._showYear,
        this._showMonth - 1,
        1,
        0,
        0,
        0,
        0
      );
      const today = new Date();
      const that = this;

      // What happens, in case someone clicks
      // on a date
      const click = function () {
        that.set(
          that._showYear,
          that._showMonth,
          parseInt(this.firstChild.data)
        );
      };

      // Skip back to the previous monday (may be in the last month)
      date.setDate(date.getDate() - ((date.getDay() + 6) % 7));

      const tb = d.createElement('tbody');

      const s = this.select();
      
      let tr, i, td;

      // Iterate over all days of the table
      while (1) {

        // Loop through the week
        tr = tb.addE('tr');
        for (i = 0; i < 7; i++) {
          td = tr.addE('td');
          
          // Not part of the current month
          if (date.getMonth() !== showDate.getMonth()) {
            td.classList.add('out');
          }
          else {
            td.onclick = click;
          };
    
          // This is the current day
          if (date.getDate()     === today.getDate() &&
              date.getMonth()    === today.getMonth() &&
              date.getFullYear() === today.getFullYear()) {
            td.classList.add('today');
          };

          // This is the day selected
          if (s && s['day']) {
            if (date.getDate()     === s['day'] &&
                date.getMonth()    === s['month']-1 &&
                date.getFullYear() === s['year']) {
              td.classList.add('selected');
            };
          };
          
          // Add the current day to the table
          td.addT(date.getDate());
    
          // Next day
          date.setDate(date.getDate() + 1);
        };
        
        if (date.getMonth() !== showDate.getMonth())
          break;
      };
      return tb;
    },

    // Update the calendar view
    _updateDay : function () {
      const newBody = this._dayBody();
      this._dBElement.parentNode.replaceChild(
        newBody,
        this._dBElement
      );
      this._dBElement = newBody;
    },


    /**
     * Parse date from string.
     */
    fromString : function (v) {
      if (v === undefined)
        return false;

      if (!KorAP._validDateRE.test(v))
        return false;

      const d = v.split('-', 3);
      d[0] = parseInt(d[0]);
      if (d[1]) d[1] = parseInt(d[1]);
      if (d[2]) d[2] = parseInt(d[2]);

      // Select values
      this.select(d[0], d[1], d[2]);
      return true;
    }
  };
});
