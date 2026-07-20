import '../../../../scss/kalamar.scss';
import SelectMenu from '../selectMenu.js';

/**
 * Simple demo for SelectMenu component
 */

// Create a select element with options
function createSelectDemo() {
  const container = document.createElement('div');
  container.innerHTML = `
    <h4>Query Language Selector (Click here):</h4>
    <div id="ql-selector">
      <select>
        <option value="poliqarp">Poliqarp</option>
        <option value="cosmas2">Cosmas II</option>
        <option value="annis">Annis</option>
        <option value="cql">CQL v1.2</option>
        <option value="fcs">FCS-QL</option>
      </select>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // Initialize SelectMenu
  const menu = new SelectMenu(container.querySelector('#ql-selector'));
  menu.limit(5);
  
  return menu;
}

// Initialize
const selectMenu = createSelectDemo();

// For debugging in console
console.log('SelectMenu initialized:', selectMenu);