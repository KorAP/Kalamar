/**
 * Menu showing all predefined virtual corpora.
 * THIS IS EXPERIMENTAL AND MAY BE REMOVED!
 */

import menuClass from './menu.js';
import apiClass from '../../api.js';

export default class ChooseMenu extends menuClass {
  
  constructor (params) {
    super(apiClass, undefined, undefined, params);
  }
  /**
   * A click event was released
   */
  release (id, name) {
      if (this._cb !== undefined)
	      this._cb(id, name);
    }
  };

