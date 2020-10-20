define([
  'panel',
  'view',
  'view/match/meta',
  'view/match/relations',
  'view/match/tokentable',
  'view/result/koralquery',
  'util'], function (
    panelClass,
    viewClass,
    metaViewClass,
    relViewClass,
    tokenViewClass,
    kqViewClass) {

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

    it('should be minimizable', function () {
      var view = viewClass.create(['versuch']);
      var e = view.element();
      expect(e.classList.contains('show')).toBeTruthy();
      view.minimize();
      expect(e.classList.contains('show')).toBeFalsy();
    });
  });

  describe('KorAP.View.Match.Meta', function () {
    it('should be initializable', function () {
      let match = null;      
      let view = metaViewClass.create(match);
      expect(view).toBeTruthy();
    })
  });

  describe('KorAP.View.Match.Relation', function () {
    it('should be initializable', function () {
      let match = null;
      let view = relViewClass.create(match, "corenlp","l");
      expect(view).toBeTruthy();
    });

    it('should be visible', function () {
      let match = null;
      let view = relViewClass.create(match, "corenlp","l","spans");
      var el = view.show();
      expect(el.tagName).toEqual('DIV');
      expect(el.children[0].tagName).toEqual('H6');
      expect(el.children[0].getElementsByTagName('span')[0].textContent).toEqual('corenlp');
      expect(el.children[0].getElementsByTagName('span')[1].textContent).toEqual('l');
      expect(el.children[1].tagName).toEqual('DIV');
    })
  });

  describe('KorAP.View.Match.TokenTable', function () {
    it('should be initializable', function () {
      let match = null;      
      let view = tokenViewClass.create(match);
      expect(view).toBeTruthy();
    })

    it('should be visible', function () {
      let match = null;      
      let view = tokenViewClass.create(match);
      expect(view).toBeTruthy();

      let el = view.show();
      expect(el.tagName).toEqual("DIV");
      expect(el.classList.contains("loading")).toBeTruthy();
    })
  });

  describe('KorAP.View.Result.KoralQuery', function () {

    beforeEach(
      function () {
       KorAP.koralQuery = {} 
      }
    );

    afterEach(
      function () {
        KorAP.koralQuery = {} 
      }
    );
    
    it('should be initializable', function () {
      KorAP.koralQuery = {
        "test" : "cool"
      };
      var kq = kqViewClass.create();
      var content = kq.element().firstChild.textContent;
      expect(content).toMatch(/test/);
      expect(content).toMatch(/cool/);
    });

    it('should deal with XML fragments', function () {
      KorAP.koralQuery = {
        "test" : "Das ist <b>Super!</b>"
      };
      var kq = kqViewClass.create();
      var content = kq.element().firstChild.textContent;
      expect(content).toMatch(/test/);
      expect(content).toMatch(/Das ist <b>Super!<\/b>/);
    });
  });
});
