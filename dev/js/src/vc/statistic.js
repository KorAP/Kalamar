/**
 * 
 * Creates and displays corpus statistic
 * 
 * @author Helge Stallkamp
 * 
 */
 

define(['util'], function (){

	return{
		
		/**
		 * Create new statistic object
		 */
		create: function(statistic){
			return Object.create(this)._init(statistic);
		},
	
		/**
		 * Initialize statistic object
		 */
		_init: function(statistic){
			if(statistic === undefined){
				throw new Error("Missing parameter");
			}
			else{
			this._statistic = statistic;
			this._visibleStat = false;
			return this;
			}
		},
		
		/**
		 * Display statistic object
		 * as HTML Description List Element
		 */
		element : function(){
		
			//if this._element already exists return without doing something
			if (this._element !== undefined) {
	      return this._element;
      };
      
      //create HTML Description List Element
			var statDL = document.createElement('dl');
			var statistic = this._statistic;
			
			var keys = Object.keys(statistic);
			for(i = 0; i <  keys.length; i++){
				statSp = statDL.addE('div')
				statDT = statSp.addE('dt');
				var k = keys[i];
				statDT.addT(k);
				statDT.setAttribute('title' , k);			
				statDD = statSp.addE('dd');
				statDD.addT(statistic[k]);
			} 	
			
			this._element = statDL;
			return this._element;
		},
		
		
		/**
		 * 
		 * Receive Corpus statistic from the server
		 */			
		getStatistic : function(vc, cb){
			//cq = corpusQuery
			var cq = encodeURI(vc.toQuery());
			
			try{	
				KorAP.API.getCorpStat(cq, function(statResponse){
					if(statResponse === null){
						cb(null);
						return;
					}
					if(statResponse === undefined){
						cb(null);
						return;
					}
					cb(statResponse);
				});
			}
			
			catch(e){
				KorAP.log(0, e);
				cb(null);
			}
			
		},
		
		
		/**
		* Shows corpus statistic
		*/
		showCorpStat : function(appendEl, vc){
			
			/*
			* If corpus statistic is already visible, 
			* there is no need to show the statistic again.
			*/
			if(this._visibleStat)
				return;
			
			var statTable = document.createElement('div');									
			statTable.classList.add('stattable', 'loading');
			appendEl.appendChild(statTable);
			
			var that = this;
			
			
			/*
			* Get corpus statistic, remove "loading"-image and 
			* append result to statTable 
			*/
			this.getStatistic(vc, function (statistic) {
			
			if (statistic === null)
				return; 
				
			statTable.classList.remove('loading');
			statisticobj = that.create(statistic);
			
			//Removes statistic button when statistic is displayed
			var divStatButton = document.getElementById('dCorpStat');
			divStatButton.parentNode.removeChild(divStatButton);
      
			statTable.appendChild(statisticobj.element());
			
			// Add Close Button
			var actions = document.createElement('ul');
			actions.classList.add('action', 'image');
			var b = actions.addE('li');
			b.className = 'close'; 
			b.addE('span').addT('close');
			statTable.appendChild(actions);
			b.addEventListener('click', function (e){
				statTable.parentNode.removeChild(statTable);
				that._visibleStat = false;
				vc.addStatBut();
				e.halt();
				});
			});
			
			//corpus statistic is displayed
			this._visibleStat = true;
			// Do not load any longer
			statTable.classList.remove('loading');
		},	
		
	}
	
});
