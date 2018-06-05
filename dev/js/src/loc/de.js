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
  //Show corpus statistic
  loc.VC_SHOWSTAT = 'Korpusstatistik';

  // Date picker:
  loc.WDAY = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  loc.MONTH = [
    'Januar', 'Februar', 'März', 'April',
    'Mai', 'Juni', 'Juli', 'August',
    'September', 'Oktober', 'November',
    'Dezember'
  ];

  // Match view
  loc.ADDTREE  = 'Relationen';
  loc.SHOWANNO  = 'Token';
  loc.SHOWINFO = 'Informationen';
  loc.CLOSE    = 'Schließen';

  loc.TOGGLE_ALIGN = 'tausche Textausrichtung';
  loc.SHOW_KQ      = 'zeige KoralQuery';
  loc.SHOW_META    = 'Metadaten';
  loc.NEW_QUERY = 'Neue Anfrage';
});
