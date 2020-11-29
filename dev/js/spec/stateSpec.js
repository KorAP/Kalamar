define(['state'], function (stateClass) {

  describe('KorAP.State', function () { //https://www.bignerdranch.com/blog/why-do-javascript-test-frameworks-use-describe-and-beforeeach/
    it('should be initializable', function () {
      let s = stateClass.create();
      expect(s.get()).toBeFalsy(); //Warum ist die Klammerung so?

      s = stateClass.create(true);
      expect(s.get()).toBeTruthy();
    });

    it('should be settable and gettable', function () {
      let s = stateClass.create();
      expect(s.get()).toBeFalsy();
      s.set(true);
      expect(s.get()).toBeTruthy();
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
        setState : function (value) { // throws an error if I were to set setState to a value, not a function, but does that matter?
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
});
