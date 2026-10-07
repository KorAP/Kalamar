import { describe, it, expect } from 'vitest';
import panelClass from '../panel.js';
import viewClass from '../../view/view.js';
import '../../util/util.js';

  var controlStr = "";

  class HelloView extends viewClass {
    constructor () {
      super(['myview']);
    }

    show () {
      if (this._show)
        return this._show;

      var e = document.createElement('span');
      e.addT("Hello World!");
      
      this._show = e;
      return e;
    }
  }
  
  class SecView extends viewClass {
    constructor () {
      super(['secview']);
    }
  }
  
  describe('KorAP.Panel', function () {

    it('should be initializable', function () {
      var panel = new panelClass();
      var e = panel.element();

      expect(panel.type).toEqual('base');
      expect(e.tagName).toEqual("DIV");
      expect(e.classList.contains("panel")).toBeTruthy();
      expect(e.firstChild.tagName).toEqual("DIV");

      // No children in the empty view element
      expect(e.firstChild.firstChild).toBeFalsy();
      expect(e.lastChild.tagName).toEqual("DIV");
      expect(e.lastChild.classList.contains("button-panel")).toBeTruthy();
      expect(e.lastChild.classList.contains("button-group")).toBeTruthy();
      expect(e.lastChild.firstChild).toBeFalsy();

      expect(panel.actions()).toBeTruthy();
    });

    
    it('should be extensible', function () {
      var panel = new panelClass();

      controlStr = "";
      panel.actions().add("New", {'cls':["new"]}, function () {
        controlStr = 'New!!!';
      });

      var e = panel.element();

      expect(e.tagName).toEqual("DIV");
      expect(e.firstChild.firstChild).toBeFalsy();

      expect(e.lastChild.firstChild.tagName).toEqual("SPAN");
      expect(e.lastChild.firstChild.getAttribute("title")).toEqual("New");
      expect(e.lastChild.firstChild.classList.contains("new")).toBeTruthy();
      expect(e.lastChild.firstChild.firstChild.tagName).toEqual("SPAN");
      expect(e.lastChild.firstChild.firstChild.firstChild.data).toEqual("New");

      expect(controlStr).toEqual("");
      e.lastChild.firstChild.click();
      expect(controlStr).toEqual("New!!!");
    });

    it('should be classable', function () {
      var panel = new panelClass(["versuch"]);
      var e = panel.element();
      expect(e.tagName).toEqual("DIV");
      expect(e.classList.contains("panel")).toBeTruthy();
      expect(e.classList.contains("versuch")).toBeTruthy();
      expect(e.lastChild.classList.contains("button-panel")).toBeTruthy();
      expect(e.lastChild.classList.contains("versuch")).toBeTruthy();
    });

    it('should be extensible by a view', function () {
      var panel = new panelClass();
      var view = new HelloView();
      var e = panel.element();

      panel.add(view);

      var viewE = e.firstChild.firstChild;
      expect(viewE.classList.contains('view')).toBeTruthy();
      expect(viewE.classList.contains('myview')).toBeTruthy();
      expect(viewE.firstChild.tagName).toEqual("SPAN");
      expect(viewE.firstChild.firstChild.data).toEqual("Hello World!");
    });
    
    it('views should be appended or prepended', function () {
      let panel = new panelClass();
      let view = new HelloView();
      let e = panel.element();
      panel.add(view);      
      let secview = new SecView();
      panel.add(secview);
      let viewFirst = e.firstChild.firstChild;
      expect(viewFirst.classList.contains('myview')).toBeTruthy();
      
      let prependPanel = new panelClass();
      prependPanel.prepend = true;
      prependPanel.add(view);
      prependPanel.add(secview);
      viewFirst = prependPanel.element().firstChild.firstChild;
      expect(viewFirst.classList.contains('secview')).toBeTruthy();
    });
    
  });

