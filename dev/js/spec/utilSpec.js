define(['util'], function () {
  describe('KorAP.util', function () {

    it('should quote', function () {
      expect('Baum'.quote()).toEqual('"Baum"');
      expect('B"a"um'.quote()).toEqual('"B\\"a\\"um"');
    });

    it('should escape regex', function () {
      expect('aaa/bbb\/ccc'.escapeRegex()).toEqual('aaa\\/bbb\\/ccc');
    });

    it('should slugify', function () {
      expect('/korap/test'.slugify()).toEqual('koraptest');
      expect('korap test'.slugify()).toEqual('korap-test');
      expect('Korap Test'.slugify()).toEqual('korap-test');
    });
  })
});
