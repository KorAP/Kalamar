define(['tutorial','util'], function (tutClass) {
  describe('KorAP.Tutorial', function () {

    const clean = function () {
      ['tutorial','q-field','ql-field'].forEach(
        function (id) {
          const el = document.getElementById(id);
          if (el != null) {
            el.parentNode.removeChild(el);
          };
        }
      );
    };
    
    beforeEach(clean);
    afterEach(clean);

    function queryFactory (query, ql = 'poliqarp', cutoff = true) {
      const q = document.createElement('div');
      q.setAttribute('data-query', query);
      q.setAttribute('data-query-language', ql);
      q.setAttribute('data-query-cutoff', cutoff);
      return q;
    };
    
    it('should be initializable', function () {
      tutObj = document.createElement('div');
      let tut = tutClass.create(tutObj);
      expect(tut).toBeFalsy();

      tutObj = document.createElement('div');
      tutObj.setAttribute('href', '/doc/ql');
      tut = tutClass.create(tutObj);
      expect(tut).toBeTruthy();
      tut._session.clear();
    });

    it('should rewrite to JS open', function () {
      tutObj = document.createElement('div');
      tutObj.setAttribute('href', 'http://example.com');
      expect(tutObj.getAttribute('href')).toBeTruthy();
      expect(tutObj.onclick).toBeNull();
      var tut = tutClass.create(tutObj);
      expect(tutObj.getAttribute('href')).toBeFalsy();
      expect(tutObj.onclick).not.toBeNull();
      tut._session.clear();
    });

    it('should create an embedded tutorial', function () {      
      expect(document.getElementById('tutorial')).toBeFalsy();
      
      tutObj = document.createElement('div');
      tutObj.setAttribute('href', '/doc/ql');
      let tut = tutClass.create(tutObj);

      let tutEmb = document.getElementById('tutorial');
      expect(tutEmb).toBeTruthy();

      expect(tutEmb.style.display).toEqual('none');
      tut._session.clear();
    });

    it('should be visible', function () {
      const tutE = document.createElement('div');
      tutE.setAttribute('href', '/doc/ql');
      let tut = tutClass.create(tutE);
      tut._session.clear();
      let tutEmb = document.getElementById('tutorial');

      expect(tutEmb.style.display).toEqual('none');
      expect(tutEmb.getElementsByTagName('IFRAME')[0]).toBeUndefined();

      tut.show();

      expect(tutEmb.style.display).toEqual('block');

      let iframe = tutEmb.getElementsByTagName('IFRAME')[0];
      expect(iframe).not.toBeUndefined();
      expect(iframe.getAttribute('src')).toEqual('/doc/ql?embedded=true');
      tut._session.clear();
    });

    it('should be visible by click', function () {
      const tutE = document.createElement('div');
      tutE.setAttribute('href', '/doc/ql');
      let tut = tutClass.create(tutE);
      tut._session.clear();
      let tutEmb = document.getElementById('tutorial');

      expect(tutEmb.style.display).toEqual('none');
      expect(tutEmb.getElementsByTagName('IFRAME')[0]).toBeUndefined();

      tutE.click();

      expect(tutEmb.style.display).toEqual('block');

      let iframe = tutEmb.getElementsByTagName('IFRAME')[0];
      expect(iframe).not.toBeUndefined();
      expect(iframe.getAttribute('src')).toEqual('/doc/ql?embedded=true');
      tut._session.clear();
    });
    
    it('should be hidable', function () {
      const tutE = document.createElement('div');
      tutE.setAttribute('href', '/doc/ql');
      let tut = tutClass.create(tutE);
      tut._session.clear();
      let tutEmb = document.getElementById('tutorial');

      tut.show();
      expect(tutEmb.style.display).toEqual('block');

      let iframe = tutEmb.getElementsByTagName('IFRAME')[0];
      expect(iframe).not.toBeUndefined();

      tut.hide();
      expect(tutEmb.style.display).toEqual('none');

      iframe = tutEmb.getElementsByTagName('IFRAME')[0];
      expect(iframe).not.toBeUndefined();
      tut._session.clear();
    });

    it('should remember page', function () {
      const tutE = document.createElement('div');
      tutE.setAttribute('href', '/doc/ql');
      let tut = tutClass.create(tutE);
      tut._session.clear();

      expect(tut.getPage()).toBeUndefined();

      tut.setPage('poliqarp');
      expect(tut.getPage()).toEqual('poliqarp');

      // Remember section
      let sec = document.createElement('SECTION');
      sec.setAttribute('id', 'cosmas-ii');    

      tut.setPage(sec);
      expect(tut.getPage().endsWith('#cosmas-ii')).toBeTruthy();

      // Check an inner obj
      let doc = document.createElement('div');

      // Create wrappers
      let docP = document.createElement('div');
      docP.appendChild(sec);
      let pre = sec = sec.addE('pre');
      sec = sec.addE('section');
      sec.appendChild(doc);

      expect(docP.outerHTML).toEqual(
        '<div><section id="cosmas-ii"><pre><section><div>' +
          '</div></section></pre></section></div>'
      );

      tut.setPage(doc);
      expect(tut.getPage().endsWith('#cosmas-ii')).toBeTruthy();

      pre.setAttribute('id', 'middle');

      tut.setPage(doc);
      expect(tut.getPage().endsWith('#middle')).toBeTruthy();
      tut._session.clear();
    });

    it('should enable embedded queries', function () {

      // qField
      const qField = document.createElement('input');
      qField.setAttribute('id','q-field');
      qField.value = 'xxx';
      document.body.appendChild(qField);

      // qlSelect
      const qlField = document.createElement('select');
      qlField.setAttribute('id','ql-field');
      let opt = qlField.addE('option');
      opt.setAttribute('value', 'poliqarp');
      opt = qlField.addE('option');
      opt.setAttribute('value', 'cosmas-ii');
      opt.selected = true;
      document.body.appendChild(qlField);

      expect(qlField.options[qlField.selectedIndex].value).toEqual('cosmas-ii');

      const tutE = document.createElement('div');
      tutE.setAttribute('href', '/doc/ql');

      let tut = tutClass.create(tutE);
      tut._session.clear();

      let tutEmb = document.getElementById('tutorial');
      expect(tutEmb).toBeTruthy();

      expect(tutEmb.style.display).toEqual('none');

      tut.show();

      expect(tutEmb.style.display).toEqual('block');
      expect(qField.value).toEqual("xxx");
      
      let q = queryFactory("[orth=works]");
      tut.useQuery(q);
      expect(qField.value).toEqual("[orth=works]");
      expect(qlField.options[qlField.selectedIndex].value).toEqual('poliqarp');
      expect(tutEmb.style.display).toEqual('none');
      tut._session.clear();
    });

    it('should initialize queries', function () {
      const tutE = document.createElement('div');
      tutE.setAttribute('href', '/doc/ql');
      let tut = tutClass.create(tutE);
      tut._session.clear();
      let tutEmb = document.getElementById('tutorial');

      let queries = document.createElement('div');

      let pre0 = document.createElement('div');
      queries.appendChild(pre0);
      
      let pre1 = document.createElement('pre');
      pre1.classList.add('query','tutorial');
      queries.appendChild(pre1);
      
      let pre2 = document.createElement('pre');
      pre2.classList.add('query','tutorial','unsupported');
      queries.appendChild(pre2);

      let pre3 = document.createElement('div');
      queries.appendChild(pre3);

      let pre4 = document.createElement('pre');
      pre4.classList.add('query','tutorial');
      queries.appendChild(pre4);

      expect(pre0.onclick).toBeNull();
      expect(pre1.onclick).toBeNull();
      expect(pre2.onclick).toBeNull();
      expect(pre3.onclick).toBeNull();
      expect(pre4.onclick).toBeNull();
      
      tut.initQueries(queries);

      expect(pre0.onclick).toBeNull();
      expect(pre1.onclick).not.toBeNull();
      expect(pre2.onclick).toBeNull();
      expect(pre3.onclick).toBeNull();
      expect(pre4.onclick).not.toBeNull();      
      tut._session.clear();
    });

    it('should initialize doc-links', function () {
      const tutE = document.createElement('div');
      tutE.setAttribute('href', '/doc/ql');
      let tut = tutClass.create(tutE);
      tut._session.clear();
      let tutEmb = document.getElementById('tutorial');

      let docLinks = document.createElement('div');

      let a;
      let l1 = a = docLinks.addE('a');
      a.setAttribute('href','example:1');
      let l2 = a = docLinks.addE('a');
      a.setAttribute('href','example:2');
      a.classList.add('doc-link');
      let l3 = a = docLinks.addE('a');
      a.setAttribute('href','example:3');
      let l4 = a = docLinks.addE('a');
      a.setAttribute('href','example:4');
      a.classList.add('doc-link');

      expect(l1.onclick).toBeNull();
      expect(l2.onclick).toBeNull();
      expect(l3.onclick).toBeNull();
      expect(l4.onclick).toBeNull();

      tut.initDocLinks(docLinks);

      expect(l1.onclick).toBeNull();
      expect(l2.onclick).not.toBeNull();
      expect(l3.onclick).toBeNull();
      expect(l4.onclick).not.toBeNull();

      // Click
      expect(tut.getPage()).toEqual(undefined);
      l2.onclick();
      expect(tut.getPage()).toEqual('example:2');
      tut._session.clear();
    });
  });
});
