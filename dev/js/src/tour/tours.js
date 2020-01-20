/**
 * Guided Tour to explain the UI
 * 
 * @author Helge Stallkamp
 */


define(['lib/intro', 'vc', 'hint', 'menu', 'vc/doc', 'vc/docgroup'], function(introClass, vcClass, hintClass, menuClass, docClass, docGroup) {

  //needed for localization of labels and contents of the tour
  const loc   = KorAP.Locale;

  //labels for nextStep, previousStep, done and abort
  loc.TOUR_lskip = loc.TOUR_lskip || "Abort";
  loc.TOUR_lprev = loc.TOUR_lprev || "Back";
  loc.TOUR_lnext = loc.TOUR_lnext || "Next";
  loc.TOUR_ldone = loc.TOUR_ldone || "Done";
  loc.TOUR_ldoneSearch = loc.TOUR_ldoneSearch || "Search";
  
  //localization guided tour gTstartSearch
  loc.TOUR_welc = loc.TOUR_welc || "<span class='tgreeting'> Welcome to our guided tour!</span>" +
  		                           "<p class='pfirstStep'> This tour should give you a quick introduction to KorAP. " +
  		                           "We lead you step by step through an example. </p>"; 
  loc.TOUR_sear1 = loc.TOUR_sear1 || "Input field for the query, for example the search for '" +  loc.TOUR_Qexample + "'.";
  loc.TOUR_searAnnot = loc.TOUR_searAnnot || "Annotation helper";
  loc.TOUR_annotAss =  loc.TOUR_annotAss || "The assistant displays the annotations of the different layers and helps to formulate queries.";
  loc.TOUR_vccho1 = loc.TOUR_vccho1 || "Choose corpus";  
  loc.TOUR_vccho2 = loc.TOUR_vccho2 || "Define your corpus here.";
  loc.TOUR_vcStat1 = loc.TOUR_vcStat1 || "Click here to display corpus statistic.";
  loc.TOUR_vcStat2 = loc.TOUR_vcStat2 || "Corpus statistic";
  loc.TOUR_qlfield = loc.TOUR_qlfield|| "Selection of the query language: You can use KorAP with different query languages.";  
  loc.TOUR_help = loc.TOUR_help || "Help and information about KorAP.";
  loc.TOUR_glimpse = loc.TOUR_glimpse || "Select this to show only the first hits in undefined order.";
  loc.TOUR_seargo = loc.TOUR_seargo || "Start the search";

  //localization guided Tour gTshowResults
  loc.TOUR_kwic = loc.TOUR_kwic || "KWIC result (keyword in context)";
  loc.TOUR_snippet = loc.TOUR_snippet ||  "Click on a match to show a larger snippet.";
  loc.TOUR_snippetb = loc.TOUR_snippetb || "Snippet";
  loc.TOUR_metadatab =  loc.TOUR_metadatab || "Display of metadata";
  loc.TOUR_metadata = loc.TOUR_metadata || "Metadata";
  loc.TOUR_tokenb = loc.TOUR_tokenb || "Display of token annotations";
  loc.TOUR_token = loc.TOUR_token || "KorAP supports multiple annotations.";
  loc.TOUR_treeb = loc.TOUR_treeb || "Display further annotations"
  loc.TOUR_tree = loc.TOUR_tree || "Further annotations can be displayed as tree and arch views."
  loc.TOUR_tourdone = loc.TOUR_tourdone || "Have fun with KorAP!";
  
  //localization of button labels
  let labelOpts= {
      'skipLabel': loc.TOUR_lskip, 
      'prevLabel': loc.TOUR_lprev,
      'nextLabel': loc.TOUR_lnext,
      'doneLabel': loc.TOUR_ldone,
      'showStepNumbers': false
  };
  
  //usability options of tours
  let usabilityOpts ={
      'showBullets': false,
      'overlayOpacity': 0.7,
      'exitOnOverlayClick': false,
      'disableInteraction': true,      
      'hideNext': true,
      'hidePrev': true
  };
  
  var doe = document;

  return{

    /** 
     * Guided Tour gTstartSearch: Explains the search functionality
     */
    gTstartSearch:function(elparam){
      let intro = introClass();
      intro.setOptions(labelOpts);
      intro.setOption('tooltipClass', 'gTstartSearch');
      /*
       * Sets button labels for the last step of the tour
       * Because Kalamar is a multipage webapplication, this tours starts by
       * completion the gTshowResults Tour. Therefore the label of the done button changed.
        */
      intro.setOption('doneLabel', loc.TOUR_ldoneSearch );
      intro.setOptions(usabilityOpts);
      
      //for testing purposes
      if(elparam){
        doe = elparam;
      }

      let input = doe.querySelector("#q-field");
      input.value="";
      

      //steps of the example tour
      let Steps =[
        {
          intro: loc.TOUR_welc,
        },
        {
          element: '#q-field',
          intro: loc.TOUR_sear1,
          position: 'bottom'
        },
        {
          element: '#hint',
          intro: loc.TOUR_searAnnot,
          position: 'bottom'
        },
        {
          element: doe.querySelector("#hint > .menu.hint"),
          intro: loc.TOUR_annotAss,
          position: 'bottom',
          }, 
        {
          element:'#vc-choose',
          intro: loc.TOUR_vccho1,
          position: "bottom",
        },
        {
          element:'#vc-view',
          intro: loc.TOUR_vccho2,
          position: "bottom",
        }, 
        {
          element: doe.querySelector('.statistic'),
          intro: loc.TOUR_vcStat1,
          position: "left",
        },
        {
          element: doe.querySelector('.stattable'),
          intro: loc.TOUR_vcStat2,
          position: "bottom",
        },
        {
          element: doe.querySelector('#ql-field').parentNode,
          intro: loc.TOUR_qlfield,
          position: "bottom",
        },  
        {
          element:'#glimpse',
          intro: loc.TOUR_glimpse,
          position: "bottom",
        }, 
        {
          element:'#view-tutorial',
          intro: loc.TOUR_help,
          position: "bottom",
        },
        {
          element: '#qsubmit',
          intro: loc.TOUR_seargo,
          position: "bottom",
        },
        ];

      //pass in the Steps array created earlier
      intro.setOptions({steps: Steps});      
      this.testPrerequ(Steps, intro);

      //changes before executing the single steps
      intro.onbeforechange(function(targetedElement){
        switch(targetedElement.id){
        case "q-field": 
          /* 
           * TODO:
           * #268 is not merged at the time beeing: 
           * introJs.currentStep() merge requested https://github.com/usablica/intro.js/pull/268/files
           */
            targetedElement.value = loc.TOUR_Qexample;
          break;
        case "vc-view":  
          vchoo = doe.querySelector("#vc-choose");
          vcv = doe.querySelector("#vc-view");  
          KorAP._delete.apply(KorAP.vc.root());
    
          KorAP.vc.fromJson(loc.TOUR_vcQuery);
          if(!(vcv.querySelector(".active"))){
            vchoo.click();
            /*
             * Intro.js caches elements at the beginning, so element and position has to be set again.
             */
            intro._introItems[6].element = doe.querySelector('.statistic');
            intro._introItems[6].position = "left";
          }   
          break;   
          
        } 
        
        if(this._currentStep == 7){
          let statbut = doe.querySelector('.statistic');
          statbut.click();
          intro._introItems[7].element = doe.querySelector(".stattable");
          intro._introItems[7].position = "bottom";
        }
      });

      intro.onbeforeexit(function(){
          if(KorAP.Hint.active() && KorAP.Hint.active().dontHide){
            KorAP.Hint.unshow();
          }
        });
      
      intro.onchange(function(targetElement) {
        var that = this; 
        switch(this._currentStep){
        //hides Hint if back button is pressed 
        case 2:   
          if(KorAP.Hint.active()){
          KorAP.Hint.unshow(); 
          }
          break;
        case 3:
          KorAP.Hint.show(false);
          KorAP.Hint.active().dontHide = true;
          intro._introItems[3].element = doe.querySelector(".menu.roll.hint");
          intro._introItems[3].position = doe.querySelector("bottom");
          break;
        case 4: 
          KorAP.Hint.unshow();      
          break;
        }
        });  
      
      // Execute at the end of the tour (By clicking at the done-Button)
      intro.oncomplete(function(){
        KorAP.session.set("tour", true);
        doe.getElementById("qsubmit").click();
      });

      return intro;
    },


    /* Guided Tour to explain the different views of the results */     
    gTshowResults: function(elparam){     
    
      let tourR = introClass();
      tourR.setOptions(usabilityOpts);
      
      //for testing purposes
      if(elparam){
        doe = elparam;
      }
      let StepsSR = [
        //Step 1, intro_item 0
        {
          element: '#search',
          intro: loc.TOUR_kwic ,
          position: "auto",
        },
        //Step 2, intro_item 1 
        {
          element: doe.querySelector("#search > ol > li"),
          intro: loc.TOUR_snippet,
          position: "bottom",
        },
        //Step 3, intro_item 2 
        {
          element: doe.querySelector("#search > ol > li"),
          intro: loc.TOUR_snippetb,
          position: "bottom",
        },
        //Step 4, intro_item 3
        {
          element: doe.querySelector(".action > .metatable"),
          intro: loc.TOUR_metadatab,
          position: "bottom",
        },
        //Step 5, intro_item 4
        {
          element: doe.querySelector(".view.metatable"),
          intro: loc.TOUR_metadata,
          position: "auto",
        },
        //Step 6, intro_item 5
        {   
          element: doe.querySelector(".action > .info"),
          intro: loc.TOUR_tokenb,
          position: "bottom",
        },
        //Step 7, intro_item 6
        {   
          element: doe.querySelector(".view.tokentable"),
          intro: loc.TOUR_token,
          position: "auto",
        },
        //Step 8, intro_item 7
        {     
          element: doe.querySelector(".tree"),
          intro: loc.TOUR_treeb,
          position: "bottom",
        }, 
        //Step 9, intro_item 8
        {     
          element: doe.querySelector(".view.relations"),
          intro: loc.TOUR_tree,
          position: "bottom",
        }, 
        //Step 10, intro_item 9
        {     
          intro: loc.TOUR_tourdone, 
        }    
        ]
      
        tourR.setOptions({steps:StepsSR});
        tourR.setOptions(labelOpts);
     
        tourR.onbeforeexit(function(){
          KorAP.session.set("tour", false);
        });
        //See also: https://introjs.com/docs/intro/options/
        tourR.setOption('scrollToElement', true);
        tourR.setOption('scrollTo','tooltip');
        this.testPrerequ(StepsSR, tourR);
      
        //TODO see also: introJS.totalSteps() merge requested: //github.com/usablica/intro.js/pull/268/files
        tourR.onbeforechange(function(targetedElement){
          
        if(this._currentStep == 1){
          KorAP.session.set("tour", false);
        }
        
        if(this._currentStep == 2){
          doe.querySelector("#search > ol > li").click();
          tourR._introItems[3].element = doe.querySelector('.action > .metatable');
          tourR._introItems[3].position = "bottom";
        }
  
        if(this._currentStep == 4){
          doe.querySelector(".metatable").click();
          tourR._introItems[4].element = doe.querySelector('.view.metatable');
          tourR._introItems[5].element = doe.querySelector('.action > .info');
          tourR._introItems[5].position = "bottom";          
        }   
     
        if(this._currentStep == 6){
            doe.querySelector(".info").click();
            tourR._introItems[6].element = doe.querySelector('.view.tokentable');
            tourR._introItems[7].element = doe.querySelector('.tree');
            tourR._introItems[7].position = "bottom";
          }
      
        if(this._currentStep == 8){
          doe.querySelector(".tree").click();
          let collect =  document.querySelectorAll(".button-group-list")[0].querySelectorAll('li');
          for(let i = 0;  i < collect.length; i++){
            if (collect[i].innerText == loc.TOUR_Relations) {
              collect[i].click();
              break;
            }
          }
          tourR._introItems[8].element = doe.querySelector(".view.relations");
        }
      });       
  
      return tourR;
    },  
    /* 
     * The total number of steps and the text of the tooltips are needed for jasmine testing.
     */
    testPrerequ: function(steps, tour){
      //TODO see also: introJS.totalSteps() merge requested: //github.com/usablica/intro.js/pull/268/files
      let StepsT = steps;
      let gtour = tour;      
      gtour.stepCount = StepsT.length;

      //Array of intro content needed for efficient testing
      gtour.testIntros = [];

      for(let i = 0; i< StepsT.length; i++){
      gtour.testIntros.push(StepsT[i].intro);
      }
    },

  }
});
