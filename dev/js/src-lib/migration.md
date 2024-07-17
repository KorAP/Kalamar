# Migration Directives for ES6 port

## Classes

Turn
```
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
```

into

```
import defaultItemClass from './menu/item';
import defaultPrefixClass from './menu/prefix';
import defaultLengthFieldClass from './menu/lengthField';
import sliderClass from './menu/slider';

// Default maximum number of menu items
const menuLimit = 8;

export default class KalamarMenu {
....
}
```

## Constructors

Turn

```
create : function (list, params) {
  return Object.create(this)._init(list, params);
},
```

into

```
constructor (list, params) {
  return this._init(list, params)
}
```

Note the comma!

## Methods

Turn

```
// Append item to list
append : function (item) {
  ...
},
```

into

```
append (item) {
  ...
}
```

Note the comma!

## Vivocation

Turn

```
params["prefixClass"].create();
```

into

```
new params["prefixClass"]();
```

if classes are not directly imported but passed.

## Inheritence

- Classes can be extended with `extends`
- The extension constructor needs to be called with `super()`

# Further migrations

- Create demo files per library
- Turn classes in better export names (e.g. defaultItemClass -> KalamarMenuItem)
- Move test files per library
- Turn Jasmine Tests into vitests
- Turn elements into web components extending HTMLElement, e.g. <kalamar-menu></kalamar-menu>
  - For compatibility element() can be kept
- Use stylesheets as part of the web component
- Use shadowDOM instead of document DOM, so styles are encapsulated.
  - For this: Introduce CSS variables for e.g. colors.
  WARNING: I have no experience with shadow DOM and inheritence, maybe
  there are some problems with that.
- Change some methods to getter and setter
- Use optional object path operators (?)
