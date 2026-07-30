import QueryCreator from '../querycreator.js';
import '../../../../../scss/kalamar.scss';

document.addEventListener('DOMContentLoaded', function () {
  const matchTable = document.getElementsByClassName('matchinfo')[0];
  if (matchTable) {
    new QueryCreator(matchTable);
  }
});
