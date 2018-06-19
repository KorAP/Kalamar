/**
 * Test suite for corpus statistic
 * 
 * @author Helge Stallkamp
 */


define(['vc'], function(){
	
	
	describe('KorAP.CorpusStat', function(){
		
		var preDefinedStat={
	  		"documents":12,
	  		"tokens":2323,
	  		"sentences":343434,
	  		"paragraphs":45454545
		};

		var statClass = require("vc/statistic");		
		var stat = statClass.create(preDefinedStat);
		var descL = stat.element();
		
		it('should be initiable', function(){
			expect(stat._visibleStat).toEqual(false);
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
			
		});
		
	
	});
});
