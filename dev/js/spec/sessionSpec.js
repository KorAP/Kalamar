define(['session'], function (sessionClass) {

  beforeEach(
    function () {
      document.cookie.split(';').forEach(
        function (i) {
          var pair = i.split('=');
          var name = pair[0].trim().toLowerCase();

        }
      );
    }
  );

  describe('KorAP.Session', function () {  
    it('should be initializable', function () {
      let s = sessionClass.create();
      
      expect(s).toBeTruthy();

      expect(s.toString().startsWith('korap=')).toBeTruthy();

      s = sessionClass.create('kalamar');
      
      expect(s).toBeTruthy();

      expect(s.toString().startsWith('kalamar=')).toBeTruthy();
    });

    it('should settable and gettable', function () {
      let s = sessionClass.create('koraptest');
      s.set("test1", "works");

      expect(s.get("test1")).toEqual("works");

      s.set("test2", "\"wor}ks\"");

      expect(s.get("test1")).toEqual("works");
      expect(s.get("test2")).toEqual("\"wor}ks\"");

      expect(s.toString().includes("test1")).toBeTruthy();
      expect(s.toString().includes("test2")).toBeTruthy();
      expect(s.toString().includes("works")).toBeTruthy();
      expect(s.toString().includes("%5C%22wor%7Dks%5C%22")).toBeTruthy();
    });

    it('should write to cookie', function () {
      let s = sessionClass.create('koraptest');
      s.clear();     
      expect(s.toString().includes("koraptest=%7B%7D;")).toBeTruthy();
      expect(document.cookie.includes("koraptest=")).toBeTruthy();
      s.set("test3", "works");
      expect(s.toString().includes("koraptest=%7B%7D;")).toBeFalsy();
      expect(s.toString().includes("koraptest=%7B%22test3%22%3A%22works%22%7D")).toBeTruthy();
      expect(document.cookie.includes("koraptest=%7B%22test3%22%3A%22works%22%7D")).toBeTruthy();
      s.clear();     
      expect(document.cookie.includes("koraptest=")).toBeTruthy();
      expect(s.toString()).toEqual("koraptest=%7B%7D;");
    });   
  })
});
