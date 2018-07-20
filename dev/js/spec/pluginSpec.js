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
      expect(div.firstChild.classList.contains('widget')).toBeTruthy();
      expect(div.firstChild.firstChild.tagName).toEqual("IFRAME");
      manager.destroy();
    });

    it('should fail on invalid registries', function () {
      var manager = pluginServerClass.create();

      expect(
	      function() { manager.register({}) }
      ).toThrow(new Error("Missing name of plugin"));

      expect(
	      function() { manager.register({
          name : 'Example',
          embed : ''
        })}
      ).toThrow(new Error("Embedding of plugin is no list"));

      expect(
	      function() { manager.register({
          name : 'Example',
          embed : [{
            panel : ''
          }]
        })}
      ).toThrow(new Error("Panel for plugin is invalid"));

    });
  });

  describe('KorAP.Plugin.Widget', function () {
    it('should be initializable', function () {
      var widget = widgetClass.create();
      expect(widget).toBeTruthy();
    });
  });

});
