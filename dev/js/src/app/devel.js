/**
 * This file defines the development environment
 * of the application.
 */

requirejs.config({
  baseUrl: '/js/src',
  urlArgs: 'v=' + Date.now(),
  paths : {
    'lib': '../lib'
  }
});

// Match the server-rendered language, just as the production bundles do.
const language = (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
window.KorAP = window.KorAP || {};
KorAP.Locale = KorAP.Locale || {};
// Load translations before any module can initialize interface text.
require(language === 'de' ? ['loc/dereko', 'loc/de'] : ['loc/dereko'], function () {
  require(['app/' + (language === 'de' ? 'de' : 'en'), 'default']);
});
