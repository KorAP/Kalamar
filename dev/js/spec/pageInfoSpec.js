define(['pageInfo'], function (pageInfoClass) {

  describe('KorAP.PageInfo', function () {
    it('should be initializable', function () {
      let pi = pageInfoClass.create();
      expect(pi.total()).toEqual(0);
      expect(pi.count()).toEqual(0);
      expect(pi.page()).toEqual(0);
    });

    it('should be read the correct values', function () {

      // Create pagination element for pagination information
      let p = document.createElement('div');
      p.setAttribute('id', 'pagination')
      p.setAttribute('data-page',3);
      p.setAttribute('data-total',30);
      p.setAttribute('data-count',25);

      document.body.appendChild(p);
      
      pi = pageInfoClass.create();
      expect(pi.total()).toEqual(30);
      expect(pi.count()).toEqual(25);
      expect(pi.page()).toEqual(3);

      // Recreate initial state
      document.body.removeChild(p);
    });
  });
});
