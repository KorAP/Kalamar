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

      let b = p.actions.element().firstChild;
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
            action : 'setWidget'
          }
        }]
      });

      let b = p.actions.element().firstChild;
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
      expect(p.element().querySelector("iframe").getAttribute('sandbox')).toEqual('');
      
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
          onClick : {
            template : 'about:blank',
            action : 'addWidget',
            permissions: ['scripts', 'forms', 'all']
          }
        }]
      });

      let b = p.actions.element().firstChild;
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
      expect(KorAP.Panel['result'].actions.element().innerHTML).toContain('Dosomething');

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
      expect(KorAP.Panel['result'].actions.element().innerHTML).toContain('Dosomething');
     
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

    it('should reply to query information requests', function () {
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
  });
});
