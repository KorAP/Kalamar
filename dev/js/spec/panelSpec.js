define(['panel','view','panel/result','panel/pagination','util'], function (panelClass,viewClass,resultClass,paginationClass) {

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
  
  describe('KorAP.Panel', function () {

    it('should be initializable', function () {
      var panel = panelClass.create();
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
      var panel = panelClass.create();

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
      expect(result.type).toEqual('result');
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

    it('should open toggler', function () {
      const show = {};

      const div = document.body.addE("div");
      div.setAttribute("id","search");
      const ol = div.addE("ol");
      ol.classList.add("align-left");

      const result = resultClass.create(show);

      result.addAlignAction();

      const b = result.element().lastChild.firstChild;

      expect(b.textContent).toEqual("toggle alignment");
      expect(b.classList.contains('right')).toBeTruthy();
      expect(ol.classList.contains('align-left')).toBeTruthy();

      b.click();

      expect(b.textContent).toEqual("toggle alignment");
      expect(b.classList.contains('center')).toBeTruthy();
      expect(ol.classList.contains('align-right')).toBeTruthy();

      b.click();

      expect(b.textContent).toEqual("toggle alignment");
      expect(b.classList.contains('left')).toBeTruthy();
      expect(ol.classList.contains('align-center')).toBeTruthy();

      b.click();

      expect(b.textContent).toEqual("toggle alignment");
      expect(b.classList.contains('right')).toBeTruthy();
      expect(ol.classList.contains('align-left')).toBeTruthy();

      document.body.removeChild(div);
    });
  });

  describe('KorAP.Panel.Pagination', function () {
    it('should be initializable', function () {
      // Create pagination element for pagination information
      let p = document.createElement('div');
      p.setAttribute('id', 'pagination')
      p.setAttribute('data-page',3);
      p.setAttribute('data-total',30);
      p.setAttribute('data-count',25);

      document.body.appendChild(p);

      // Create pagination class object
      var pagination = paginationClass.create();
      let list = pagination.actions().element();
      expect(pagination.type).toEqual('pagination');
      expect(list.classList.contains('button-group-list')).toBeTruthy();
      expect(list.classList.contains('visible')).toBeFalsy();

      pagination.addRandomPage();

      let clicked = false;
      pagination.actions().add(
        "test", {}, function () { clicked = true }
      );
      
      pagination.buttonGroup().element().firstChild.click();
      expect(list.classList.contains('visible')).toBeTruthy();

      expect(clicked).toBeFalsy();
      pagination.actions().element().children[4].click();
      expect(clicked).toBeTruthy();
      
      document.body.removeChild(p);
      document.body.removeChild(pagination.actions().element());
    });
  });
});
