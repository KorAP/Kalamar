/**
 * 
 * Creates and displays corpus statistic
 * 
 * @author Helge Stallkamp
 * 
 */

"use strict";

define([ 'util' ], function() {

  return {

    /**
     * Create new statistic object
     */
    create : function (statistic) {
      return Object.create(this)._init(statistic);
    },


    /**
     * Initialize statistic object
     */
    _init : function (statistic) {
      if (statistic === undefined) {
        throw new Error("Missing parameter");
      } else {
        this._statistic = statistic;
        return this;
      }
    },


    /**
     * Display statistic object as HTML Description List Element
     */
    element : function () {

      // if this._el already exists return without doing something
      if (this._el !== undefined) {
        return this._el;
      }

      // create HTML Description List Element
      const statDL = document.createElement('dl');
      statDL.classList.add("flex");

      const statistic = this._statistic;
      let statSp, statDT, statDD;

      Object.keys(statistic).forEach(function (k) {
        statSp = statDL.addE('div')
        statDT = statSp.addE('dt');
        statDT.addT(k);
        statDT.setAttribute('title', k);
        statDD = statSp.addE('dd');
        statDD.addT(new Number(statistic[k]).toLocaleString());
      });

      this._el = statDL;
      return this._el;
    }
  }

});
