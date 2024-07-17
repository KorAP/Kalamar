# Classes

define([
  'menu/item',
  'menu/prefix',
  'menu/lengthField',
  'menu/slider',
  'util'
], function (defaultItemClass,
             defaultPrefixClass,
             defaultLengthFieldClass,
             sliderClass) {
  // Default maximum number of menu items
  const menuLimit = 8;
    return {
    ...
    }
    }


--> 

import defaultItemClass from 'menu/item';
import defaultPrefixClass from 'menu/prefix';
import defaultLengthFieldClass from 'menu/lengthField';
import sliderClass from 'menu/slider';

// Default maximum number of menu items
const menuLimit = 8;

export default class KalamarMenu {
....
}

# Constructor

    create : function (list, params) {
      return Object.create(this)._init(list, params);
    },

->

constructor (list, params) {
  return this._init(list, params)
}

# Methods

    // Append item to list
    append : function (item) {
      const t = this;
      // This is cyclic!
      item["_menu"] = t;
...
    },
    
    ->
    
        append (item) {
        ...
        }

# Vivocation

params["prefixClass"].create();

-->

new params["prefixClass"]();

