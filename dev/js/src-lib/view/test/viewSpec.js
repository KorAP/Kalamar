import { describe, it, expect } from 'vitest';
import viewClass from '../view.js';

  describe('KorAP.View', function () {
    it('should be initializable', function () {
      var view = new viewClass();

      expect(view.shown()).toBeFalsy();

      var e = view.element();
      expect(view.shown()).toBeTruthy();

      expect(e.tagName).toEqual("DIV");
      expect(e.classList.contains("view")).toBeTruthy();

      var btn = e.firstChild;
      expect(btn.tagName).toEqual("DIV");
      expect(btn.classList.contains("button-view")).toBeTruthy();
      expect(btn.classList.contains("button-group")).toBeTruthy();

      expect(btn.firstChild.tagName).toEqual("SPAN");
      expect(btn.firstChild.getAttribute("title")).toEqual("Close");
      expect(btn.firstChild.classList.contains("button-icon")).toBeTruthy();
      expect(btn.firstChild.classList.contains("close")).toBeTruthy();
      expect(btn.firstChild.firstChild.tagName).toEqual("SPAN");
      expect(btn.firstChild.firstChild.firstChild.data).toEqual("Close");
    });

    it('should be classable', function () {
      var view = new viewClass(['versuch']);
      var e = view.element();
      expect(e.tagName).toEqual("DIV");
      expect(e.classList.contains("view")).toBeTruthy();
      expect(e.classList.contains("versuch")).toBeTruthy();

      var btn = e.firstChild;
      expect(btn.tagName).toEqual("DIV");
      expect(btn.classList.contains("button-view")).toBeTruthy();
      expect(btn.classList.contains("button-group")).toBeTruthy();
      expect(btn.classList.contains("versuch")).toBeTruthy();
    });

    it('should be minimizable', function () {
      var view = new viewClass(['versuch']);
      var e = view.element();
      expect(e.classList.contains('show')).toBeTruthy();
      view.minimize();
      expect(e.classList.contains('show')).toBeFalsy();
    });
  });

