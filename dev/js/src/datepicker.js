/**
 * Simple Date picker for the
 * Virtual Collection builder.
 *
 * @author Nils Diewald
 */
define(['util'], function () {
  "use strict";

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
      return this;
    },

    /**
     * Get or select a specific date.
     */
    select : function (year, month, day) {
      if (arguments.length >= 1) {
	this._selected = {'year' : year};
	if (arguments.length >= 2) {
	  this._selected['month'] = month;
	  if (arguments.length >= 3)
	    this._selected['day'] = day;
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
      this._showYear = year ? year :
	(this._selected['year'] ? this._selected['year'] :
	 today.getYear());

      // Show month
      this._showMonth = month ? month :
	(this._selected['month'] ? this._selected['month'] :
	 (today.getMonth() + 1));

      // Append all helpers
      this._element.appendChild(this._monthHelper());
      this._element.appendChild(this._yearHelper());
      this._element.appendChild(this._dayHelper());
      return this._element;
    },

    /**
     * Get the HTML element associated with the datepicker.
     */
    element : function () {
      return this._element;
    },


    /**
     * Increment the year.
     */
    incrYear : function () {
      this._showYear++;
      this._updateYear();
      this._updateMonth();
      this._updateDay();
      return;
    },

    /**
     * Decrement the year.
     */
    decrYear : function () {
      this._showYear--;
      this._updateYear();
      this._updateMonth();
      this._updateDay();
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
    },


    // Create the year helper element.
    _yearHelper : function () {
      var year = d.createElement('div');
      year.classList.add('year');

      // Decrement year
      year.appendChild(d.createElement('span'))
	.onclick = this.decrYear.bind(this);

      this._yElement = year.appendChild(d.createElement('span'));
      this._yElement.appendChild(document.createTextNode(this._showYear));

      this._yElement.onclick = function () {
	this.set(this._showYear);
      }.bind(this);
      this._selectYear();

      // Increment year
      year.appendChild(d.createElement('span'))
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
      month.appendChild(d.createElement('span'))
	.onclick = this.decrMonth.bind(this);
      
      this._mElement = month.appendChild(d.createElement('span'));
      this._mElement.appendChild(
	document.createTextNode(loc.MONTH[this._showMonth-1])
      );
      this._mElement.onclick = function () {
	this.set(this._showYear, this._showMonth);
      }.bind(this);

      this._selectMonth();
      
      // Increment month
      month.appendChild(d.createElement('span'))
	.onclick = this.incrMonth.bind(this);

      return month;
    },

    // Update the month helper view.
    _updateMonth : function () {
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
      var tr = table.appendChild(d.createElement('thead'))
	.appendChild(d.createElement('tr'));
      for (var i = 0; i < 7; i++) {
	tr.appendChild(d.createElement('th'))
	  .appendChild(d.createTextNode(loc.WDAY[i]));
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
	var tr = tb.appendChild(d.createElement('tr'));
	for (var i = 0; i < 7; i++) {
	  var td = tr.appendChild(d.createElement('td'));

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
	  td.appendChild(
	    d.createTextNode(date.getDate())
	  );
	  
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
    }
  };
});
