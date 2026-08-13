/**
 * Abstract JsonLD criterion object
 */

import operatorsClass from './operators.js';

export default class JsonLD {

  constructor () {
    this.__changed = false;
  }


  ldType (type) {
    if (arguments.length === 1)
      this._ldType = type;
    return this._ldType;
  }
  

  parent (obj) {
    if (arguments.length === 1) {
      this._parent = obj;
      this.__changed = true;
    };
    return this._parent;
  }


  // Destroy object - especially for
  // acyclic structures!
  // I'm paranoid!
  destroy () {
    const t = this;
    if (t._ops != undefined) {
      t._ops._parent = undefined;
      if (t._ops._el !== undefined) {
        t._ops._el.refTo = undefined;
      };
      t._ops = undefined;
    };

    if (t._el !== undefined)
      t._el = undefined;
    
    // In case of a group, destroy all operands
    if (t._operands !== undefined) {
      t._operands.forEach(i => i.destroy());
      t._operands = [];
    };
  }


  // Be aware! This may be cyclic
  operators (and, or, del) {
    if (arguments === 0)
      return this._ops;

    this._ops = new operatorsClass(
      and, or, del
    );

    this._ops.parent(this);
    return this._ops;
  }


  toJson () {
    return {
      // Unspecified object
      "@type" : "koral:" + this.ldType()
    };
  }


  rewrites () {
    return null;
  }


  incomplete () {
    return false;
  }


  toQuery () {
    return '';
  }
};
