import prefixClass from '../../menu/menu/prefix.js';

  export default class Prefix extends prefixClass {

    /**
     * Override the prefix action.
     */
    onclick (e) {
      var m = this.menu();
      var value = this.value();
      m.release(value, "string");
    }
  };
