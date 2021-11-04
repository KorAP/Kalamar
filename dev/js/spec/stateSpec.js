define(['state','state/manager'], function (stateClass, stateManagerClass) {

  describe('KorAP.State', function () {
    it('should be initializable', function () {
      let s = stateClass.create();
      expect(s.get()).toBeFalsy();

      s = stateClass.create(true);
      expect(s.get()).toBeTruthy();
    });

    it('should be settable and gettable', function () {
      let s = stateClass.create();
      expect(s.get()).toBeFalsy();
      s.set(true);
      expect(s.get()).toBeTruthy();
    });

    it('should accept a default value', function () {
      let s = stateClass.create([true, false]);
      expect(s.get()).toBeTruthy();
      s.set(false);
      expect(s.get()).toBeFalsy();

      s = stateClass.create([true, false]);
      s.setIfNotYet(false);
      expect(s.get()).toBeFalsy();

      s.setIfNotYet(true);
      expect(s.get()).toBeFalsy();
    });
    
    it('should be associatable', function () {
      let s = stateClass.create();

      // Create
      let obj1 = {
        x : false,
        setState : function (value) {
          this.x = value;
        }
      };

      // Create
      let obj2 = {
        x : true,
        setState : function (value) {
          this.x = value;
        }
      };

      expect(s.associates()).toEqual(0);
      expect(s.get()).toBeFalsy();
      expect(obj1.x).toBeFalsy();
      expect(obj2.x).toBeTruthy();

      // Associate object with state
      s.associate(obj1);
      expect(s.associates()).toEqual(1);
      s.associate(obj2);
      expect(s.associates()).toEqual(2);

      expect(s.get()).toBeFalsy();
      expect(obj1.x).toBeFalsy();
      expect(obj2.x).toBeFalsy();

      s.set(true);

      expect(s.get()).toBeTruthy();
      expect(obj1.x).toBeTruthy();
      expect(obj2.x).toBeTruthy();
    });

    it('should be clearable', function () {
      let s = stateClass.create();

      // Create
      let obj1 = {
        x : false,
        setState : function (value) {
          this.x = value;
        }
      };

      // Create
      let obj2 = {
        x : true,
        setState : function (value) {
          this.x = value;
        }
      };

      expect(s.associates()).toEqual(0);
      expect(s.get()).toBeFalsy();
      expect(obj1.x).toBeFalsy();
      expect(obj2.x).toBeTruthy();

      // Associate object with state
      s.associate(obj1);
      expect(s.associates()).toEqual(1);
      s.associate(obj2);
      expect(s.associates()).toEqual(2);

      expect(s.get()).toBeFalsy();
      expect(obj1.x).toBeFalsy();
      expect(obj2.x).toBeFalsy();

      s.clear();

      s.set(true);
      expect(s.get()).toBeTruthy();
      expect(obj1.x).toBeFalsy();
      expect(obj2.x).toBeFalsy();

      s.set(false);
      expect(s.get()).toBeFalsy();
      expect(obj1.x).toBeFalsy();
      expect(obj2.x).toBeFalsy();
    });

    it('should roll', function () {
      let s = stateClass.create(['der','alte','mann']);

      expect(s.get()).toEqual('der');
      s.roll();
      expect(s.get()).toEqual('alte');
      s.roll();
      expect(s.get()).toEqual('mann');
      s.roll();
      expect(s.get()).toEqual('der');
      s.roll();
      expect(s.get()).toEqual('alte');

      s.set('alte');
      expect(s.get()).toEqual('alte');
      s.roll();
      expect(s.get()).toEqual('mann');
    });
  });

  describe('KorAP.State.Manager', function () {

    const el = document.createElement('input');

    it('should be initializable', function () {

      let sm = stateManagerClass.create(el);
      expect(sm).toBeTruthy();

      expect(sm.toString()).toEqual("{}");
    });


    it('should be extensible', function () {
      const sm = stateManagerClass.create(el);
      expect(sm).toBeTruthy();

      const s1 = sm.newState('test', [1,2,3]);
      
      expect(sm.toString()).toEqual("{\"test\":1}");

      s1.set(2);

      expect(sm.toString()).toEqual("{\"test\":2}");

      s1.set(3);

      expect(sm.toString()).toEqual("{\"test\":3}");

      const s2 = sm.newState('glemm', [true,false]);

      let serial = JSON.parse(sm.toString());   
      expect(serial["test"]).toEqual(3);
      expect(serial["glemm"]).toEqual(true);

      s2.set(false);

      serial = JSON.parse(sm.toString());   
      expect(serial["test"]).toEqual(3);
      expect(serial["glemm"]).toEqual(false);
    });
  });
});
