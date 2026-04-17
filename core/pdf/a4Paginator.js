// a4Paginator.js
import { resolveAll } from '../js/config.js';

const A4_HEIGHT_PX = 1123; // 297mm at 96 DPI
const PAGE_PADDING_MM = 15;
const MM_TO_PX = 3.78;

// usable content height

const HEADER_HEIGHT = 80;   // approx px (tune if needed)
const FOOTER_HEIGHT = 50;
const CONTENT_MARGIN = 80;  // top + bottom margins

const PAGE_HEIGHT = Math.floor(
  A4_HEIGHT_PX -
  (PAGE_PADDING_MM * 2 * MM_TO_PX) -
  HEADER_HEIGHT -
  FOOTER_HEIGHT -
  CONTENT_MARGIN
);

export function paginate(contentHTML, data = {}) {
  // ===== TEMP ROOT =====
  const temp = document.createElement('div');
  temp.style.position = 'absolute';
  temp.style.visibility = 'hidden';
  temp.style.width = '210mm';
  temp.style.boxSizing = 'border-box';
  temp.innerHTML = contentHTML;

  resolveAll(temp);
  document.body.appendChild(temp);

  // ===== MEASURE BOX (NO REFLOW BUG) =====
  const measureBox = document.createElement('div');
  measureBox.style.position = 'absolute';
  measureBox.style.visibility = 'hidden';
  measureBox.style.width = '210mm';
  measureBox.style.boxSizing = 'border-box';
  document.body.appendChild(measureBox);

  const elements = Array.from(
  temp.querySelectorAll('.pdf-exam, .pdf-subject')
);

  const pages = [];
  let currentPage = createPage(data, true);
  let currentHeight = 0;

  elements.forEach(el => {
    const elClone = el.cloneNode(true);

    // ===== MEASURE HEIGHT =====
    measureBox.appendChild(elClone);
    const elHeight = elClone.offsetHeight;
    measureBox.innerHTML = '';

    // ===== HANDLE FORCE BREAK =====
    if (el.classList.contains('force-break')) {
      pages.push(currentPage);
      currentPage = createPage(data, false);
      currentHeight = 0;
    }

    // ===== HANDLE AVOID BREAK =====
    if (
      el.classList.contains('avoid-break') &&
      currentHeight + elHeight > PAGE_HEIGHT
    ) {
      pages.push(currentPage);
      currentPage = createPage(data, false);
      currentHeight = 0;
    }

    // ===== NORMAL FLOW =====
    if (currentHeight + elHeight > PAGE_HEIGHT) {
      pages.push(currentPage);
      currentPage = createPage(data, false);
      currentHeight = 0;
    }

    currentPage.querySelector('.page-content')
      .appendChild(el.cloneNode(true));

    currentHeight += elHeight;
  });

  pages.push(currentPage);

  // ===== CLEANUP =====
  document.body.removeChild(temp);
  document.body.removeChild(measureBox);

  return pages.map(p => p.outerHTML).join('');
}


// ===== PAGE TEMPLATE =====
function createPage(data, includeHeader = true) {
  const page = document.createElement('div');
  page.className = 'page-split';

  page.innerHTML = `
    ${includeHeader ? `<div class="header">${data.header || ''}</div>` : ''}
    <div class="page-content"></div>
    <div class="footer">${data.footer || ''}</div>
  `;

  return page;
}