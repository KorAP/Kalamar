/**
 * Test suite for corpus statistic
 * 
 * @author Helge Stallkamp
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
	   
		var vc = vcClass.create([
	      ['title', 'string'],
	      ['subTitle', 'string'],
	      ['pubDate', 'date'],
	      ['author', 'text']
	    ]).fromJson(json);

		vcEl = vc.element();
    
		var stat = statClass.create(preDefinedStat);
		var descL = stat.element();
		
			
		it('should be initiable', function(){
	    expect( function() { statClass.create() }).toThrow(new Error("Missing parameter"));
		});
		
		
		it('should be parsed in a statistic view and displayed as HTML Description List', function(){		
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
		
	});
		
});
