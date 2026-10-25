/**
 * Test suite for the AMD copy of the relative frequency view.
 * The canonical ES6 version is tested in
 * dev/js/src-lib/frequency/test/frequencySpec.js.
 */
define(['view/result/frequency', 'view/vc/corpstatv', 'api'], function (frequencyModule, corpStatVClass) {

  const frequencyClass = frequencyModule.default;

  function result (count, state) {
    const element = document.createElement('div');
    element.setAttribute('data-hit-count', count);
    element.setAttribute('data-count-state', state);
    const found = document.createElement('p');
    found.className = 'found';
    element.appendChild(found);
    document.body.appendChild(element);
    return element;
  };

  describe('KorAP.Frequency', function () {
    let elements = [];

    afterEach(function () {
      elements.forEach(function (e) { e.remove() });
      elements = [];
    });

    function create (count, state, cq) {
      const element = result(count, state);
      elements.push(element);
      return frequencyClass.create(element, cq);
    };

    it('should only offer an action for counted results', function () {
      expect(create(0, 'exact', 'a = b')).toBeNull();
      expect(create(-1, 'unknown', 'a = b')).toBeNull();
      expect(create(12, 'exact', null)).toBeNull();
      expect(create(12, 'exact', 'a = b')).not.toBeNull();
    });

    it('should show matches per million tokens on demand', function (done) {
      spyOn(KorAP.API, 'getCorpStat').and.callFake(function (cq, cb) {
        cb({ tokens: 1000000000 });
      });
      const view = create(12346, 'exact', 'amd exact case');
      expect(KorAP.API.getCorpStat).not.toHaveBeenCalled();
      view.button.click();
      setTimeout(function () {
        expect(view.output.textContent).toEqual('12.35 IPM');
        expect(view.button.hidden).toBe(true);
        done();
      }, 0);
    });

    it('should not round a lower bound up', function (done) {
      spyOn(KorAP.API, 'getCorpStat').and.callFake(function (cq, cb) {
        cb({ tokens: 1000000007 });
      });
      const view = create(428571433, 'lower-bound', 'amd lower bound case');
      view.button.click();
      setTimeout(function () {
        expect(view.output.textContent).toEqual('at least 428,571.42 IPM');
        done();
      }, 0);
    });

    it('should share corpus statistics with the corpus statistics panel', function (done) {
      spyOn(KorAP.API, 'getCorpStat').and.callFake(function (cq, cb) {
        cb({ tokens: 2000000 });
      });
      const view = create(5, 'exact', 'amd shared case');
      corpStatVClass.getStatistic.call({ vc: { toQuery: function () { return 'amd shared case' } } }, function (data) {
        expect(data.tokens).toEqual(2000000);
        expect(view.output.textContent).toEqual('2.5 IPM');
        view.load();
        setTimeout(function () {
          expect(KorAP.API.getCorpStat.calls.count()).toEqual(1);
          done();
        }, 0);
      });
    });
  });
});
