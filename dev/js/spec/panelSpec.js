define(['panel','view','panel/result','util'], function (panelClass,viewClass, resultClass) {

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
  
  var secViewClass = {
      create : function () {
        return Object.create(viewClass)._init(['secview']).upgradeTo(this);
      },
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
    
    it('views should be appended or prepended', function () {
      let panel = panelClass.create();
      let view = helloViewClass.create();
      let e = panel.element();
      panel.add(view);      
      let secview = secViewClass.create();
      panel.add(secview);
      let viewFirst = e.firstChild.firstChild;
      expect(viewFirst.classList.contains('myview')).toBeTruthy();
      
      let prependPanel = panelClass.create();
      prependPanel.prepend = true;
      prependPanel.add(view);
      prependPanel.add(secview);
      viewFirst = prependPanel.element().firstChild.firstChild;
      expect(viewFirst.classList.contains('secview')).toBeTruthy();
    });
    
  });

  describe('KorAP.Panel.Result', function () {

    it('should be initializable', function () {
      var show = {};
      var result = resultClass.create(show);
      expect(result.element().children.length).toEqual(2);
      expect(result.element().firstChild.children.length).toEqual(0);
    });

    it('should open KQAction', function () {
      var show = {};
      var result = resultClass.create(show);

      result.addKqAction();

      expect(result.element().lastChild.firstChild.textContent).toEqual("show KoralQuery");
      expect(show["kq"]).toBeFalsy();

      // Open KQ view
      result.element().lastChild.firstChild.click();

      expect(result.element().querySelector('#koralquery').textContent).toEqual("{}");
      expect(show["kq"]).toBeTruthy();

      var close = result.element().firstChild.firstChild.lastChild.firstChild;
      expect(close.textContent).toEqual("Close");

      // Close view
      close.click();

      expect(result.element().querySelector('#koralquery')).toBeFalsy();
      expect(show["kq"]).toBeFalsy();
    });
  });
});
