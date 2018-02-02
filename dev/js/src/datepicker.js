/**
 * Simple Date picker for the
 * Virtual Collection builder.
 *
 * @author Nils Diewald
 */
define(['util'], function () {
  "use strict";

  KorAP._validDateMatchRE   = new RegExp("^[lg]?eq$");
  KorAP._validDateRE        = new RegExp("^(?:\\d{4})(?:-\\d\\d(?:-\\d\\d)?)?$");

  /*
   * Localizations
   */
  var loc = KorAP.Locale;
  loc.WDAY = loc.WDAY || [
    'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'
  ];
  loc.MONTH = loc.MONTH || [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November',
    'December'
  ];

  var d = document;

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
      if (arguments.length >= 1) {
        this._selected = {'year' : year};
        this._showYear = year;
        if (arguments.length >= 2) {
          this._selected['month'] = month;
          this._showMonth = month;
          if (arguments.length >= 3) {
            this._selected['day'] = day;
            this._showDay = day;
          };
        };

        return this;
      };

      return this._selected;
    },


    /**
     * Select a specific date and
     * init the accompanied action.
     */
    set : function (year, month, day) {
      this.select(year, month, day);
      this.store();
    },

    
    store : function () {
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

      var e = this._element = d.createElement('div');
      e.setAttribute('tabindex', 0);
      e.style.outline = 0;
      e.classList.add('datepicker');
      
      var today = new Date();

      // Show year
      this._showYear = (year !== undefined) ? year :
        (this._selected['year'] ? this._selected['year'] :
         today.getYear() + 1900);

      // Show month
      this._showMonth = month ? month :
        (this._selected['month'] ? this._selected['month'] :
         (today.getMonth() + 1));

      // Append all helpers
      e.appendChild(this._monthHelper());
      e.appendChild(this._yearHelper());
      e.appendChild(this._dayHelper());
      this._input = e.appendChild(this._stringHelper());

      // Always focus
      e.addEventListener(
        'mousedown',
        function (ev) {
          this._inField = true
        }.bind(this)
      );

      e.addEventListener(
        'mouseup',
        function (ev) {
          this._inField = false;
          this._input.focus();
        }.bind(this)
      );

      this._input.addEventListener(
        'blur',
        function (ev) {
          if (!this._inField) {
            if (this.fromString(this._input.value)) {
              this.store();
            };
          };
          ev.halt();
        }.bind(this)
      );

      this._input.focus();

      return this._element;
    },

    _stringHelper : function () {

      // Create element
      // Add input field
      var input = d.createElement('input');
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
              this.store();

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
      var today = new Date();
      var str = today.getYear() + 1900;
      var m = today.getMonth() + 1;
      var d = today.getDate();
      str += '-' + (m < 10 ? '0' + m : m);
      str += '-' + (d < 10 ? '0' + d : d);
      return str;
    },


    toString : function () {
      // There are values selected
      var v = '';
      var s = this._selected;
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
      if (this._showYear < 9999) {
        this._showYear++;
        this._updateYear();
        this._updateMonth();
        this._updateDay();
        return this;
      };
      return;
    },


    /**
     * Decrement the year.
     */
    decrYear : function () {
      if (this._showYear > 0) {
        this._showYear--;
        this._updateYear();
        this._updateMonth();
        this._updateDay();
        return this;
      };
      return;
    },


    /**
     * Increment the month.
     */
    incrMonth : function () {
      this._showMonth++;
      if (this._showMonth > 12) {
        this._showMonth = 1;
        this.incrYear();
      }
      else {
        this._updateMonth();
        this._updateDay();
      };
      return this;
    },


    /**
     * Decrement the month.
     */
    decrMonth : function () {
      this._showMonth--;
      if (this._showMonth < 1) {
        this._showMonth = 12;
        this.decrYear();
      }
      else {
        this._updateMonth();
        this._updateDay();
      };

      return this;
    },


    // Create the year helper element.
    _yearHelper : function () {
      var year = d.createElement('div');
      year.classList.add('year');

      // Decrement year
      year.addE('span')
        .onclick = this.decrYear.bind(this);

      this._yElement = year.addE('span');
      this._yElement.addT(this._showYear);

      this._yElement.onclick = function () {
        this.set(this._showYear);
      }.bind(this);
      this._selectYear();

      // Increment year
      year.addE('span')
        .onclick = this.incrYear.bind(this);

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
      var month = d.createElement('div');
      month.classList.add('month');

      // Decrement month
      month.addE('span')
        .onclick = this.decrMonth.bind(this);
      
      this._mElement = month.addE('span');
      this._mElement.addT(loc.MONTH[this._showMonth-1]);
      this._mElement.onclick = function () {
        this.set(this._showYear, this._showMonth);
      }.bind(this);

      this._selectMonth();
      
      // Increment month
      month.addE('span')
        .onclick = this.incrMonth.bind(this);

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
      if (this._showYear === this.select()['year'] &&
          this._showMonth === this.select()['month'])
        this._mElement.classList.add('selected');
      else
        this._mElement.classList.remove('selected');
    },


    // Create the day (calendar) helper element.
    _dayHelper : function () {
      var table = d.createElement('table');

      // Localized day view
      var tr = table.addE('thead').addE('tr');
      for (var i = 0; i < 7; i++) {
        tr.addE('th').addT(loc.WDAY[i]);
      };

      this._dBElement = this._dayBody();

      table.appendChild(this._dBElement);
      return table;
    },

    _dayBody : function () {
      var showDate = new Date(
        this._showYear,
        this._showMonth - 1,
        1,
        0,
        0,
        0,
        0
      );
      var date = new Date(
        this._showYear,
        this._showMonth - 1,
        1,
        0,
        0,
        0,
        0
      );
      var today = new Date();
      var that = this;

      // What happens, in case someone clicks
      // on a date
      var click = function () {
        that.set(
          that._showYear,
          that._showMonth,
          parseInt(this.firstChild.data)
        );
      };

      // Skip back to the previous monday (may be in the last month)
      date.setDate(date.getDate() - ((date.getDay() + 6) % 7));

      var tb = d.createElement('tbody');

      var s = this.select();

      // Iterate over all days of the table
      while (1) {

        // Loop through the week
        var tr = tb.addE('tr');
        for (var i = 0; i < 7; i++) {
          var td = tr.addE('td');
          
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
      var newBody = this._dayBody();
      this._dBElement.parentNode.replaceChild(
        newBody,
        this._dBElement
      );
      this._dBElement = newBody;
    },

    fromString : function (v) {
      if (v === undefined)
        return false;

      if (!KorAP._validDateRE.test(v))
        return false;

      var d = v.split('-', 3);
      d[0] = parseInt(d[0]);
      if (d[1]) d[1] = parseInt(d[1]);
      if (d[2]) d[2] = parseInt(d[2]);

      // Select values
      this.select(d[0], d[1], d[2]);
      return true;
    }
  };
});
