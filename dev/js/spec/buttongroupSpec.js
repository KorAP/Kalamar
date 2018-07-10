define(['buttongroup'], function (buttonGroupClass) {

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
      group.bind(fun);

      group.add('Incr', undefined, function (e) {
        // increment on bind object
        this.incr()
      });

      // Click on the button
      group.element().firstChild.click();
      expect(fun.count).toEqual(1);
    });
  });
});
