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
  
  //localization tours
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
  
  //localization of button labels
   let labelOptions = {
          'skipLabel': loc.TOUR_lskip, 
          'prevLabel': loc.TOUR_lprev,
          'nextLabel': loc.TOUR_lnext,
          'doneLabel': loc.TOUR_ldone,
          'showStepNumbers': false,
  };
  
  let intro = introClass();
  intro.setOptions(labelOptions);
  
  
  return{
    
    /** 
     * Guided Tour: Definition of steps 
     */
    guidedTour:function(elparam){
      
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
      //See also: introJS.totalSteps() merge requested: //github.com/usablica/intro.js/pull/268/files
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
              input.value="Baum";
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
    });
    
    // Execute at the end of the tour (By clicking at the done-Button)
    intro.oncomplete(function(){
      input.value="";
      KorAP._delete.apply(KorAP.vc.root());
      });
    
    return intro;
    },
  }
});
