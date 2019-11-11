define(function () {
  const loc = KorAP.Locale;
  loc.OR = 'oder';
  loc.AND = 'und';
  // EMPTY, DELETE

  // Virtual corpus:
  loc.VC_allCorpora = 'allen Korpora';
  loc.VC_oneCollection = 'einem virtuellen Korpus';

  // Date picker:
  loc.WDAY = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  loc.MONTH = [
    'Januar', 'Februar', 'März', 'April',
    'Mai', 'Juni', 'Juli', 'August',
    'September', 'Oktober', 'November',
    'Dezember'
  ];

  // Match view
  loc.ADDTREE   = 'Relationen';
  loc.SHOWANNO  = 'Token';
  loc.SHOWINFO  = 'Informationen';
  loc.CLOSE     = 'Schließen';
  loc.MINIMIZE  = 'Zuklappen';
  loc.DOWNLOAD  = 'Herunterladen';
  loc.TOGGLE_ALIGN = 'tausche Textausrichtung';
  loc.SHOW_KQ      = 'zeige KoralQuery';
  loc.SHOW_META    = 'Metadaten';
  loc.NEW_QUERY = 'Neue Anfrage';
  
  //Corpus statistic
  loc.SHOW_STAT = 'Korpusstatistik';
  loc.REFRESH = 'Neu laden';
  //verbose description, for title attributes for example
  //loc.VERB_SHOWSTAT = 'Korpusstatistik';

  loc.NEW_CONSTRAINT = 'Neue Bedingung';

  //Guided Tour:Buttonlabels
  loc.TOUR_lskip = "Abbrechen";
  loc.TOUR_lprev = "Zurück";
  loc.TOUR_lnext = "Weiter";
  loc.TOUR_ldone = "Beenden";
  loc.TOUR_ldoneSearch = "Suchen";
  
  //Guided Tour: Steps
  loc.TOUR_welc = "<span class = 'tgreeting'>Willkommen zur KorAP Tour! </span> " +
  "<p class='pfirstStep'> Hier zeigen wir Ihnen einige wichtige Funktionalitäten von KorAP. </p>" + 
  "<p> Bitte beachten sie: Haben sie bereits eine Suchanfrage oder ein Korpus definiert," +
  "werden diese während der Tour gelöscht. Falls Sie das nicht wollen, können sie die Tour jetzt mit <code>" +  
  loc.TOUR_lskip + "</code> beenden.</p>"; 
  loc.TOUR_sear1 = "Geben Sie die Suchanfrage hier ein.";
  loc.TOUR_sear2 = "Zum Beispiel die Suche nach '"+ loc.TOUR_Qexample +  "'.";
  loc.TOUR_searAnnot ="Für die Suche nach Annotationen steht der Annotationsassistent zur Verfügung.";
  loc.TOUR_annotAss = "Der Annotationsassistent erleichert die Formulierung von Suchanfragen mit Annotationen.";
  loc.TOUR_vccho1 = "Öffnen des Korpusassistenten";
  loc.TOUR_vccho2 = "Eigene Definition von Subkorpora durch Verknüpfung beliebiger Metadatenfelder.";
  loc.TOUR_vcStat1 = "Es besteht die Möglichkeit, die Korpusstatistik anzuzeigen.";
  loc.TOUR_vcStat2 = "Korpusstatistik";
  loc.TOUR_qlfield = "Auswahl der Suchanfragesprache: In KorAP können mehrere Suchanfragesprachen verwendet werden.";
  loc.TOUR_glimpse = "Beim Wählen dieser Option wird festgelegt ob nur die ersten Treffer in undefinierter Reihenfolge ausgewählt werden.";
  loc.TOUR_help = "Hilfe zu KorAP";
  loc.TOUR_seargo = "Suchanfrage starten";

  
  //Guided Tour: explain the result
  loc.TOUR_kwic = "Anzeige des Ergebnisses als KWIC (keyword in context).";
  loc.TOUR_snippet = "Durch Klicken auf das KWIC kann ein größerer Kontext angezeigt werden.";  
  loc.TOUR_snippetb = "Anzeige des Snippets";
  loc.TOUR_metadatab = "Durch die Auswahl des Buttons werden die Metadaten angezeigt.";
  loc.TOUR_metadata = "Anzeige der Metadaten";
  loc.TOUR_tokenb = loc.TOUR_tokenb || "Anzeige der Token-Annotationen";
  loc.TOUR_token = loc.TOUR_token || "KorAP unterstützt multiple Annotationen.";
  loc.TOUR_treeb = loc.TOUR_tree || "Anzeige weiterer Ansichten"
  loc.TOUR_tree = loc.TOUR_tree || "Weitere Ansichten können als Baum- oder Bogenansichten angezeigt werden.";
  loc.TOUR_tourdone = "Viel Spaß mit KorAP!";
  
  
});
