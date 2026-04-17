// pdfGenerator.js

import { openPreview } from './pdfPreview.js';
import { paginate } from './a4Paginator.js';

/**
 * Universal PDF generator
 * @param {Object} options
 * @param {string} options.contentId - DOM element containing content
 * @param {"basic"|"advanced"} options.mode - PDF mode
 * @param {Object} options.data - header/footer metadata
 * @param {string} options.title - window/tab title
 */

export function generatePDF({
  contentId,
  mode = "basic", // basic | advanced
  data = {},
  title = "Document"
}) {

  const el = document.getElementById(contentId);
  if (!el) {
        console.error("Invalid contentId:", contentId);
    return;
  }

  const content = el.innerHTML;
  let finalHTML = content;

  // 🔥 RESET MODES FIRST
  document.body.classList.remove("paginator-mode");

  // BASIC MODE 
  if (mode === "basic") {
    finalHTML = content;
  }

   // ADVANCED MODE → paginate automatically for A4
  if (mode === "advanced") {
     document.body.classList.add("paginator-mode"); 
    finalHTML = paginate(content, data);
  }

  openPreview(finalHTML, title, mode, data);
}

