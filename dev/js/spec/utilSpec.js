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
  });

    describe('KorAP.util.initTogllePwdVisibility', function () {
        it('should toggle', function () {
            const div = document.createElement('div');
            let input = div.addE('input');
            input.setAttribute('type', 'password');
            input.setAttribute('class', 'show-pwd');

            expect(div.children.length).toEqual(1);
            initTogglePwdVisibility(div);
            expect(div.children.length).toEqual(2);
            expect(div.lastChild.tagName).toEqual("A");
            expect(div.lastChild.classList.contains("hide")).toBeFalsy();
            expect(input.getAttribute("type")).toEqual("password");

            div.lastChild.click();

            expect(input.getAttribute("type")).toEqual("text");
            expect(div.lastChild.classList.contains("hide")).toBeTruthy();
        });
    });

    describe('KorAP.util.initCopyToClipboard', function () {
      it('should be initializable', function () {
          const div = document.createElement('div');
          let input = div.addE('input');
          input.value = "abcde";
          input.setAttribute('type', 'text');
          input.setAttribute('class', 'copy-to-clipboard');
          expect(div.children.length).toEqual(1);
          initCopyToClipboard(div);
          expect(div.children.length).toEqual(2);
          expect(div.lastChild.tagName).toEqual("A");
      });

      // document.execCommand() can't be tested without user
      // intervention.
  });
});
