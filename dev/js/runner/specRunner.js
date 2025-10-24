// Load requirejs
const requirejs = require('requirejs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>`);
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.KorAP = {};

// Configure requirejs
requirejs.config({
  baseUrl: 'src', // adjust the path based on your folder structure
  paths: {
    "lib" : "lib",
    "spec" : "../spec",  // assuming your spec files are in the "spec" folder
    "jlib" : "lib/jasmine-2.1.1", 
    "jasmine" : ['lib/jasmine-2.1.1/jasmine']
  }
});

// Start the test runner
requirejs(['jasmine'], function (jasmine) {  
  global.describe = jasmine.describe;
  console.dir(jasmine);
  requirejs([
    'spec/menuSpec',    // List of your test files
    'spec/selectMenuSpec'
  ], function () {
    console.log("Tests are loaded!");
    // Trigger Jasmine's bootstrapping process in Node.js
    jasmine.execute();
    // window.onload();
  });
});

