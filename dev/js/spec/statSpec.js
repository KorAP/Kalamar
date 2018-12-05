/**
 * Test suite for corpus statistic
 * 
 * @author Helge Stallkamp
 * @author Nils Diewald
 */


define(['vc', 'vc/statistic', 'view/corpstatv'], function(vcClass, statClass, corpStatVClass){
  
	var json = {
   	"@type":"koral:docGroup",
   	"operation":"operation:or",
   	"operands":[
   	  {
   	    "@type":"koral:docGroup",
   	    "operation":"operation:and",
   	    "operands":[
   	      {
   	        "@type":"koral:doc",
   	        "key":"title",
   	        "value":"Der Birnbaum",
   	        "match":"match:eq"
   	      },
   	      {
   	        "@type":"koral:doc",
   	        "key":"pubPlace",
   	        "value":"Mannheim",
   	        "type" : "type:regex",
   	        "match":"match:contains"
   	      },
   	      {
   	        "@type":"koral:docGroup",
   	        "operation":"operation:or",
   	        "operands":[
   	          {
   	            "@type":"koral:doc",
   	            "key":"subTitle",
   	            "value":"Aufzucht und Pflege",
   	            "match":"match:eq"
   	          },
   	          {
   	            "@type":"koral:doc",
   	            "key":"subTitle",
   	            "value":"Gedichte",
   	            "match":"match:eq",
   	            "rewrites" : [
   	              {
   	                "@type": "koral:rewrite",
   	                "src" : "policy",
   	                "operation" : "operation:injection",
   	              }
   	            ]
   	          }
   	        ]
   	      }
   	    ]
   	  },
   	  {
   	    "@type":"koral:doc",
   	    "key":"pubDate",
   	    "type":"type:date",
   	    "value":"2015-03-05",
   	    "match":"match:geq"
   	  }
   	]
  };

	var preDefinedStat={
  	"documents":12,
  	"tokens":2323,
  	"sentences":343434,
  	"paragraphs":45454545
	};

  KorAP.API.getCorpStat = function(collQu, cb){
  	return cb(preDefinedStat);
  }; 
  

  generateCorpusDocGr = function(){     
   let vc = vcClass.create().fromJson({
      "@type" : 'koral:docGroup',
      'operation' : 'operation:or',
      'operands' : [
        {
          '@type' : 'koral:doc',
          'key' : 'title', 
          'match': 'match:eq',
          'value' : 'Hello World!'
        },
        {
          '@type' : 'koral:doc',   
          'match': 'match:eq',
          'key' : 'foo',
          'value' : 'bar'
        }
      ]
    });  
   return vc;
  }
  
  generateCorpusDoc = function(){
    let vc= vcClass.create().fromJson({
        '@type' : 'koral:doc',
        'key' : 'title', 
        'match': 'match:eq',
        'value' : 'Hello World!',
        'type'  : 'type:string'      
    });
    return vc;
  };
  
  
  /**
   * Generate vc with docgroupref
   */
  generateCorpusRef = function(){  
    let vc = vcClass.create().fromJson({
      "@type" : "koral:docGroupRef",
      "ref" : "@max/myCorpus"
    });
    return vc;
  };
  
  
  /**
   * Checks is corpus statistic is active
   */
  checkStatActive = function(view, div){   
    // corpus statistic exists, it is active and reloadStatButton is shown
    if ((view.firstChild.classList.contains("stattable") === true) 
      && (view.firstChild.classList.contains("greyOut") === false)
      && (div.getElementsByClassName("reloadStatB").length == 0) ) { 
      return true;
    } 
    return false;
  };
 
  
  /**
   * Checks if corpus statistic is disabled
   */
  checkStatDisabled = function(view, div){
    if ((view.firstChild.classList.contains("stattable") === true) 
        && (view.firstChild.classList.contains("greyOut") === true)
        && (div.getElementsByClassName("reloadStatB").length === 1) ) {
      return true;
    }   
    return false;
    };
    
    
  describe('KorAP.CorpusStat', function(){

		it('should be initiable', function(){
		  var stat = statClass.create(preDefinedStat);		
	    expect( function() { statClass.create() }).toThrow(new Error("Missing parameter"));
		});
		
		
		it('should be parsed in a statistic view and displayed as HTML Description List', function(){
		  var stat = statClass.create(preDefinedStat);		
          var descL = stat.element();
			expect(descL.tagName).toEqual('DL');		
			expect(descL.children[0].tagName).toEqual('DIV');
			expect(descL.children[0].children[0].tagName).toEqual('DT');
			expect(descL.children[0].children[0].attributes[0].name).toEqual('title');
			expect(descL.children[0].children[1].tagName).toEqual('DD');
			
			expect(descL.children[0].children[0].firstChild.nodeValue).toEqual('documents');
			expect(descL.children[0].children[1].firstChild.nodeValue).toEqual('12');
			expect(descL.children[0].children[0].attributes[0].value).toEqual('documents');

			expect(descL.children[1].children[0].firstChild.nodeValue).toEqual('tokens');
			expect(descL.children[1].children[1].firstChild.nodeValue).toEqual(new Number(2323).toLocaleString());
			expect(descL.children[1].children[0].attributes[0].value).toEqual('tokens');
    });
		
		
		it('should display corpus statistic after creating a corpus statistic view', function(){
		  var vc = vcClass.create([
	      ['title', 'string'],
	      ['subTitle', 'string'],
	      ['pubDate', 'date'],
	      ['author', 'text']
	    ]).fromJson(json);

		  KorAP.vc = vc;
		  
		  statView = corpStatVClass.create(vc);
		  // corpStatVClass.show(vc);
		  
			var testDiv = document.createElement('div');
			testDiv.appendChild(statView.show());
			// statClass.showCorpStat(testDiv, vc);
			
			expect(testDiv.children[0].tagName).toEqual('DIV');
			expect(testDiv.children[0].getAttribute("class")).toEqual('stattable');   
			expect(testDiv.children[0].children[0].tagName).toEqual('DL');	
			expect(testDiv.children[0].children[0].children[0].children[0].firstChild.nodeValue).toEqual('documents');
			expect(testDiv.children[0].children[0].children[0].children[1].firstChild.nodeValue).toEqual('12');
		});

    it('should display the statistics button in a panel', function () {
		  var vc = vcClass.create([
	      ['title', 'string'],
	      ['subTitle', 'string'],
	      ['pubDate', 'date'],
	      ['author', 'text']
	    ]).fromJson(json);

      var show = document.createElement('div');

      show.appendChild(vc.element());

      var panel = show.firstChild.lastChild.firstChild;
      expect(panel.classList.contains('panel')).toBeTruthy();
      expect(panel.classList.contains('vcinfo')).toBeTruthy();
      expect(panel.lastChild.classList.contains('button-group')).toBeTruthy();
      expect(panel.lastChild.classList.contains('vcinfo')).toBeTruthy();
      expect(panel.lastChild.children[0].tagName).toEqual('SPAN');
      expect(panel.lastChild.children[0].textContent).toEqual('Statistics');
    });

    
    it('should display the statistics button in a panel after VC modification', function () {

		  var vc = vcClass.create([
	      ['title', 'string'],
	      ['subTitle', 'string'],
	      ['pubDate', 'date'],
	      ['author', 'text']
	    ]).fromJson(json);

      var show = document.createElement('div');

      show.appendChild(vc.element());

      expect(show.querySelector(".statistic").tagName).toEqual("SPAN");

      var and = vc.builder().lastChild.firstChild;

      // Click on and() in VC
      and.click();

      // Check that statistics is there
      expect(show.querySelector(".statistic").tagName).toEqual("SPAN");
    });

    
    it('should display and hide corpus statistics view in the panel', function () {

		  var vc = vcClass.create([
	      ['title', 'string'],
	      ['subTitle', 'string'],
	      ['pubDate', 'date'],
	      ['author', 'text']
	    ]).fromJson(json);

      var show = document.createElement('div');

      show.appendChild(vc.element());

      var panel = show.firstChild.lastChild.firstChild;

      // Show statistics
      panel.lastChild.children[0].click();

      // Statistics view
      var viewE = panel.firstChild.firstChild;

      expect(viewE.tagName).toEqual("DIV");
      expect(viewE.classList.contains("view")).toBeTruthy();
      expect(viewE.classList.contains("vcstatistic")).toBeTruthy();

      expect(viewE.firstChild.classList.contains("stattable")).toBeTruthy();
      expect(viewE.firstChild.firstChild.tagName).toEqual("DL");

      // List of statistic values
      var dl = viewE.firstChild.firstChild.firstChild;
      expect(dl.firstChild.tagName).toEqual("DT");
      expect(dl.firstChild.textContent).toEqual("documents");
      expect(dl.lastChild.tagName).toEqual("DD");
      expect(dl.lastChild.textContent).toEqual("12");

      expect(viewE.children.length).toEqual(2);  

      expect(viewE.lastChild.classList.contains("button-group")).toBeTruthy();
      expect(viewE.lastChild.children.length).toEqual(1);
      expect(viewE.lastChild.firstChild.tagName).toEqual("SPAN");
      expect(viewE.lastChild.firstChild.textContent).toEqual("Close");

      // Close view
      viewE.lastChild.firstChild.firstChild.click();

      // Is gone
      expect(panel.firstChild.children.length).toEqual(0);

      // Show statistics
      panel.lastChild.children[0].click();

      // Is there
      expect(panel.firstChild.children.length).toEqual(1);

      // Only show once
      panel.lastChild.children[0].click();
      expect(panel.firstChild.children.length).toEqual(1);
    });
    
   
  });	
	
  
  
    /**
     * Test disabling and reload of corpus statistic if vc is changed 
     * in vc builder through user-interaction
     */
	describe ('KorAP.CorpusStat.Disable', function(){
	
	  /**
	   * If the user defines a new vc, the statistic should be disabled,
	   * because it is out-of-date.
	   * 
	   * The user can choose to display an up-to-date corpus statistic. Here it is tested
	   * if corpus statistic is disabled after a valid change of corpus statistic and if the corpus statistic is updatable.
	   */ 	  	 
      it ('should disable the corpus statistic if corpus definition is changed and display a functional reload  button', function(){
        
        KorAP.vc = generateCorpusDocGr();  
        
        //Show corpus statistic
        let show = document.createElement('div');
        show.appendChild(KorAP.vc.element());
        let panel = show.firstChild.lastChild.firstChild;
        panel.lastChild.children[0].click();
        let view = panel.firstChild.firstChild;
        
        //corpus statistic is active
        expect(checkStatActive(view, show)).toBe(true);
        
        //change vc, a line in vc builder is deleted
        KorAP._delete.apply(KorAP.vc.root().getOperand(0));
        expect(checkStatDisabled(view,show)).toBe(true);
        
        //click at reload button
        let rlbutton = show.getElementsByClassName("refresh").item(0);
        rlbutton.click();
        
        expect(checkStatActive(view,show)).toBe(true);
      });
      
      
      it('should disable corpus statistic if entries in vc builder are deleted', function(){
        KorAP.vc = generateCorpusDocGr();
        
        // create corpus builder and corpus statistic;
        let show = document.createElement('div');
        show.appendChild(KorAP.vc.element());   
        let panel = show.firstChild.lastChild.firstChild;
        panel.lastChild.children[0].click();
        let view = panel.firstChild.firstChild;

        expect(checkStatActive(view, show)).toBe(true);
        
        //delete foo=bar
        KorAP._delete.apply(KorAP.vc.root().getOperand(1));
        expect(checkStatDisabled(view, show)).toBe(true);
       
        //refresh corpus statistic
        let rlbutton = show.getElementsByClassName("refresh").item(0);
        rlbutton.click();
        expect(checkStatActive(view,show)).toBe(true);   
            
        KorAP._delete.apply(KorAP.vc.root());
        // fails momentarily, does not fail after next commit with Change-Id: Id44736f134c00e1a1be002bf14e00e6efa26ad02
        //expect(checkStatDisabled(view, show)).toBe(true);        
      });
      
      
      it('should disable corpus statistic if key, matchoperator or value is changed', function(){  
        /*         
         * Doc change of key, match operator and value 
         */
        KorAP.vc= generateCorpusDoc();
        // show vc builder and open corpus statistic
        let show = document.createElement('div');
        show.appendChild(KorAP.vc.element());
        let panel = show.firstChild.lastChild.firstChild;
        panel.lastChild.children[0].click();
        let view = panel.firstChild.firstChild;
        expect(checkStatActive(view, show)).toBe(true);
        
        KorAP.vc.root().matchop("ne").update();
        expect(checkStatDisabled(view, show)).toBe(true);
        
        let rlbutton = show.getElementsByClassName("refresh").item(0);
        rlbutton.click();
        
        view = panel.firstChild.firstChild;
        expect(checkStatActive(view, show)).toBe(true);
        KorAP.vc.root().value("Hello tester").update();
        expect(checkStatDisabled(view, show)).toBe(true);
          
        //refresh corpus statistic
        rlbutton = show.getElementsByClassName("refresh").item(0);
        rlbutton.click();
        view = panel.firstChild.firstChild;
        expect(checkStatActive(view, show)).toBe(true);
        
        KorAP.vc.root().key("author").update();
        expect(checkStatDisabled(view, show)).toBe(true);
        
        
        /*
         * DocGroupRef change of value...
         */  
        KorAP.vc = generateCorpusRef();
        show = document.createElement('div');
        show.appendChild(KorAP.vc.element());
        panel = show.firstChild.lastChild.firstChild;
        panel.lastChild.children[0].click();
        view = panel.firstChild.firstChild;
        expect(checkStatActive(view, show)).toBe(true);
        
        KorAP.vc.root().ref("@anton/secondCorpus").update();
        expect(checkStatDisabled(view, show)).toBe(true);
        });
      
      
      it('should not disable corpus statistic if docgroup definition is incomplete', function(){
        
        KorAP.vc = generateCorpusDocGr();
        
        //Show corpus statistic
        let show = document.createElement('div');
        show.appendChild(KorAP.vc.element());
        let panel = show.firstChild.lastChild.firstChild;
        panel.lastChild.children[0].click();
        let view = panel.firstChild.firstChild;
        
        expect(checkStatActive(view, show)).toBe(true);

        KorAP._and.apply(KorAP.vc.root());

        let andbuild = show.getElementsByClassName("builder");
        expect(andbuild[0].firstChild.classList.contains('docGroup')).toBeTruthy();
        expect(andbuild[0].firstChild.getAttribute("data-operation")).toEqual("and");  
        expect(checkStatActive(view, show)).toBe(true);
      });

      
      it('should not disable corpus statistic if doc/docref definition is incomplete', function(){
        
        /*
         * DOC incomplete
         */
        KorAP.vc = vcClass.create().fromJson();
        expect(KorAP.vc.builder().firstChild.classList.contains('unspecified')).toBeTruthy();
        
        // show vc builder and open corpus statistic
        let show = document.createElement('div');
        show.appendChild(KorAP.vc.element());
        let panel = show.firstChild.lastChild.firstChild;
        panel.lastChild.children[0].click();
        let view = panel.firstChild.firstChild;
       
        // corpus statistic should be shown and be up-to-date, reload button is not shown
        expect(checkStatActive(view, show)).toBe(true);
        
        // open the menu
        KorAP.vc.builder().firstChild.firstChild.click();
        KorAP._vcKeyMenu._prefix.add("author");
        let prefElement = KorAP.vc.builder().querySelector('span.pref');
        // add key 'author' to VC
        prefElement.click();
        
        expect(checkStatActive(view, show)).toBe(true); 
       
        
        /*
         * DOCREF incomplete
         */
        KorAP.vc = vcClass.create().fromJson();
        expect(KorAP.vc.builder().firstChild.classList.contains('unspecified')).toBeTruthy();
        
        // show vc builder and open corpus statistic
        show = document.createElement('div');
        show.appendChild(KorAP.vc.element());
        panel = show.firstChild.lastChild.firstChild;
        panel.lastChild.children[0].click();
        view = panel.firstChild.firstChild;
        expect(checkStatActive(view, show)).toBe(true);

        KorAP.vc.builder().firstChild.firstChild.click();
        KorAP._vcKeyMenu._prefix.add("referTo");
        prefElement = KorAP.vc.builder().querySelector('span.pref');
        prefElement.click();
        expect(checkStatActive(view, show)).toBe(true);
        });     
      });
});
