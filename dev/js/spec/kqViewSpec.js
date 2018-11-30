define(['view/result/koralquery','util'], function (kqClass) {
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
      var kq = kqClass.create();
      var content = kq.element().firstChild.textContent;
      expect(content).toMatch(/test/);
      expect(content).toMatch(/cool/);
    });

    it('should deal with XML fragments', function () {
      KorAP.koralQuery = {
        "test" : "Das ist <b>Super!</b>"
      };
      var kq = kqClass.create();
      var content = kq.element().firstChild.textContent;
      expect(content).toMatch(/test/);
      expect(content).toMatch(/Das ist <b>Super!<\/b>/);
    });

  });
});
