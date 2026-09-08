import '../../../../scss/kalamar.scss';
import ButtonGroup from '../buttongroup.js';
import State from '../../state/state.js';

const log = function (msg) {
  document.getElementById('log').appendChild(
    document.createTextNode(msg + '\n')
  );
};

// Simple buttons
const simple = new ButtonGroup(['button-panel']);
simple.add('Hello', {'desc': 'Say hello'}, function () {
  log('Hello clicked');
});
simple.add('Counter', undefined, function () {
  this.button.count = (this.button.count || 0) + 1;
  this.button.changeTitle('Counter ' + this.button.count);
  log('Counter: ' + this.button.count);
});
document.getElementById('simple').appendChild(simple.element());

// Active state and toggle buttons
const stateGroup = new ButtonGroup(['button-panel']);
const active = new State();
stateGroup.add('Active', {'active': active}, function () {
  log('Active changed: ' + active.get());
});
const toggle = new State();
const toggleLog = {};
toggleLog.setState = function (value) {
  log('Toggle changed: ' + value);
};
toggle.associate(toggleLog);
stateGroup.addToggle('Toggle', {'desc': 'Toggle me'}, toggle);
document.getElementById('toggles').appendChild(stateGroup.element());

// Button with list
const listGroup = new ButtonGroup(['button-panel', 'open-menu-below']);
const more = listGroup.addList('More');
['Entry 1', 'Entry 2', 'Entry 3'].forEach(name => {
  more.list.add(name, undefined, function () {
    log(name + ' chosen');
  });
});
document.getElementById('list').appendChild(listGroup.element());

// Adopted group with anchor: new buttons are inserted before 'Last'.
// The existing buttons are plain HTML and keep their own behaviour,
// so they need their own listeners; only buttons created via add()
// are handled by the ButtonGroup.
const adoptedEl = document.getElementById('adopt');
Array.from(adoptedEl.children).forEach(btn => {
  btn.addEventListener('click', function () {
    log(btn.textContent.trim() + ' clicked (own listener)');
  });
});

const adopted = ButtonGroup.adopt(adoptedEl);
adopted.anchor(adopted.element().lastElementChild);
adopted.add('Inserted', undefined, function () {
  log('Inserted clicked (via ButtonGroup)');
});
