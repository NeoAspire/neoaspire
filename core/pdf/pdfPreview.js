// preview.js

import { CONFIG, resolveAll } from '../js/config.js';

/**
 * Opens a PDF preview in a new tab
 * @param {string} content - HTML content
 * @param {string} title - window/tab title
 */

export function openPreview(content, title) {

  const cssPath = new URL(CONFIG.PDF.css, window.location.origin).href;
  const faviconPath = new URL(CONFIG.PDF.favicon, window.location.origin).href;

  const html = `
  <html>
    <head>
      <title>${title}</title>

      <link rel="stylesheet" href="${cssPath}">
      <link rel="icon" href="${faviconPath}">

    </head>
    <body class="preview-mode">

      <div class="preview-wrapper">
        <div class="page-split">
          ${content}
        </div>
      </div>

      <div class="no-print toolbar">
        <button onclick="window.print()" class="btn-print">
           &#128424; Print / Save PDF
        </button>
      </div>

    </body>
  </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const win = window.open(url, '_blank');

  win.onload = () => {
    resolveAll(win.document);
  };
}

