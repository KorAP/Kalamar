define(['buttongroup','buttongroup/menu','menu/item','state'], function (buttonGroupClass, buttonGroupMenuClass, defaultItemClass, stateClass) {

  var FunObj = {
    count : 0,
    create : function () {
      return Object.create(this);
    },
    incr : function () {
      this.count++;
    }
  };
  
  describe('KorAP.ButtonGroup', function () {

    it('should be initializable', function () {
      var group = buttonGroupClass.create(['action', 'bottom']);
      var el = group.element();
      expect(el.tagName).toEqual('DIV');
      expect(el.firstChild).toBeNull();
      expect(el.classList.contains('action')).toBeTruthy();
      expect(el.classList.contains('bottom')).toBeTruthy();
      expect(el.classList.contains('button-group')).toBeTruthy();
    });

    it('should be expandable', function () {
      var group = buttonGroupClass.create();
      expect(group.element().classList.contains('button-group')).toBeTruthy();

      group.add('Meta', { 'cls':['meta', 'top']}, function (e) {});

      var btn = group.element().firstChild;
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.classList.contains('meta')).toBeTruthy();
      expect(btn.classList.contains('top')).toBeTruthy();
      expect(btn.innerText).toEqual('Meta');
    });

    it('should be clearable', function () {
      var group = buttonGroupClass.create();
      expect(group.element().classList.contains('button-group')).toBeTruthy();

      group.add('Meta', {'cls':['meta', 'top']}, function (e) {});
      group.add('Mate', {'cls':['mate']}, function (e) {});

      var btn = group.element().children[0];
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.classList.contains('meta')).toBeTruthy();
      expect(btn.classList.contains('top')).toBeTruthy();
      expect(btn.innerText).toEqual('Meta');

      btn = group.element().children[1];
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.classList.contains('mate')).toBeTruthy();
      expect(btn.classList.contains('top')).toBeFalsy();
      expect(btn.innerText).toEqual('Mate');

      // clear button
      group.clear();

      expect(group.element().children.length).toEqual(0);

      group.add('New', {'cls':['new']}, function (e) {});

      btn = group.element().children[0];
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.classList.contains('new')).toBeTruthy();
      expect(btn.classList.contains('top')).toBeFalsy();
      expect(btn.innerText).toEqual('New');
    });

    
    it('should listen to button clicks', function () {
      var group = buttonGroupClass.create();

      var count = 0;

      group.add('Meta', undefined, function () {
        count++;
      });

      expect(count).toEqual(0);

      // Click on the button
      group.element().firstChild.click();

      expect(count).toEqual(1);
    });

    it('should respect binds', function () {
      var group = buttonGroupClass.create();
      fun = FunObj.create();
      expect(fun.count).toEqual(0);

      // Bind group to another object
      var group2 = group.bind(fun);
      expect(group2).toEqual(group);
      expect(group.bind()).toEqual(fun);

      group.add('Incr', undefined, function (e) {
        // increment on bind object
        this.incr()
      });

      // Click on the button
      group.element().firstChild.click();
      expect(fun.count).toEqual(1);
    });

    it('should add icon', function () {
      var group = buttonGroupClass.create();
      expect(group.element().classList.contains('button-group')).toBeTruthy();

      group.add('Meta', {'cls':['meta'], 'icon': 'metaicon'}, function (e) {});

      var btn = group.element().firstChild;
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.getAttribute('data-icon')).toEqual('metaicon');
      expect(btn.getAttribute('title')).toEqual('Meta');
      expect(btn.classList.contains('meta')).toBeTruthy();
      expect(btn.innerText).toEqual('Meta');
    });

    it('should add description', function () {
      var group = buttonGroupClass.create();
      expect(group.element().classList.contains('button-group')).toBeTruthy();

      group.add('Meta', {'cls':['meta'], 'icon': 'metaicon', 'desc': 'MyMeta'}, function (e) {});

      var btn = group.element().firstChild;
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.getAttribute('data-icon')).toEqual('metaicon');
      expect(btn.getAttribute('title')).toEqual('MyMeta');
      expect(btn.classList.contains('meta')).toBeTruthy();
      expect(btn.innerText).toEqual('Meta');
    });
    
    it('should open lists', function () {
      var group = buttonGroupClass.create();
      expect(group.element().classList.contains('button-group')).toBeTruthy();

      var b = group.addList('More', {'cls':['more']});
      var list = b.list;

      list.readItems([
        ['cool', 'cool', function () { }],
        ['very cool', 'veryCool', function () { }]
      ]);

      var btn = group.element().firstChild;
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.classList.contains('more')).toBeTruthy();
      expect(btn.innerText).toEqual('More');

      expect(list.element().classList.contains('visible')).toBeFalsy();
      
      // Click to show menu
      btn.click();

      expect(list.element().classList.contains('visible')).toBeTruthy();

      expect(list.element().children[1].children[0].innerText).toEqual('cool--');
      expect(list.element().children[1].children[1].innerText).toEqual('very cool--');

      document.body.removeChild(list.element());
    });

    it('should add to lists', function () {
      var group = buttonGroupClass.create();
      expect(group.element().classList.contains('button-group')).toBeTruthy();

      var b = group.addList('More', {'cls':['more']});
      var list = b.list;

      let x = 'empty';
      list.add('Meta1', {'cls':['meta'], 'icon': 'metaicon'}, function (e) {
        x = 'meta1';
      });
      list.add('Meta2', {'cls':['meta'], 'icon': 'metaicon'}, function (e) {
        x = 'meta2'
      });

      var btn = group.element().firstChild;
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.classList.contains('more')).toBeTruthy();
      expect(btn.innerText).toEqual('More');

      expect(list.element().classList.contains('visible')).toBeFalsy();
      
      // Click to show menu
      btn.click();

      expect(list.element().classList.contains('visible')).toBeTruthy();
      expect(directElementChildrenByTagName(list.element(),"li")[0].innerHTML).toEqual('Meta1');
      expect(directElementChildrenByTagName(list.element(),"li")[1].innerHTML).toEqual('Meta2');

      expect(x).toEqual('empty');
      directElementChildrenByTagName(list.element(),"li")[0].click();
      expect(x).toEqual('meta1');

      expect(list.element().classList.contains('visible')).toBeFalsy();

      // Click to show menu
      btn.click();

      expect(list.element().classList.contains('visible')).toBeTruthy();
      directElementChildrenByTagName(list.element(),"li")[1].click();
      expect(x).toEqual('meta2');

      expect(list.element().classList.contains('visible')).toBeFalsy();

      expect(list.element().children[1].children[0].innerText).toEqual('Meta1--');
      expect(list.element().children[1].children[1].innerText).toEqual('Meta2--');

      document.body.removeChild(list.element());
    });

    
    it('should support toggle buttons', function () {
      var group = buttonGroupClass.create();

      let s = stateClass.create();

      expect(s.get()).toBeFalsy();
      
      group.addToggle('example',{'cls':["examplecls"]}, s);

      let e = group.element();

      expect(e.firstChild.getAttribute("title")).toBe("example");
      expect(e.firstChild.classList.contains("examplecls")).toBeTruthy();

      expect(e.firstChild.firstChild.classList.contains("check")).toBeTruthy();
      expect(e.firstChild.firstChild.classList.contains("button-icon")).toBeTruthy();
      expect(e.firstChild.lastChild.textContent).toBe("example");

      // Check state
      expect(s.get()).toBeFalsy();
      expect(e.firstChild.firstChild.classList.contains("checked")).toBeFalsy();

      // Click on the button
      e.firstChild.click();

      // Check state
      expect(s.get()).toBeTruthy();
      expect(e.firstChild.firstChild.classList.contains("checked")).toBeTruthy();


      group.addToggle('example2',{'cls':["examplecls"], "desc":"Haha"}, s);

      e = group.element();

      expect(e.children[1].getAttribute("title")).toBe("Haha");
    });

    it('should allow adoption', function () {

      const el = document.createElement('div');
      
      const group = buttonGroupClass.adopt(el);

      group.add('Meta', {'cls':['meta', 'top']}, function (e) {});
      group.add('Mate', {'cls':['mate']}, function (e) {});

      var btn = group.element().children[0];
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.classList.contains('meta')).toBeTruthy();
      expect(btn.classList.contains('top')).toBeTruthy();
      expect(btn.innerText).toEqual('Meta');

      btn = group.element().children[1];
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.classList.contains('mate')).toBeTruthy();
      expect(btn.classList.contains('top')).toBeFalsy();
      expect(btn.innerText).toEqual('Mate');
    });

    it('should make anchor element definable', function () {

      const el = document.createElement('div');
      const c1 = el.appendChild(document.createElement('c1'));
      const c2 = el.appendChild(document.createElement('c2'));
      const c3 = el.appendChild(document.createElement('c3'));

      let group = buttonGroupClass.adopt(el);
      expect(group.anchor(null)).toBeFalsy();
      
      group = buttonGroupClass.adopt(el);
      expect(group.anchor(c3)).toBeTruthy();

      group.add('Meta', {'cls':['meta', 'top']}, function (e) {});
      group.add('Mate', {'cls':['mate']}, function (e) {});

      let btn = group.element().children[0];
      expect(btn.tagName).toEqual('C1');

      btn = group.element().children[1];
      expect(btn.tagName).toEqual('C2');
      
      btn = group.element().children[2];
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.classList.contains('meta')).toBeTruthy();
      expect(btn.classList.contains('top')).toBeTruthy();
      expect(btn.innerText).toEqual('Meta');

      btn = group.element().children[3];
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.classList.contains('mate')).toBeTruthy();
      expect(btn.classList.contains('top')).toBeFalsy();
      expect(btn.innerText).toEqual('Mate');

      btn = group.element().children[4];
      expect(btn.tagName).toEqual('C3');
    });
  });

  describe('KorAP.ButtonGroup.Menu', function () {
    it('should reposition', function () {
      const menu = buttonGroupMenuClass.create([["hallo", undefined, function () {}]], defaultItemClass);
      const div = document.createElement('div');

      document.body.appendChild(div);

      div.style.position = 'absolute';
      div.style.display = 'block';
      div.style.left = '14px';
      div.style.top = '20px';
      div.style.width = '40px';
      div.style.height = '30px';

      menu.show();

      // 000
      menu._repos(div);
      let elem = menu.element();
      const fffl = elem.style.left;
      const ffft = elem.style.top;

      // 100
      menu.openAt(true, false, false);
      menu._repos(div);
      elem = menu.element();
      const tffl = elem.style.left;
      expect(tffl).not.toEqual(fffl);


      // 011
      menu.openAt(false, true, true);
      menu._repos(div);
      elem = menu.element();
      const fttt = elem.style.top;
      expect(fttt).not.toEqual(ffft);

      document.body.removeChild(div);
      document.body.removeChild(elem);
    });
  });
});
