define(['buttongroup','state'], function (buttonGroupClass, stateClass) {

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

      group.add('Meta', ['meta', 'top'], function (e) {});

      var btn = group.element().firstChild;
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.classList.contains('meta')).toBeTruthy();
      expect(btn.classList.contains('top')).toBeTruthy();
      expect(btn.innerText).toEqual('Meta');
    });

    it('should be clearable', function () {
      var group = buttonGroupClass.create();
      expect(group.element().classList.contains('button-group')).toBeTruthy();

      group.add('Meta', ['meta', 'top'], function (e) {});
      group.add('Mate', ['mate'], function (e) {});

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

      group.add('New', ['new'], function (e) {});

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

      group.add('Meta', ['meta'], function (e) {}, 'metaicon');

      var btn = group.element().firstChild;
      expect(btn.tagName).toEqual('SPAN');
      expect(btn.getAttribute('data-icon')).toEqual('metaicon');
      expect(btn.classList.contains('meta')).toBeTruthy();
      expect(btn.innerText).toEqual('Meta');
    });

    
    it('should open lists', function () {
      
    });

    it('should support toggle buttons', function () {
      var group = buttonGroupClass.create();

      let s = stateClass.create();

      expect(s.get()).toBeFalsy();
      
      group.addToggle('example',["examplecls"],s);

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
    });
  });
});
