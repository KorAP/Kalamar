import KalamarDatepicker from '../datepicker.js';
import '../../../../scss/kalamar.scss';

function mountDatepicker() {
  const host = document.getElementById('dp');
  if (!host) {
    return;
  }

  const dp = new KalamarDatepicker();
  host.appendChild(dp.select(2015, 4, 12).show(2015, 4));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountDatepicker);
} else {
  mountDatepicker();
}
