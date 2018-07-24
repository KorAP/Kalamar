define(['panel','view','util'], function (panelClass,viewClass) {

  var controlStr = "";

  var helloViewClass = {
    create : function () {
      return Object.create(viewClass)._init(['myview']).upgradeTo(this);
    },

    show : function () {
      if (this._show)
        return this._show;

      var e = document.createElement('span');
      e.addT("Hello World!");
      
      this._show = e;
      return e;
    }
  };

  describe('KorAP.View', function () {
    it('should be initializable', function () {
      var view = viewClass.create();

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
      var view = viewClass.create(['versuch']);
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
  });
  
  describe('KorAP.Panel', function () {

    it('should be initializable', function () {
      var panel = panelClass.create();
      var e = panel.element();
      expect(e.tagName).toEqual("DIV");
      expect(e.classList.contains("panel")).toBeTruthy();
      expect(e.firstChild.tagName).toEqual("DIV");

      // No children in the empty view element
      expect(e.firstChild.firstChild).toBeFalsy();
      expect(e.lastChild.tagName).toEqual("DIV");
      expect(e.lastChild.classList.contains("button-panel")).toBeTruthy();
      expect(e.lastChild.classList.contains("button-group")).toBeTruthy();
      expect(e.lastChild.firstChild).toBeFalsy();

      expect(panel.actions).toBeTruthy();
    });

    
    it('should be extensible', function () {
      var panel = panelClass.create();

      controlStr = "";
      panel.actions.add("New", ["new"], function () {
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
      var panel = panelClass.create(["versuch"]);
      var e = panel.element();
      expect(e.tagName).toEqual("DIV");
      expect(e.classList.contains("panel")).toBeTruthy();
      expect(e.classList.contains("versuch")).toBeTruthy();
      expect(e.lastChild.classList.contains("button-panel")).toBeTruthy();
      expect(e.lastChild.classList.contains("versuch")).toBeTruthy();
    });

    it('should be extensible by a view', function () {
      var panel = panelClass.create();
      var view = helloViewClass.create();
      var e = panel.element();

      panel.add(view);

      var viewE = e.firstChild.firstChild;
      expect(viewE.classList.contains('view')).toBeTruthy();
      expect(viewE.classList.contains('myview')).toBeTruthy();
      expect(viewE.firstChild.tagName).toEqual("SPAN");
      expect(viewE.firstChild.firstChild.data).toEqual("Hello World!");
    });
  });
});
