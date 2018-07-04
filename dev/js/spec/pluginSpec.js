define(['plugin/server','plugin/widget'], function (pluginServerClass, widgetClass) {

  describe('KorAP.Plugin.Server', function () {

    it('should be initializable', function () {
      var manager = pluginServerClass.create();
      expect(manager).toBeTruthy();
      manager.destroy();
    });

    it('should add a widget', function () {
      var manager = pluginServerClass.create();
      var div = document.createElement("div");
      var id = manager.addWidget(div, 'about:blank');
      expect(id).toMatch(/^id-/);
      expect(div.firstChild.tagName).toEqual("IFRAME");
      manager.destroy();
    });
  });

  describe('KorAP.Plugin.Widget', function () {
    it('should be initializable', function () {
      var widget = widgetClass.create();
      expect(widget).toBeTruthy();
    });
  });

});
