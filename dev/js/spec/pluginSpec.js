define(['plugin/server','plugin/widget','panel', 'panel/query', 'panel/result', 'plugin/service', 'pipe', 'vc','util'], function (pluginServerClass, widgetClass, panelClass, queryPanelClass, resultPanelClass, serviceClass, pipeClass, vcClass) {

  describe('KorAP.Plugin.Server', function () {

    it('should be initializable', function () {
      var manager = pluginServerClass.create();
      expect(manager).toBeTruthy();
      manager.destroy();
    });

    it('should add a widget', function () {
      var manager = pluginServerClass.create();
      var panel = panelClass.create();
      var id = manager.addWidget(panel, {"name": 'Example 1', "src": 'about:blank'});
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

    it('should add a service', function () {
      var manager = pluginServerClass.create();

      var e = manager.element();

      document.body.appendChild(e);

      expect(document.getElementById("services")).toBeTruthy();
      
      expect(e.getAttribute("id")).toBe("services");
      expect(e.children.length).toBe(0);

      var id = manager.addService({"name":'Example 1', "src":'about:blank'});
      expect(id).toMatch(/^id-/);

      expect(e.children.length).toBe(1);

      manager.destroy();

      expect(document.getElementById("services")).toBeFalsy();

    });

    it('should close a widget', function () {
      var manager = pluginServerClass.create();
      var panel = panelClass.create();
      var id = manager.addWidget(panel, {"name":'Example 2', "src":'about:blank'});
      expect(id).toMatch(/^id-/);

      var panelE = panel.element();
      var widgetE = panelE.firstChild.firstChild;
      expect(widgetE.classList.contains('widget')).toBeTruthy();

      expect(panelE.getElementsByClassName('view').length).toEqual(1);

      var widget = manager.service(id);
      expect(widget.isWidget).toBeTruthy();
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
      manager.destroy();
    });

    it('should accept valid registrations for matches', function () {
      var manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'match',
          title : 'Translate',
          onClick : {
            template : 'test'
          }
        }]
      });

      expect(manager.buttonGroup('match').length).toEqual(1);
      manager.destroy();
    });
    
    it('should accept valid registrations for query temporary', function () {
      var manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'query',
          title : 'Translate',
          onClick : {
            template : 'test'
          }
        }]
      });

      expect(manager.buttonGroup('query').length).toEqual(1);
      manager.destroy();
    });
    

    it('should accept valid registrations for result', function () {
      var manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'result',
          title : 'Translate',
          onClick : {
            template : 'test'
          }
        }]
      });

      expect(manager.buttonGroup('result').length).toEqual(1);
      manager.destroy();
    });

    it('should accept valid registrations for addWidget', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      
      let manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'result',
          title : 'Add',
          onClick : {
            template : 'about:blank',
            action : 'addWidget'
          }
        }]
      });

      let b = p.actions().element().firstChild;
      expect(b.hasAttribute("data-icon")).toBeFalsy();
      expect(b.hasAttribute("cls")).toBeFalsy();
      expect(b.getAttribute("title")).toEqual("Add");

      expect(p.element().querySelectorAll("iframe").length).toEqual(0);

      b.click();

      expect(p.element().querySelectorAll("iframe").length).toEqual(1);
      expect(p.element().querySelectorAll("div.view.widget").length).toEqual(1);
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(1);

      b.click();

      expect(p.element().querySelectorAll("iframe").length).toEqual(2);
      expect(p.element().querySelectorAll("div.view.widget").length).toEqual(2);
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(2);
      
      manager.destroy();

      KorAP.Panel["result"] = undefined;
    });

    it('should accept valid registrations for setWidget', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      
      let manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'result',
          title : 'Add',
          onClick : {
            template : 'about:blank',
            action : 'setWidget',
            permissions: ['same-origin'] // Temporary
          }
        }]
      });

      let b = p.actions().element().firstChild;
      expect(b.hasAttribute("data-icon")).toBeFalsy();
      expect(b.hasAttribute("cls")).toBeFalsy();
      expect(b.getAttribute("title")).toEqual("Add");

      expect(p.element().querySelectorAll("iframe").length).toEqual(0);

      b.click();

      expect(p.element().querySelectorAll("iframe").length).toEqual(1);
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(1);

      b.click();

      expect(p.element().querySelectorAll("iframe").length).toEqual(1);
      expect(p.element().querySelectorAll("div.view.widget").length).toEqual(1);
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(0);

      p.element().querySelector("span.close").click();

      expect(p.element().querySelectorAll("iframe").length).toEqual(0);
      
      b.click();

      expect(p.element().querySelectorAll("iframe").length).toEqual(1);
      expect(p.element().querySelectorAll("div.view.widget").length).toEqual(1);
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(1);
      expect(p.element().querySelector("iframe").getAttribute('sandbox')).toEqual('allow-same-origin'); // Temporary

      manager.destroy();

      KorAP.Panel["result"] = undefined;
    });

    it('should accept valid registrations for setWidget with active', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      
      let manager = pluginServerClass.create();

      // Attach services container so addService works
      document.body.appendChild(manager.element());

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'result',
          title : 'Map',
          onClick : {
            template : 'about:blank',
            action : 'setWidget',
            active : false
          }
        }]
      });

      let b = p.actions().element().firstChild;
      expect(b.getAttribute("title")).toEqual("Map");

      // Button should have a check element (marker-box)
      expect(b.firstChild.classList.contains('check')).toBeTruthy();
      expect(b.firstChild.classList.contains('button-icon')).toBeTruthy();

      // active state should be set to false initially
      expect(b.active).toBeDefined();
      expect(b.active.get()).toBe(false);

      // Check is not checked initially
      expect(b.firstChild.classList.contains('checked')).toBeFalsy();

      expect(p.element().querySelectorAll("iframe").length).toEqual(0);

      // Click on check (marker-box) - loads background service,
      // no visible widget in the panel
      b.firstChild.click();

      // No iframe in the panel - service is in the services container
      expect(p.element().querySelectorAll("iframe").length).toEqual(0);
      expect(manager.element().querySelectorAll("iframe").length).toEqual(1);

      // No widget view element should exist in the panel
      expect(p.element().querySelectorAll("div.view").length).toEqual(0);

      // active state should have toggled to true
      expect(b.active.get()).toBe(true);
      expect(b.firstChild.classList.contains('checked')).toBeTruthy();

      // Click on check again - should not add another service, just toggle active
      b.firstChild.click();
      expect(manager.element().querySelectorAll("iframe").length).toEqual(1);
      expect(b.active.get()).toBe(false);
      expect(b.firstChild.classList.contains('checked')).toBeFalsy();

      // Click on title - should open the widget visibly
      b.click();
      expect(p.element().querySelectorAll("iframe").length).toEqual(1);
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(1);

      // Click title again - should toggle visibility (hide via state)
      b.click();
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(0);

      manager.destroy();
      KorAP.Panel["result"] = undefined;
    });

    it('should not show any view element when checkbox is clicked', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      let manager = pluginServerClass.create();

      document.body.appendChild(manager.element());

      manager.register({
        name : 'NoBar',
        embed : [{
          panel : 'result',
          title : 'Map',
          onClick : {
            template : 'about:blank',
            action : 'setWidget',
            active : false
          }
        }]
      });

      let b = p.actions().element().firstChild;

      // Click checkbox
      b.firstChild.click();

      // No view element must exist in the panel at all —
      // not visible, not hidden, not minimized. The checkbox
      // must only create a background service, never a widget.
      expect(p.element().querySelectorAll("div.view").length).toEqual(0);
      expect(p.element().querySelectorAll("iframe").length).toEqual(0);

      // The iframe must be in the services container instead
      expect(manager.element().querySelectorAll("iframe").length).toEqual(1);

      // Clicking the title afterwards must properly open the widget
      b.click();
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(1);
      expect(p.element().querySelectorAll("iframe").length).toEqual(1);

      manager.destroy();
      KorAP.Panel["result"] = undefined;
    });

    it('should toggle active via checkbox when widget is open', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      let manager = pluginServerClass.create();

      document.body.appendChild(manager.element());

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'result',
          title : 'Map',
          onClick : {
            template : 'about:blank',
            action : 'setWidget',
            active : false
          }
        }]
      });

      let b = p.actions().element().firstChild;

      // Open the widget via title-click
      b.click();
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(1);
      expect(b.active.get()).toBe(false);

      let id = b['widgetID'];
      expect(id).toBeDefined();

      // Active association should exist on the widget
      expect(b.active.associates()).toBeGreaterThan(0);

      // Click checkbox to activate - should toggle active state
      b.firstChild.click();
      expect(b.active.get()).toBe(true);
      expect(b.firstChild.classList.contains('checked')).toBeTruthy();

      // Widget should still be visible
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(1);

      // widgetID should remain the same (no new service created)
      expect(b['widgetID']).toEqual(id);

      // Click checkbox again to deactivate
      b.firstChild.click();
      expect(b.active.get()).toBe(false);
      expect(b.firstChild.classList.contains('checked')).toBeFalsy();

      // Widget should still be visible
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(1);

      manager.destroy();
      KorAP.Panel["result"] = undefined;
    });

    it('should not duplicate pipes when opening widget after checkbox', function () {
      var tempPipe = KorAP.Pipe;
      KorAP.Pipe = pipeClass.create();

      let p = KorAP.Panel["result"] = panelClass.create();
      let manager = pluginServerClass.create();

      document.body.appendChild(manager.element());

      manager.register({
        name : 'PipeCheck',
        embed : [{
          panel : 'result',
          title : 'Map',
          onClick : {
            template : 'about:blank',
            action : 'setWidget',
            active : false
          }
        }]
      });

      let b = p.actions().element().firstChild;

      // Click checkbox - background service created, active becomes true
      b.firstChild.click();
      expect(b.active.get()).toBe(true);
      expect(manager.element().querySelectorAll("iframe").length).toEqual(1);

      // Simulate the plugin adding a pipe via the background service
      let bgId = b['widgetID'];
      manager._receiveMsg({
        "data" : {
          "originID" : bgId,
          "action" : "pipe",
          "job" : "add",
          "service" : "https://mapper.example"
        }
      });
      expect(KorAP.Pipe.toString()).toEqual("https://mapper.example");

      // Click title - opens widget, closes background service
      b.click();
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(1);

      // The new widget's plugin re-initializes and tries to add the
      // same pipe again — the pipe system must deduplicate.
      let wId = b['widgetID'];
      manager._receiveMsg({
        "data" : {
          "originID" : wId,
          "action" : "pipe",
          "job" : "add",
          "service" : "https://mapper.example"
        }
      });

      // Pipe must still contain only one entry
      expect(KorAP.Pipe.toString()).toEqual("https://mapper.example");
      expect(KorAP.Pipe.size()).toEqual(1);

      manager.destroy();
      KorAP.Pipe = tempPipe;
      KorAP.Panel["result"] = undefined;
    });

    it('should toggle checkbox visual when widget is open', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      let manager = pluginServerClass.create();

      document.body.appendChild(manager.element());

      manager.register({
        name : 'VisualCheck',
        embed : [{
          panel : 'result',
          title : 'Map',
          onClick : {
            template : 'about:blank',
            action : 'setWidget',
            active : false
          }
        }]
      });

      let b = p.actions().element().firstChild;
      let check = b.firstChild;

      // Open widget via title
      b.click();
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(1);
      expect(check.classList.contains('checked')).toBeFalsy();

      // Click checkbox - should visually check
      check.click();
      expect(b.active.get()).toBe(true);
      expect(check.classList.contains('checked')).toBeTruthy();

      // Click checkbox again - should visually uncheck
      check.click();
      expect(b.active.get()).toBe(false);
      expect(check.classList.contains('checked')).toBeFalsy();

      // Widget should still be visible throughout
      expect(p.element().querySelectorAll("div.view.show.widget").length).toEqual(1);

      manager.destroy();
      KorAP.Panel["result"] = undefined;
    });

    it('should accept valid registrations for addWidget with active', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      
      let manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'result',
          title : 'Export',
          onClick : {
            template : 'about:blank',
            action : 'addWidget',
            active : true
          }
        }]
      });

      let b = p.actions().element().firstChild;

      // active state should be set to true initially
      expect(b.active).toBeDefined();
      expect(b.active.get()).toBe(true);
      expect(b.firstChild.classList.contains('checked')).toBeTruthy();

      expect(p.element().querySelectorAll("iframe").length).toEqual(0);

      // Click on check - only toggles active, no widget created
      b.firstChild.click();
      expect(p.element().querySelectorAll("iframe").length).toEqual(0);
      expect(b.active.get()).toBe(false);
      expect(b.firstChild.classList.contains('checked')).toBeFalsy();

      // Click on title - should load a widget visibly
      b.click();
      expect(p.element().querySelectorAll("iframe").length).toEqual(1);

      manager.destroy();
      KorAP.Panel["result"] = undefined;
    });

    it('should support changeTitle on buttons', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      
      let manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'result',
          title : 'Map',
          onClick : {
            template : 'about:blank',
            action : 'setWidget'
          }
        }]
      });

      let b = p.actions().element().firstChild;
      expect(b.lastChild.textContent).toEqual("Map");

      b.changeTitle("New Title");
      expect(b.lastChild.textContent).toEqual("New Title");

      manager.destroy();
      KorAP.Panel["result"] = undefined;
    });

    it('should handle Title set message', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      
      let manager = pluginServerClass.create();

      manager.register({
        name : 'TitlePlugin',
        embed : [{
          panel : 'result',
          title : 'Original',
          onClick : {
            template : 'about:blank',
            action : 'setWidget'
          }
        }]
      });

      let b = p.actions().element().firstChild;
      expect(b.lastChild.textContent).toEqual("Original");

      // Click to open widget
      b.click();

      let id = b['widgetID'];
      expect(id).toBeDefined();

      // Send Title set message
      manager._receiveMsg({
        "data" : {
          "originID" : id,
          "action" : "set",
          "key" : "Title",
          "value" : "Changed"
        }
      });

      expect(b.lastChild.textContent).toEqual("Changed");

      manager.destroy();
      KorAP.Panel["result"] = undefined;
    });

    it('should handle Active get/set messages', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      
      let manager = pluginServerClass.create();

      manager.register({
        name : 'ActivePlugin',
        embed : [{
          panel : 'result',
          title : 'Map',
          onClick : {
            template : 'about:blank',
            action : 'setWidget',
            active : false
          }
        }]
      });

      let b = p.actions().element().firstChild;
      expect(b.active.get()).toBe(false);

      // Click title to open widget
      b.click();

      let id = b['widgetID'];
      expect(id).toBeDefined();

      // Get active state
      let data = {
        "originID" : id,
        "action" : "get",
        "key" : "Active"
      };
      manager._receiveMsg({ "data" : data });
      expect(data.value).toBe(false);

      // Set active state via message
      manager._receiveMsg({
        "data" : {
          "originID" : id,
          "action" : "set",
          "key" : "Active",
          "value" : true
        }
      });
      expect(b.active.get()).toBe(true);
      expect(b.firstChild.classList.contains('checked')).toBeTruthy();

      // Roll active state via message (no value)
      manager._receiveMsg({
        "data" : {
          "originID" : id,
          "action" : "set",
          "key" : "Active"
        }
      });
      expect(b.active.get()).toBe(false);
      expect(b.firstChild.classList.contains('checked')).toBeFalsy();

      manager.destroy();
      KorAP.Panel["result"] = undefined;
    });

    it('should accept valid registrations for toggle', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      
      let manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'result',
          title : 'Glemm',
          desc : 'Start Glemm',
          onClick : {
            state : 'check',
            template : 'about:blank',
            action : 'toggle',
            'default' : false
          }
        }]
      });

      let b = p.actions().element().firstChild;
      expect(b.hasAttribute("data-icon")).toBeFalsy();
      expect(b.hasAttribute("cls")).toBeFalsy();
      expect(b.lastChild.innerText).toEqual("Glemm");
      expect(b.getAttribute("title")).toEqual("Start Glemm");
      expect(b.firstChild.classList.contains('button-icon')).toBeTruthy();
      expect(b.firstChild.classList.contains('check')).toBeTruthy();
      expect(b.firstChild.classList.contains('checked')).toBeFalsy();

      expect(p.element().querySelectorAll("iframe").length).toEqual(0);

      expect(manager.states().toString()).toEqual("");
      
      b.click();

      expect(manager.states().toString()).toEqual("\"check\":true");
      
      expect(b.getAttribute("title")).toEqual("Start Glemm");
      expect(b.firstChild.classList.contains('button-icon')).toBeTruthy();
      expect(b.firstChild.classList.contains('check')).toBeTruthy();
      expect(b.firstChild.classList.contains('checked')).toBeTruthy();

      // Check with true default
      p = KorAP.Panel["result"] = panelClass.create();
      
      manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'result',
          title : 'Glemm',
          onClick : {
            template : 'about:blank',
            action : 'toggle',
            'default' : true
          }
        }]
      });

      b = p.actions().element().firstChild;
      expect(b.hasAttribute("data-icon")).toBeFalsy();
      expect(b.hasAttribute("cls")).toBeFalsy();
      expect(b.getAttribute("title")).toEqual("Glemm");
      expect(b.firstChild.classList.contains('button-icon')).toBeTruthy();
      expect(b.firstChild.classList.contains('check')).toBeTruthy();
      expect(b.firstChild.classList.contains('checked')).toBeTruthy();

      manager.destroy();
      KorAP.Panel["result"] = undefined;
    });

    
    it('should alert on plugin info (1)', function () {

      let alertMsg;
      spyOn(window, 'alert').and.callFake(function(msg) {  
        alertMsg = msg;  
      });

      let p = KorAP.Panel["result"] = panelClass.create();
      
      let manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'result',
          title : 'Add',
          onClick : {
            template : 'about:blank',
            action : 'setWidget'
          }
        }]
      });

      expect(alertMsg).toBeUndefined();

      let b = p.actions().element().firstChild;
      b.click();

      // This may only be temporary and should open the plugin window instead
      p.element().querySelector("span.plugin").click();

      expect(alertMsg).toEqual('Check');
      
      manager.destroy();
      KorAP.Panel["result"] = undefined;
    });


    it('should alert on plugin info (2)', function () {

      let alertMsg;
      spyOn(window, 'alert').and.callFake(function(msg) {  
        alertMsg = msg;  
      });

      let p = KorAP.Panel["result"] = panelClass.create();
      
      let manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        desc : 'Simple Check plugin',
        embed : [{
          panel : 'result',
          title : 'Add',
          onClick : {
            template : 'about:blank',
            action : 'setWidget'
          }
        }]
      });

      expect(alertMsg).toBeUndefined();

      let b = p.actions().element().firstChild;
      b.click();

      // This may only be temporary and should open the plugin window instead
      p.element().querySelector("span.plugin").click();

      expect(alertMsg).toEqual("Check\n\nSimple Check plugin");
      
      manager.destroy();
      KorAP.Panel["result"] = undefined;
    });
    

    it('should accept widget permissions', function () {
      let p = KorAP.Panel["result"] = panelClass.create();
      
      let manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'result',
          title : 'Add',
          desc : 'Add something',
          onClick : {
            template : 'about:blank',
            action : 'addWidget',
            permissions: ['scripts', 'forms', 'all']
          }
        }]
      });

      let b = p.actions().element().firstChild;
      expect(b.lastChild.innerText).toEqual("Add");
      expect(b.getAttribute("title")).toEqual("Add something");
      b.click();
      expect(p.element().querySelectorAll("iframe").length).toEqual(1);
      expect(p.element().querySelector("iframe").getAttribute('sandbox')).toEqual('allow-forms allow-scripts');
    });
  });

  describe('KorAP.Plugin.Widget', function () {
    it('should be initializable', function () {
      expect(function () { widgetClass.create() }).toThrow(new Error("Service not well defined"));

      widget = widgetClass.create({"name" : "Test", "src":"https://example", "id":56});
      expect(widget).toBeTruthy();
      expect(widget.id).toEqual(56);
      expect(widget.name).toEqual("Test");
      expect(widget.src).toEqual("https://example");
    });

    it('should create a view element', function () {
      var widget = widgetClass.create({
        "name":"Test",
        "src":"https://example",
        "id":56,
        "permissions":["scripts","forms"]
      });
      var we = widget.element();

      expect(we.tagName).toEqual("DIV");
      expect(we.classList.contains('view')).toBeTruthy();
      expect(we.classList.contains('widget')).toBeTruthy();

      var iframe = we.firstChild;
      expect(iframe.tagName).toEqual("IFRAME");
      expect(iframe.getAttribute("sandbox")).toEqual("allow-forms allow-scripts");
      expect(iframe.getAttribute("src")).toEqual("https://example");
      expect(iframe.getAttribute("name")).toEqual("56");
      
      var btn = we.lastChild;
      expect(btn.classList.contains("button-group")).toBeTruthy();
      expect(btn.classList.contains("button-view")).toBeTruthy();
      expect(btn.classList.contains("widget")).toBeTruthy();

      expect(btn.firstChild.tagName).toEqual("SPAN");
      expect(btn.firstChild.classList.contains("button-icon")).toBeTruthy();
      expect(btn.firstChild.classList.contains("close")).toBeTruthy();
      expect(btn.firstChild.firstChild.tagName).toEqual("SPAN");

      expect(btn.lastChild.tagName).toEqual("SPAN");
      expect(btn.lastChild.classList.contains("button-icon")).toBeTruthy();
      expect(btn.lastChild.classList.contains("plugin")).toBeTruthy();
      expect(btn.lastChild.firstChild.tagName).toEqual("SPAN");
      expect(btn.lastChild.textContent).toEqual("Test");
    })
    
    it('should be resizable', function () {
      var widget = widgetClass.create({"name":"Test", "src":"https://example", "id":56});
      var iframe = widget.show();
      expect(iframe.style.height).toEqual('0px');
      widget.resize({ height : 9 });
      expect(iframe.style.height).toEqual('9px');
    });

    it('should be minimizable', function () {
      var widget = widgetClass.create({"name":"Test", "src":"https://example", "id":56});
      var we = widget.element();
      expect(we.classList.contains('show')).toBeTruthy();
      widget.minimize();
      expect(we.classList.contains('show')).toBeFalsy();
    });
  });

  describe('KorAP.Plugin.Service', function () {
    it('should be initializable', function () {
      expect(function () { serviceClass.create() }).toThrow(new Error("Service not well defined"));

      let service = serviceClass.create({"name":"Test", "src":"https://example", "id":56});
      expect(service).toBeTruthy();
      expect(service.id).toEqual(56);
      expect(service.name).toEqual("Test");
      expect(service.src).toEqual("https://example");
    });

    it('should be loadable', function () {
      let service = serviceClass.create({"name":"Test", "src":"https://example", "id":56});
      expect(service).toBeTruthy();

      let i = service.load();
      expect(i.tagName).toEqual("IFRAME");
      expect(i.getAttribute("allowTransparency")).toEqual("true");
      expect(i.getAttribute("frameborder")).toEqual(''+0);
      expect(i.getAttribute("name")).toEqual(''+service.id);
      expect(i.getAttribute("src")).toEqual(service.src);
    });
    
    // Temporary
    it('should grant same-origin for same-origin plugins', function () {
    // about:blank inherits current origin
    let service = serviceClass.create({
      "name": "Test",
      "src": window.location.origin + "/plugin.html",
      "id": 1,
      "permissions": ["same-origin"]
    });
    let iframe = service.load();
    expect(iframe.getAttribute("sandbox")).toContain("allow-same-origin");
    });
    //Temporary
    it('should deny same-origin for cross-origin plugins', function () {
    let service = serviceClass.create({
      "name": "Test", 
      "src": "https://evil.example.com/plugin.html",
      "id": 2,
      "permissions": ["same-origin"]
    });
    let iframe = service.load();
    expect(iframe.getAttribute("sandbox")).not.toContain("allow-same-origin");
   });

  });
  
  describe('KorAP.Plugin.QueryPanel', function () {
    it('should establish a query plugin', function () {
      var queryPanel = queryPanelClass.create();

      var div = document.createElement('div');

      div.appendChild(queryPanel.element());
      KorAP.Panel = KorAP.Panel || {};
      KorAP.Panel['query'] = queryPanel;

      // Register plugin afterwards
      var manager = pluginServerClass.create();

      manager.register({
        name : 'Check',
        embed : [{
          panel : 'query',
          title : 'Translate',
          onClick : {
            template : 'test'
          }
        }]
      });

      expect(manager.buttonGroup('query').length).toEqual(0);

      // Clean up
      KorAP.Panel['query'] = undefined;
      manager.destroy();
    });
  
    it('Plugin buttons should be cleared after adding to panel', function () {
      
      // Register plugin first
      KorAP.Plugin = pluginServerClass.create();

      KorAP.Plugin.register({
        name : 'Check',
        embed : [{
          panel : 'query',
          title : 'Translate',
          onClick : {
            template : 'test'
          }
        }]
      });


      var queryPanel = queryPanelClass.create();
      var div = document.createElement('div');

      div.appendChild(queryPanel.element());
      KorAP.Panel = KorAP.Panel || {};
      KorAP.Panel['query'] = queryPanel;
      expect(KorAP.Plugin.buttonGroup('query').length).toEqual(0);

      // Clean up
      KorAP.Panel['query'] = undefined;
      KorAP.Plugin.destroy();
      KorAP.Plugin = undefined;
    });  
  });
  
  describe('KorAP.Plugin.ResultPanel', function () {    
    it('Plugin is registered second: buttons should be added to panel', function () {
      
      var resultPanel = resultPanelClass.create();
      resultPanel.addAlignAction(); 
      var div = document.createElement('div');

      div.appendChild(resultPanel.element());
      KorAP.Panel = KorAP.Panel || {};
      KorAP.Panel['result'] = resultPanel;

      // Register plugin afterwards
      var manager = pluginServerClass.create();

      manager.register({
        name : 'ResultPlugin',
        embed : [{
          panel : 'result',
          title : 'Dosomething',
          onClick : {
            template : 'test'
          }
        }]
      });

      expect(manager.buttonGroup('result').length).toEqual(0);
      expect(KorAP.Panel['result'].actions().element().innerHTML).toContain('Dosomething');

      // Clean up
      KorAP.Panel['result'] = undefined;
      manager.destroy();
    });
    
    it('Plugin is registered first: Buttons should be added to panel and cleared', function () {
      
      // Register plugin first
      KorAP.Plugin = pluginServerClass.create();

      KorAP.Plugin.register({
        name : 'ResultPlugin',
        embed : [{
          panel : 'result',
          title : 'Dosomething',
          onClick : {
            template : 'test'
          }
        }]
      });

      expect(KorAP.Plugin.buttonGroup('result').length).toEqual(1);
      
      var resultPanel = resultPanelClass.create();
      var div = document.createElement('div');
      div.appendChild(resultPanel.element());
      KorAP.Panel = KorAP.Panel || {};
      KorAP.Panel['result'] = resultPanel;
      expect(KorAP.Plugin.buttonGroup('result').length).toEqual(0);
      expect(KorAP.Panel['result'].actions().element().innerHTML).toContain('Dosomething');
     
      // Clean up
      KorAP.Panel['result'] = undefined;
      KorAP.Plugin.destroy();
      KorAP.Plugin = undefined;
    });  
  });

  describe('KorAP.Plugin communications', function () {
    it('should receive messages', function () {
      var manager = pluginServerClass.create();
      var id = manager.addService({"name":'Example 1', "src":'about:blank'});
      expect(id).toMatch(/^id-/);
      var temp = KorAP.koralQuery;
      KorAP.koralQuery = { "@type" : "koral:test" };
      let data = {
        "originID" : id,
        "action" : "get",
        "key" : "KQ"
      };
      manager._receiveMsg({
        "data" : data
      });
      manager.destroy();
      expect(data.value["@type"]).toEqual("koral:test");
      // Recreate initial state
      KorAP.koralQuery = temp;
    });

    it('should add to pipe', function () {
      var manager = pluginServerClass.create();
      var temp = KorAP.Pipe;
      KorAP.Pipe = pipeClass.create();
      expect(KorAP.Pipe.toString()).toEqual("");
      
      var id = manager.addService({"name":'Example 2', "src":'about:blank'});
      expect(id).toMatch(/^id-/);
      manager._receiveMsg({
        "data" : {
          "originID" : id,
          "action" : "pipe",
          "job" : "add",
          "service" : "https://pipe-service.de"
        }
      });
      expect(KorAP.Pipe.toString()).toEqual("https://pipe-service.de");
      manager._receiveMsg({
        "data" : {
          "originID" : id,
          "action" : "pipe",
          "job" : "add",
          "service" : "https://pipe-service-2.de"
        }
      });
      expect(KorAP.Pipe.toString()).toEqual("https://pipe-service.de,https://pipe-service-2.de");
      manager._receiveMsg({
        "data" : {
          "originID" : id,
          "action" : "pipe",
          "job" : "del",
          "service" : "https://pipe-service.de"
        }
      });
      expect(KorAP.Pipe.toString()).toEqual("https://pipe-service-2.de");
      manager.destroy();
      // Recreate initial state
      KorAP.Pipe = temp;
    });

    it('should reply to query information requests (queryform)', function () {
      var manager = pluginServerClass.create();
      var id = manager.addService({"name":'Service', "src":'about:blank'});
      expect(id).toMatch(/^id-/);
      var temp = KorAP.vc;
      // Create form for query form information
      let f = document.createElement('form');
      var qfield = f.addE('input');
      qfield.setAttribute("id", "q-field");
      qfield.value = "[orth=Baum]";
      var qlfield = f.addE('select');
      qlfield.setAttribute("id", "ql-field");
      qlfield.addE('option').setAttribute('value', 'cosmas-2');
      qlfield.addE('option').setAttribute('value', 'poliqarp');
      qlfield.selectedIndex = 1;
      
      KorAP.vc = vcClass.create().fromJson({
        "key"   : "title",
        "type"  : "type:regex",
        "value" : "[^b]ee.+?",
        "@type" : "koral:doc"
      });
      // console.log(KorAP.vc.toQuery());
      
      document.body.appendChild(f);
      let data = {
        "originID" : id,
        "action" : "get",
        "key" : "QueryForm"
      };
      manager._receiveMsg({
        "data" : data
      });
      manager.destroy();
      expect(data.value["q"]).toEqual("[orth=Baum]");
      expect(data.value["ql"]).toEqual("poliqarp");
      expect(data.value["cq"]).toEqual("title = /[^b]ee.+?/");

      // Recreate initial state
      KorAP.vc = temp;
      document.body.removeChild(f);
    });

    it('should send messages', function () {
      let qel = document.createElement('input');
      qel.setAttribute('id','q-field');

      let qlel = document.createElement('select');
      qlel.setAttribute('id','ql-field');
      qlel.innerHTML = '<option value="poliqarp">Poliqarp</option><option value="cosmas2">Cosmas II</option><option value="annis">Annis QL</option><option value="cqp">CQP (neu)</option><option value="cql">CQL v1.2</option><option value="fcsql">FCSQL</option>';

      document.body.appendChild(qel);
      document.body.appendChild(qlel);

      var manager = pluginServerClass.create();
      var id = manager.addService({"name":'Example 1', "src":'about:blank'});
      expect(id).toMatch(/^id-/);
      
      let data = {
        "originID" : id,
        "action" : "set",
        "key" : "QueryForm",
        "value" : {
          "q" : "test3",
          "ql" : "cosmas2"
        }
      };

      manager._receiveMsg({
        "data" : data
      });
      manager.destroy();
      expect(qel.value).toEqual("test3");
      expect(qlel.value).toEqual("cosmas2");
      // Recreate initial state

      qel.remove();
      qlel.remove();
    });

    
    it('should reply to query information requests (pagination)', function () {
      var manager = pluginServerClass.create();
      var id = manager.addService({"name":'Service', "src":'about:blank'});
      expect(id).toMatch(/^id-/);
      
      // Create pagination element for pagination information
      let p = document.createElement('div');
      p.setAttribute('id', 'pagination')
      p.setAttribute('data-page',3);
      p.setAttribute('data-total',30);
      p.setAttribute('data-count',25);

      document.body.appendChild(p);

      let data = {
        "originID" : id,
        "action" : "get",
        "key" : "Pagination"
      };
      manager._receiveMsg({
        "data" : data
      });
      manager.destroy();
      expect(data.value["count"]).toEqual(25);
      expect(data.value["page"]).toEqual(3);
      expect(data.value["total"]).toEqual(30);

      // Recreate initial state
      document.body.removeChild(p);
    });
  });
});
