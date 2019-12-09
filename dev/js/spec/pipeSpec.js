define(['pipe'], function (pipeClass) {

  describe('KorAP.Pipe', function () {
    it('should be initializable', function () {
      let p = pipeClass.create();
      expect(p.size()).toEqual(0);
    });

    it('should be appendable', function () {
      let p = pipeClass.create();
      expect(p.size()).toEqual(0);
      expect(p.toString()).toEqual('');
      p.append('service1');
      expect(p.size()).toEqual(1);
      expect(p.toString()).toEqual('service1');
      p.append('service2');
      expect(p.size()).toEqual(2);
      expect(p.toString()).toEqual('service1,service2');

      p.append('');
      expect(p.size()).toEqual(2);
      expect(p.toString()).toEqual('service1,service2');
    });
    
    it('should be prependable', function () {
      let p = pipeClass.create();
      expect(p.size()).toEqual(0);
      expect(p.toString()).toEqual('');
      p.prepend('service1');
      expect(p.size()).toEqual(1);
      expect(p.toString()).toEqual('service1');
      p.prepend('service2');
      expect(p.size()).toEqual(2);
      expect(p.toString()).toEqual('service2,service1');

      p.prepend('');
      expect(p.size()).toEqual(2);
      expect(p.toString()).toEqual('service2,service1');
    });

    it('should be trimmed', function () {
      let p = pipeClass.create();
      expect(p.size()).toEqual(0);
      expect(p.toString()).toEqual('');
      p.prepend('  service1  ');
      expect(p.size()).toEqual(1);
      expect(p.toString()).toEqual('service1');

      p.prepend("\t service2 \t");
      expect(p.size()).toEqual(2);
      expect(p.toString()).toEqual('service2,service1');

      p.append('      ');
      expect(p.size()).toEqual(2);
      expect(p.toString()).toEqual('service2,service1');
    });
    
    it('should be deletable', function () {
      let p = pipeClass.create();
      p.append('service1');
      p.append('service2');
      p.append('service3');
      expect(p.toString()).toEqual('service1,service2,service3');
      p.remove('service2')
      expect(p.toString()).toEqual('service1,service3');

      p = pipeClass.create();
      p.append('service1');
      p.append('service2');
      p.append('service3');
      expect(p.toString()).toEqual('service1,service2,service3');
      p.remove('service1')
      expect(p.toString()).toEqual('service2,service3');

      p = pipeClass.create();
      p.append('service1');
      p.append('service2');
      p.append('service3');
      expect(p.toString()).toEqual('service1,service2,service3');
      p.remove('service3')
      expect(p.toString()).toEqual('service1,service2');      

      p = pipeClass.create();
      p.append('service1');
      p.append('service2');
      p.append('service3');
      expect(p.toString()).toEqual('service1,service2,service3');
      p.remove('service0')
      expect(p.toString()).toEqual('service1,service2,service3');      
    });
  });
});
