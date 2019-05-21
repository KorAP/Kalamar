/**
 * Guided Tour to explain the UI
 * 
 * @author Helge Stallkamp
 */

define(['lib/intro', 'vc'], function(introClass, vcClass) {

  //needed for localization of labels and contents of the tour
  const loc   = KorAP.Locale;

  //labels for nextStep, previousStep, done and abort
  loc.TOUR_lskip = loc.TOUR_lskip || "Abort";
  loc.TOUR_lprev = loc.TOUR_lprev || "Back";
  loc.TOUR_lnext = loc.TOUR_lnext || "Next";
  loc.TOUR_ldone = loc.TOUR_ldone || "Done";

  //localization guided tour gTstartSearch
  loc.TOUR_sear1 = loc.TOUR_sear1 || "Enter your search enquiry here.";
  loc.TOUR_sear2 = loc.TOUR_sear2 || "For example the search for 'Baum'...";
  loc.TOUR_searAnnot = loc.TOUR_searAnnot || "Annotation helper: By clicking here, the annotations of the differents layers are displayed and can be selected.";
  loc.TOUR_annotAss =  loc.TOUR_annotAss || "The annoation assistant helps to formulate queries with annotations";
  loc.TOUR_vccho1 = loc.TOUR_vccho1 || "Choose corpus by clicking here.";  
  loc.TOUR_vccho2 = loc.TOUR_vccho2 || "Define your corpus here.";
  loc.TOUR_vcStat = loc.TOUR_vcStat || "Display corpus statistic.";
  loc.TOUR_qlfield = loc.TOUR_qlfield|| "You can use KorAP with different query languages, select the query language here.";  
  loc.TOUR_help = loc.TOUR_help || "Help and more information about KorAP.";
  loc.TOUR_glimpse = loc.TOUR_glimpse || "Select to show only the first hits in arbitrary order.";
  loc.TOUR_seargo = loc.TOUR_seargo || "Start the search.";
  //localization guided Tour gTshowResults
  loc.TOUR_result = loc.TOUR_result || "Have fun with KorAP!";
  
  //localization of button labels
  let labelOptions = {
      'skipLabel': loc.TOUR_lskip, 
      'prevLabel': loc.TOUR_lprev,
      'nextLabel': loc.TOUR_lnext,
      'doneLabel': loc.TOUR_ldone,
      'showStepNumbers': false,
  };

  return{

    /** 
     * Guided Tour gTstartSearch: Explains the search functionality
     */
    gTstartSearch:function(elparam){

      let intro = introClass();
      intro.setOptions(labelOptions);

      //for testing purposes
      var doe = document;
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
          element: doe.querySelector('#searchbar button[type=submit]'),
          intro: loc.TOUR_seargo,
          position: "bottom",
        },
        ];

      //pass in the Steps array created earlier
      intro.setOptions({steps: Steps});

      //total number of steps, needed for jasmine tests
      //TODO see also: introJS.totalSteps() merge requested: //github.com/usablica/intro.js/pull/268/files
      intro.stepCount = Steps.length;

      //array of intro content needed for efficient testing
      intro.testIntros = [];

      for(let i = 0; i< Steps.length; i++){
        intro.testIntros.push(Steps[i].intro);
      }

      //changes before executing the single steps
      intro.onbeforechange(function(targetedElement){
        switch(targetedElement.id){
        case "searchbar": 
          if(this._currentStep == 1){ 
            input = doe.querySelector('#q-field');
            input.value="tanzen";
          }   
          break;

        case "vc-view":  
          vchoo = doe.querySelector("#vc-choose");
          vcv = doe.querySelector("#vc-view");  
          KorAP._delete.apply(KorAP.vc.root());
          KorAP.vc.root().key("creationDate").update();
          KorAP.vc.root().value("1820").update();  
          if(!(vcv.querySelector(".active"))){
            vchoo.click();
          }   
          break;     
        } 

        /*
         * Sets button labels for the last step of the tour
         * Because Kalamar is a multipage webapplication, this tours starts by
         * completion the gTshowResults Tour. Therefore, the skip-button is removed
         * and the label of the done button changed.
         */
        if(targetedElement == doe.querySelector('#searchbar button[type=submit]')){
          let clLabelOptions = {
              'prevLabel': loc.TOUR_lprev,
              'doneLabel': loc.TOUR_seargo,
              'showStepNumbers': false,
              'hideNext': true,
          };
          intro.setOptions(clLabelOptions);
        }
      });


      // Execute at the end of the tour (By clicking at the done-Button)
      intro.oncomplete(function(){
        let form = doe.getElementById("searchform");
        let inputTour = doe.createElement("input");
        inputTour.setAttribute("type", "hidden");
        inputTour.setAttribute("name", "intr");
        inputTour.setAttribute("value", "1");
        form.appendChild(inputTour);
        form.submit();
        //input.value="";
        //KorAP._delete.apply(KorAP.vc.root());
      });

      return intro;
    },


    /* Guided Tour to explain the different views of the results */     
    gTshowResults: function(elparam){  
      if(elparam){
        doe = elparam;
      }
      let tourR = introClass();
      let StepsSR = [
        {     
          intro: loc.TOUR_result,
        }
        ]
      tourR.setOptions({steps:StepsSR});
      tourR.setOptions(labelOptions);
      return tourR;
    },  

  }
});
