import '../../../../scss/kalamar.scss';
import Panel from '../panel.js';
import KoralQuery from '../../view/result/koralquery.js';
import State from '../../state/state.js';

KorAP.koralQuery = {
  '@type' : "https://beispiel",
  'key' : 'Cool'
};

const panel = new Panel();
const actions = panel.actions();

// Add simple button
actions.add('Meta', {'cls':['meta']}, function () {
  console.log(this.button.classList.contains('meta'));
  panel.add(new KoralQuery());
});

// Add list button
const list = actions.addList('More', {'cls':['list']});

list.list.readItems([
  ['cool', 'cool', function (e, action) { console.log('really' + this.action()) }],
  ['very cool', 'veryCool', function (e, action) { console.log('very cool') }]
]);

// Add toggle button
const s = new State();

const bgChange = {
  setState : function (val) {
    if (val) {
      document.body.style.backgroundColor = 'red';
    } else {
      document.body.style.backgroundColor = 'transparent';
    }
  }
};

s.associate(bgChange);

actions.addToggle('Background', {'cls':['bg']}, s);

document.getElementById('mainButton').appendChild(panel.element());
