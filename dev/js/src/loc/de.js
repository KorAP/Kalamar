define(function () {
  const loc = KorAP.Locale;
  loc.OR = 'oder';
  loc.AND = 'und';
  // EMPTY, DELETE

  // Virtual collection:
  /*
  loc.VC_subTitle = 'Untertitel';
  loc.VC_title = 'Titel';
  loc.VC_pubDate = 'Veröffentlichungsdatum';
  loc.VC_pubPlace = 'Veröffentlichungsort';
  */

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
  
  //Guided Tour: Steps
  loc.TOUR_sear1 = "Geben Sie die Suchanfrage hier ein.";
  loc.TOUR_sear2 = "Zum Beispiel die Suche nach '"+ loc.TOUR_Qexample +  "'";
  loc.TOUR_searAnnot ="Für die Suche nach Annotationen steht der Annotationsassistent zur Verfügung.";
  loc.TOUR_annotAss = "Der Annotationsassistent erleichert die Formulierung von Suchanfragen mit Annotationen.";
  loc.TOUR_vccho1 = "Öffnen des Korpusassistenten";
  loc.TOUR_vccho2 = "Eigene Definition von Subkorpora durch Verknüpfung beliebiger Metadatenfelder.";
  loc.TOUR_vcStat = "Anzeigen der Korpusstatistik";
  loc.TOUR_qlfield = "Auswahl der Suchanfragesprache";
  loc.TOUR_glimpse = "Beim Wählen dieser Option wird festgelegt ob nur die ersten Treffer in zufälliger Reihenfolge ausgewählt werden.";
  loc.TOUR_help = "Hier finden Sie Hilfe zu KorAP.";
  loc.TOUR_seargo = "Suchanfrage starten";
  
  //Guided Tour: explain the result
  loc.TOUR_result = "Viel Spaß mit KorAP!";
  
});
