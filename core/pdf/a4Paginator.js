// a4Paginator.js
import { resolveAll } from '../js/config.js';

/**
 * Splits HTML content into A4 pages automatically
 * @param {string} contentHTML
 * @param {Object} data - header/footer metadata
 */
export function paginate(contentHTML, data = {}) {
  const temp = document.createElement('div');
  temp.style.position = 'absolute';
  temp.style.visibility = 'hidden';
  temp.style.width = '210mm';
  temp.style.padding = '15mm';
  temp.style.boxSizing = 'border-box';
  temp.innerHTML = contentHTML;

  resolveAll(temp);
  document.body.appendChild(temp);

  const elements = Array.from(temp.children);
  const PAGE_HEIGHT = 1122; // A4 approx px

  const pages = [];
  let firstPage = true;
  let currentPage = createPage(data, firstPage);
  let currentHeight = 0;

  elements.forEach(el => {
    const clone = el.cloneNode(true);
    temp.appendChild(clone);
    const elHeight = clone.offsetHeight;
    temp.removeChild(clone);

    if (currentHeight + elHeight > PAGE_HEIGHT) {
      pages.push(currentPage);
      currentPage = createPage(data, false); // only first page gets header
      currentHeight = 0;
    }

    currentPage.querySelector('.page-content').appendChild(el.cloneNode(true));
    currentHeight += elHeight;
    firstPage = false;
  });

  pages.push(currentPage);
  document.body.removeChild(temp);

  return pages.map(p => p.outerHTML).join('');
}

function createPage(data, includeHeader = true) {
  const page = document.createElement('div');
  page.className = 'page-split';
  page.innerHTML = `
    <div class="page-content"></div>
  `;
  return page;
}