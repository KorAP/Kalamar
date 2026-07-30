import PageInfo from '../pageInfo.js';
import '../../../../scss/kalamar.scss';

function mountPageInfoDemo() {
  const host = document.getElementById('pageinfo-demo');
  if (!host) {
    return;
  }

  // Demo source element read by PageInfo
  let pagination = document.getElementById('pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.setAttribute('id', 'pagination');
    pagination.setAttribute('data-page', '3');
    pagination.setAttribute('data-total', '30');
    pagination.setAttribute('data-count', '25');
    host.appendChild(pagination);
  }

  const pi = new PageInfo();

  const out = document.createElement('pre');
  out.textContent = [
    'PageInfo demo',
    '-------------',
    'page: ' + pi.page(),
    'total: ' + pi.total(),
    'count: ' + pi.count()
  ].join('\n');

  host.appendChild(out);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountPageInfoDemo);
} else {
  mountPageInfoDemo();
}
