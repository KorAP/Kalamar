/**
 * 
 * Creates and displays corpus statistic
 * 
 * @author Helge Stallkamp
 * 
 */

define([ 'util' ], function() {

  return {

    /**
     * Create new statistic object
     */
    create : function(statistic) {
      return Object.create(this)._init(statistic);
    },

    /**
     * Initialize statistic object
     */
    _init : function(statistic) {
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
    element : function() {

      // if this._element already exists return without doing something
      if (this._element !== undefined) {
        return this._element;
      }

      // create HTML Description List Element
      var statDL = document.createElement('dl');
      statDL.classList.add("flex");
      var statistic = this._statistic;

      var keys = Object.keys(statistic);
      for (i = 0; i < keys.length; i++) {
        statSp = statDL.addE('div')
        statDT = statSp.addE('dt');
        var k = keys[i];
        statDT.addT(k);
        statDT.setAttribute('title', k);
        statDD = statSp.addE('dd');
        statDD.addT(new Number(statistic[k]).toLocaleString());
      }

      this._element = statDL;
      return this._element;
    },

  }

});
