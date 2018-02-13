/**
 * This file defines the development environment
 * of the application.
 */

requirejs.config({
  baseUrl: '/js/src',
  paths : {
    'lib': '../lib'
  }
});

require(['app/en'], function (lang) {
  // TODO: Define logging output!
});
