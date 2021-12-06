/**
 * Guided Tour to explain the UI
 * 
 * @author Helge Stallkamp
 */
"use strict";

define(['lib/intro', 'vc', 'hint', 'menu', 'vc/doc', 'vc/docgroup'],
       function(introClass, vcClass, hintClass, menuClass, docClass, docGroup) {

  //needed for localization of labels and contents of the tour
  const loc   = KorAP.Locale;

  //labels for nextStep, previousStep and done
  loc.TOUR_lprev = loc.TOUR_lprev || "Back";
  loc.TOUR_lnext = loc.TOUR_lnext || "Next";
  loc.TOUR_ldone = loc.TOUR_ldone || "Done";
  loc.TOUR_ldoneSearch = loc.TOUR_ldoneSearch || "Search";
  
  //localization guided tour gTstartSearch
  loc.TOUR_welcti = loc.TOUR_welcti || "<span class='tgreeting'> Welcome to our guided tour! </span>";
  loc.TOUR_welc = loc.TOUR_welc || "This tour should give you a quick introduction to KorAP. " +
  		                           "We lead you step by step through an example.";
  loc.TOUR_sear1ti = loc.TOUR_sear1ti || "Query";
  loc.TOUR_sear1 = loc.TOUR_sear1 || "Enter your query here, for example the search for '" +  loc.TOUR_Qexample + "'.";
  loc.TOUR_searAnnotti =   loc.TOUR_searAnnotti || "Annotation Assistant (1)";
  loc.TOUR_searAnnot = loc.TOUR_searAnnot || "<p> For querying annotations you can use the annotation assistant. </p> " +
                                             "<p>  Click the orange bar " +
                                             "or press the down arrow key &darr; for display. </p>";
  loc.TOUR_annotAssti =  loc.TOUR_annotAssti || "Annotation Assistant (2)";
  loc.TOUR_annotAss =  loc.TOUR_annotAss || "The annotation assistant helps in formulating queries by listing various annotation foundries and layers.";
  loc.TOUR_vccho1ti = loc.TOUR_vccho1ti || "Corpora Selection",
  loc.TOUR_vccho1 = loc.TOUR_vccho1 || "Click here to show the corpus assistant.";  
  loc.TOUR_vccho2ti = loc.TOUR_vccho2ti || "Corpus Assistant (1)";
  loc.TOUR_vccho2 = loc.TOUR_vccho2 || "With the help of the assistant you can define virtual corpora on the basis of metadata.";
  loc.TOUR_vccho3ti = loc.TOUR_vccho3ti || "Corpus Assistant (2)";
  loc.TOUR_vccho3 = loc.TOUR_vccho3 || "A drop down box lists some of the available metadata fields.";
  loc.TOUR_vccho4ti =  loc.TOUR_vccho4ti || "Corpus Assistant (3)";
  loc.TOUR_vccho4 = loc.TOUR_vccho4 || "This example defines a virtual corpus consisting of all documents with the document sigle " + loc.TOUR_DocSigle + ".";
  loc.TOUR_vcStat1ti = loc.TOUR_vcStat1ti || "Corpus Statistics (1)";
  loc.TOUR_vcStat1 = loc.TOUR_vcStat1 || "Click here to display the corpus statistics.";
  loc.TOUR_vcStat2ti = loc.TOUR_vcStat2ti || "Corpus Statistics (2)";
  loc.TOUR_vcStat2 = loc.TOUR_vcStat2 || "Here you can see the corpus statistics.";
  loc.TOUR_qlfieldti = loc.TOUR_qlfieldti ||"Query Languages";
  loc.TOUR_qlfield = loc.TOUR_qlfield|| "You can use KorAP with different query languages. Choose your preferred query language here. ";  
  loc.TOUR_helpti = loc.TOUR_helpti || "Help";
  loc.TOUR_help = loc.TOUR_help || "Here you can find help and information about KorAP.";
  loc.TOUR_glimpseti = loc.TOUR_glimpseti || "Glimpse";
  loc.TOUR_glimpse = loc.TOUR_glimpse || "Select this to show only the first hits in undefined order.";
  loc.TOUR_seargoti = loc.TOUR_seargoti || "Query";
  loc.TOUR_seargo = loc.TOUR_seargo || "Start the search by clicking the magnifying glass.";

  //localization guided Tour gTshowResults
  loc.TOUR_kwicti = loc.TOUR_kwicti || "Results";
  loc.TOUR_kwic = loc.TOUR_kwic || "The results of the query are displayed as KWIC (keyword in context). On the left side, you can see the according text sigle.";
  loc.TOUR_snippetti = loc.TOUR_snippetti ||  "KWIC (2)";
  loc.TOUR_snippet = loc.TOUR_snippet ||  "Click on a match to show a larger snippet.";
  loc.TOUR_snippetbti = loc.TOUR_snippetbti || "Snippet";
  loc.TOUR_snippetb = loc.TOUR_snippetb || "At the bottom of the snippet, there is a group of buttons to show more result views.";
  loc.TOUR_metadatabti =  loc.TOUR_metadatabti || "Metadata (1)";
  loc.TOUR_metadatab =  loc.TOUR_metadatab || "Click here to display the metadata.";
  loc.TOUR_metadatati = loc.TOUR_metadatati || "Metadata (2)";
  loc.TOUR_metadata = loc.TOUR_metadata || "Display of metadata";
  loc.TOUR_tokenbti = loc.TOUR_tokenbti || "Token Annotations";
  loc.TOUR_tokenb = loc.TOUR_tokenb || "Click here to show the token annotations.";
  loc.TOUR_tokenti = loc.TOUR_tokenti || "Annotations";
  loc.TOUR_token = loc.TOUR_token || "KorAP supports multiple annotations.";
  loc.TOUR_treebti = loc.TOUR_treebti || "Relational Annotations (1)";
  loc.TOUR_treeb = loc.TOUR_treeb || "Click here to display relational annotations.";
  loc.TOUR_treeti = loc.TOUR_treeti || "Relational Annotations (2)"
  loc.TOUR_tree = loc.TOUR_tree || "Relational annotations can be displayed as tree and arch views."
  loc.TOUR_tourdone = loc.TOUR_tourdone || "Have fun with KorAP!";

  
  //localization of button labels
  let labelOpts= {
      'prevLabel': loc.TOUR_lprev,
      'nextLabel': loc.TOUR_lnext,
      'doneLabel': loc.TOUR_ldone,
      'showStepNumbers': false
  };
  
  //usability options of tours
  let usabilityOpts ={
      'showBullets': false,
      'overlayOpacity': 0.5,
      'exitOnOverlayClick': false,
      'disableInteraction': true,  
      'tooltipClass': 'customTooltip',
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
        //Step 1, intro_item 0
        {  
          element: '#link-guided-tour',
          title: loc.TOUR_welcti,
          intro: loc.TOUR_welc,
          position: 'right',
        },
        //Step 2, intro_item 1
        {
          title: loc.TOUR_sear1ti,
          element: '#q-field',
          intro: loc.TOUR_sear1,
          position: 'bottom'
        },
        //Step 3, intro_item 2
        {
          title: loc.TOUR_searAnnotti,
          element: '#hint',
          intro: loc.TOUR_searAnnot,
          position: 'auto'
        },
        //Step 4, intro_item 3
        {
          title: loc.TOUR_annotAssti,
          element: doe.querySelector("#hint > .menu.hint"),
          intro: loc.TOUR_annotAss,
          position: 'bottom',
          }, 
        //Step 5, intro_item 4
        {
          title: loc.TOUR_vccho1ti, 
          element:'#vc-choose',
          intro: loc.TOUR_vccho1,
          position: "bottom",
        },
        //Step 6, intro_item 5
        {
          title: loc.TOUR_vccho2ti,
          element:'#vc-view',
          intro: loc.TOUR_vccho2,
          position: "bottom",
        }, 
        //Step 7, intro_item 6
        {  
          title: loc.TOUR_vccho3ti,
          element: doe.querySelector('#vc-view * .doc > menu'),
          intro: loc.TOUR_vccho3,
          position: "left",
        }, 
        //Step 8, intro_item 7
        {
          title: loc.TOUR_vccho4ti,
          element: doe.querySelector('#vc-view * .doc'),
          intro: loc.TOUR_vccho4,
          position: "left",
        }, 
        //Step 9, intro_item 8
        {
          title: loc.TOUR_vcStat1ti,
          element: doe.querySelector('.statistic'),
          intro: loc.TOUR_vcStat1,
          position: "left",
        },
        //Step 10, intro_item 9
        {
          title: loc.TOUR_vcStat2ti,
          element: doe.querySelector('.stattable'),
          intro: loc.TOUR_vcStat2,
          position: "bottom",
        },
        //Step 11, intro_item 10
        {
          title: loc.TOUR_qlfieldti,
          element: doe.querySelector('#ql-field').parentNode,
          intro: loc.TOUR_qlfield,
          position: "bottom",
        },  
        {
          title: loc.TOUR_glimpseti,
          element: doe.querySelector('#glimpse').parentNode,
          intro: loc.TOUR_glimpse,
          position: "bottom",
        }, 
        {
          title: loc.TOUR_helpti,
          element:'#view-tutorial',
          intro: loc.TOUR_help,
          position: "bottom",
        },
        {
          title: loc.TOUR_seargoti,
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
          let vchoo = doe.querySelector("#vc-choose");
          let vcv = doe.querySelector("#vc-view");  
          KorAP._delete.apply(KorAP.vc.root());
          if(!(vcv.querySelector(".active"))){
            vchoo.click();
            /*
             * Intro.js caches elements at the beginning, so element and position has to be set again.
             */
            intro._introItems[8].element = doe.querySelector('.statistic');
            intro._introItems[8].position = "left";
          }   
          intro._introItems[7].element = doe.querySelector('#vc-view * .doc');
          intro._introItems[7].position = "left";
          break;    
        } 
        if(this._currentStep == 9){
          let statbut = doe.querySelector('.statistic');
          statbut.click();
          intro._introItems[9].element = doe.querySelector(".stattable");
          intro._introItems[9].position = "bottom";
        }
      });

      intro.onbeforeexit(function(){
          if(KorAP.Hint.active() && KorAP.Hint.active().dontHide){
            KorAP.Hint.unshow();
          }
          if (KorAP._vcKeyMenu.dontHide){
          KorAP._vcKeyMenu.dontHide = false;
          KorAP._vcKeyMenu.hide();
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
          KorAP._vcKeyMenu.dontHide = false;
          break;
        case 6:
          let vccbut = doe.querySelector('#vc-view * .doc > span');  
          vccbut.click();
          KorAP._vcKeyMenu.dontHide = true;
          intro._introItems[6].element = doe.querySelector('#vc-view * .menu.roll');
          intro._introItems[6].position = "left";
          break;
        case 7: 
          KorAP._vcKeyMenu.dontHide = false;
          KorAP._vcKeyMenu.hide();
          KorAP.vc.fromJson(loc.TOUR_vcQuery);
          intro._introItems[7].element = doe.querySelector('#vc-view * .doc');
          intro._introItems[7].position = "left";
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
          title: loc.TOUR_kwicti,
          element: '#search',
          intro: loc.TOUR_kwic ,
          position: "auto",
        },
        //Step 2, intro_item 1 
        { 
          title: loc.TOUR_snippetti,
          element: doe.querySelector("#search > ol > li"),
          intro: loc.TOUR_snippet,
          position: "bottom",
        },
        //Step 3, intro_item 2 
        { 
          title: loc.TOUR_snippetbti,
          element: doe.querySelector("#search > ol > li"),
          intro: loc.TOUR_snippetb,
          position: "bottom",
        },
        //Step 4, intro_item 3
        { 
          title: loc.TOUR_metadatabti,
          element: doe.querySelector(".action > .metatable"),
          intro: loc.TOUR_metadatab,
          position: "bottom",
        },
        //Step 5, intro_item 4
        { 
          title: loc.TOUR_metadatati,
          element: doe.querySelector(".view.metatable"),
          intro: loc.TOUR_metadata,
          position: "auto",
        },
        //Step 6, intro_item 5
        { 
          title: loc.TOUR_tokenbti,
          element: doe.querySelector(".action > .info"),
          intro: loc.TOUR_tokenb,
          position: "bottom",
        },
        //Step 7, intro_item 6
        { 
          title: loc.TOUR_tokenti,
          element: doe.querySelector(".view.tokentable"),
          intro: loc.TOUR_token,
          position: "auto",
        },
        //Step 8, intro_item 7
        {      
          title: loc.TOUR_treebti,
          element: doe.querySelector(".tree"),
          intro: loc.TOUR_treeb,
          position: "bottom",
        }, 
        //Step 9, intro_item 8
        {    
          title: loc.TOUR_treeti,  
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
