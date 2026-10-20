import '../../../../scss/kalamar.scss';
import Tutorial from '../tutorial.js';

const d = document;

// The tutorial pages (embedded in an iframe) access the instance
// via window.parent.tutorial
window.tutorial = new Tutorial(d.getElementById('view-tutorial'));

const info = d.getElementById('info');

const showInfo = function () {
  info.textContent = 'Stored page: ' + (window.tutorial.getPage() || '-') + '\n' +
    'Query: ' + d.getElementById('q-field').value + '\n' +
    'Query language: ' + d.getElementById('ql-field').value + '\n' +
    'Cutoff: ' + d.getElementById('q-cutoff-field').checked;
};

showInfo();

// Update the info after a query was chosen in the tutorial
d.getElementById('q-field').addEventListener('input', showInfo);
d.getElementById('ql-field').addEventListener('change', showInfo);
d.getElementById('q-cutoff-field').addEventListener('change', showInfo);

const origUseQuery = window.tutorial.useQuery.bind(window.tutorial);
window.tutorial.useQuery = function (e) {
  origUseQuery(e);
  showInfo();
};

d.getElementById('reset').onclick = function (e) {
  e.preventDefault();
  window.tutorial._session.clear();
  showInfo();
};
