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

		  statView = corpStatVClass.create(vc);
		  //corpStatVClass.show(vc);
		  
			var testDiv = document.createElement('div');
			testDiv.appendChild(statView.show());
			//statClass.showCorpStat(testDiv, vc);
			
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

      var and = vc.element().firstChild.lastChild.firstChild;

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
});
