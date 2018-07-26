define(['plugin/server','plugin/widget','panel'], function (pluginServerClass, widgetClass, panelClass) {

  describe('KorAP.Plugin.Server', function () {

    it('should be initializable', function () {
      var manager = pluginServerClass.create();
      expect(manager).toBeTruthy();
      manager.destroy();
    });


    it('should add a widget', function () {
      var manager = pluginServerClass.create();
      var panel = panelClass.create();
      var id = manager.addWidget(panel, 'Example 1', 'about:blank');
      expect(id).toMatch(/^id-/);

      var panelE = panel.element();
      var widgetE = panelE.firstChild.firstChild;
      expect(widgetE.classList.contains('widget')).toBeTruthy();
      expect(widgetE.firstChild.tagName).toEqual("IFRAME");
      var iframe = widgetE.firstChild;
      expect(iframe.getAttribute("src")).toEqual("about:blank");

      expect(widgetE.lastChild.firstChild.textContent).toEqual("Close");
      expect(widgetE.lastChild.lastChild.textContent).toEqual("Example 1");

      manager.destroy();
    });

    it('should close a widget', function () {
      var manager = pluginServerClass.create();
      var panel = panelClass.create();
      var id = manager.addWidget(panel, 'Example 2', 'about:blank');
      expect(id).toMatch(/^id-/);

      var panelE = panel.element();
      var widgetE = panelE.firstChild.firstChild;
      expect(widgetE.classList.contains('widget')).toBeTruthy();

      expect(panelE.getElementsByClassName('view').length).toEqual(1);

      var widget = manager.widget(id);
      widget.close();

      expect(panelE.getElementsByClassName('view').length).toEqual(0);

      manager.destroy();
    });

    
    it('should fail on invalid registrations', function () {
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
