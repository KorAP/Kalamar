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

  //localization guided tour gTstartSearch
  loc.TOUR_sear1 = loc.TOUR_sear1 || "Enter your search enquiry here.";
  loc.TOUR_sear2 = loc.TOUR_sear2 || "For example the search for '" +  loc.TOUR_Qexample + "'.";
  loc.TOUR_searAnnot = loc.TOUR_searAnnot || "Annotation helper: By clicking, the annotations of the differents layers are displayed and can be selected.";
  loc.TOUR_annotAss =  loc.TOUR_annotAss || "The annoation assistant helps to formulate queries with annotations";
  loc.TOUR_vccho1 = loc.TOUR_vccho1 || "Choose corpus";  
  loc.TOUR_vccho2 = loc.TOUR_vccho2 || "Define your corpus here.";
  loc.TOUR_vcStat1 = loc.TOUR_vcStat1 || "Click here to display corpus statistic.";
  loc.TOUR_vcStat2 = loc.TOUR_vcStat2 || "Corpus statistic";
  loc.TOUR_qlfield = loc.TOUR_qlfield|| "You can use KorAP with different query languages, select the query language here.";  
  loc.TOUR_help = loc.TOUR_help || "Help and more information about KorAP.";
  loc.TOUR_glimpse = loc.TOUR_glimpse || "Select to show only the first hits in arbitrary order.";
  loc.TOUR_seargo = loc.TOUR_seargo || "Start the search.";

  //localization guided Tour gTshowResults
  loc.TOUR_kwic = loc.TOUR_kwic || "KWIC result (keyword in context)";
  loc.TOUR_snippet = loc.TOUR_snippet ||  "Click here to show a larger snippet.";
  loc.TOUR_metadatab =  loc.TOUR_metadatab || "Click here to display the metadata.";
  loc.TOUR_metadata = loc.TOUR_metadata || "Metadata";
  loc.TOUR_tokenb = loc.TOUR_tokenb || "Click here to display the token annotations.";
  loc.TOUR_token = loc.TOUR_token || "KorAP supports multiple annotations.";
  loc.TOUR_treeb = loc.TOUR_treeb || "Display further annotations as tree and arch views."
  loc.TOUR_tree = loc.TOUR_tree || "Here as an example one possible view."
  loc.TOUR_tourdone = loc.TOUR_tourdone || "Have fun with KorAP!";
  
  //localization of button labels
  let labelOptions = {
      'skipLabel': loc.TOUR_lskip, 
      'prevLabel': loc.TOUR_lprev,
      'nextLabel': loc.TOUR_lnext,
      'doneLabel': loc.TOUR_ldone,
      'showStepNumbers': false,
  };
  
  var doe = document;

  return{

    /** 
     * Guided Tour gTstartSearch: Explains the search functionality
     */
    gTstartSearch:function(elparam){
      let intro = introClass();
      intro.setOptions(labelOptions);
      intro.setOption('doneLabel', loc.TOUR_seargo);
     
      //for testing purposes
      if(elparam){
        doe = elparam;
      }

      let input = doe.querySelector("#q-field");
      input.value="";
      

      //steps of the example tour
      let Steps =[
        {
          element: '#searchbar',
          intro: loc.TOUR_sear1,
          position: 'bottom'
        },
        {
          element: '#searchbar',
          intro: loc.TOUR_sear2,
          position: 'bottom'
        },
        {
          element: '#hint',
          intro: loc.TOUR_searAnnot,
          position: 'bottom'
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
        case "searchbar": 
          /* 
           * TODO:
           * #268 is not merged at the time beeing: 
           * introJs.currentStep() merge requested https://github.com/usablica/intro.js/pull/268/files
           */
          if(this._currentStep == 1){ 
            input = doe.querySelector('#q-field');
            input.value= loc.TOUR_Qexample;
          }   
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
            intro._introItems[5].element = doe.querySelector('.statistic');
            intro._introItems[5].position = "left";
          }   
          break;   
          
        /*
        * Sets button labels for the last step of the tour
        * Because Kalamar is a multipage webapplication, this tours starts by
        * completion the gTshowResults Tour. Therefore, the skip-button is removed
        * and the label of the done button changed.
         */
        case "qsubmit":
            intro.setOption('hideNext', true);
          break;
        } 
        
        if(this._currentStep == 6){
          let statbut = doe.querySelector('.statistic');
          statbut.click();
          intro._introItems[6].element = doe.querySelector(".stattable");
          intro._introItems[6].position = "bottom";
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
      //for testing purposes
      if(elparam){
        doe = elparam;
      }
      let tourR = introClass();
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
          element: doe.querySelector(".action > .metatable"),
          intro: loc.TOUR_metadatab,
          position: "bottom",
        },
        //Step 4, intro_item 3
        {
          element: doe.querySelector(".view.metatable"),
          intro: loc.TOUR_metadata,
          position: "auto",
        },
        //Step 5, intro_item 4
        {   
          element: doe.querySelector(".action > .info"),
          intro: loc.TOUR_tokenb,
          position: "bottom",
        },
        //Step 6, intro_item 5
        {   
          element: doe.querySelector(".view.tokentable"),
          intro: loc.TOUR_token,
          position: "auto",
        },
        //Step 7, intro_item 6
        {     
          element: doe.querySelector(".tree"),
          intro: loc.TOUR_treeb,
          position: "bottom",
        }, 
        //Step 8, intro_item 7
        {     
          element: doe.querySelector("view.relations"),
          intro: loc.TOUR_tree,
          position: "auto",
        }, 
        //Step 9, intro_item 8
        {     
          intro: loc.TOUR_tourdone, 
        }    
        ]
      
        tourR.setOptions({steps:StepsSR});
        tourR.setOptions(labelOptions);
      
        tourR.onbeforechange(function (){ 
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
          tourR._introItems[2].element = doe.querySelector('.action > .metatable');
          tourR._introItems[2].position = "bottom";
          tourR._introItems[3].element = doe.querySelector('.view.metatable');
        }
  
        if(this._currentStep == 3){
          doe.querySelector(".metatable").click();
          tourR._introItems[3].element = doe.querySelector('.view.metatable');
          tourR._introItems[4].element = doe.querySelector('.action > .info');
          tourR._introItems[4].position = "bottom";          
        }   
     
        if(this._currentStep == 5){
            doe.querySelector(".info").click();
            tourR._introItems[5].element = doe.querySelector('.view.tokentable');
            tourR._introItems[6].element = doe.querySelector('.tree');
            tourR._introItems[6].position = "bottom";
          }
      
        if(this._currentStep == 7){
          doe.querySelector(".tree").click();
          document.querySelectorAll(".button-group-list")[0].querySelectorAll('li')[1].click();
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
