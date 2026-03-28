// ===============================
//  GLOBAL PDF EXPORT MODULE
// CSS is separated in /ems/assets/css/pdf-export.css
// ===============================
import { path } from '../../../../../../core/js/config.js';
const cssPath = path('/ems/assets/css/pages/pdf-export.css');
/**
 * Open a PDF preview window before downloading
 * @param {string} contentHTML - Full HTML content to show in preview
 * @param {string} [filename="document.pdf"] - PDF filename when downloaded
 */
export function previewPDF(contentHTML, filename = "document.pdf") {
  if (!contentHTML) {
    alert("No content to preview");
    return;
  }

  const previewWindow = window.open("", "_blank", "width=900,height=700");

  // Prepare all pages HTML
  const pagesHTML = Array.isArray(contentHTML)
    ? contentHTML.map(page => `<div class="pdf-page">${page}</div>`).join('')
    : `<div class="pdf-page">${typeof contentHTML === "object" ? contentHTML.body || contentHTML : contentHTML}</div>`;

  previewWindow.document.write(`
    <html>
      <head>
        <title>PDF Preview</title>
        <link rel="stylesheet" href="${cssPath}">
      </head>
      <body>
        <!-- PDF content wrapper (only pages) -->
        <div class="pdf-wrapper">
          ${pagesHTML}
        </div>

        <!-- Download Button OUTSIDE the wrapper -->
        <div class="download-btn-wrapper">
          <button id="downloadBtn" data-html2canvas-ignore="true">Download PDF</button>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <script>
          const wrapper = previewWindow.document.querySelector('.pdf-wrapper');
          document.getElementById('downloadBtn').addEventListener('click', () => {
            html2pdf()
              .set({
                margin: [8,10,8,10],
                filename: '${filename}',
                html2canvas: { scale: 1.5, useCORS: true, scrollY: 0 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css','legacy'] }
              })
              .from(wrapper) // EXPORT ONLY wrapper, button is not included
              .save();
          });
        </script>
      </body>
    </html>
  `);

  previewWindow.document.close();
}
/**
 * Generate PDF for any module/page
 * @param {Object} options
 * @param {string|string[]|HTMLElement[]} [options.pageId] - DOM ID(s) or HTMLElements to export
 * @param {string} [options.filename="document.pdf"] - PDF file name
 * @param {Object} [options.extraData] - Optional info to display at top (school, session, etc.)
 * @param {string|function} [options.customLayout] - Optional function or HTML string to customize layout
 * @param {number} [options.margin=10] - PDF margin in mm
 * @param {string} [options.format="a4"] - PDF page format
 * @param {string} [options.orientation="portrait"] - PDF orientation
 */
export async function exportPDF(options = {}) {
  const {
    pageId,
    filename = "document.pdf",
    extraData = {},
    customLayout,
    margin = [8, 10, 8, 10],
    format = "a4",
    orientation = "portrait"
  } = options;

  let htmlContent = "";

  // -------------------------------
  // Render extra data section
  // -------------------------------
  function renderExtraData(extraData) {
    if (!Object.keys(extraData).length) return "";
    return `<div class="pdf-extra-data">
      ${Object.entries(extraData)
        .map(([key, val]) => `<p><strong>${key}:</strong> ${val}</p>`).join("")}
    </div><hr>`;
  }

  try {
    // -------------------------------
    // Determine content to export
    // -------------------------------
    if (typeof customLayout === "function") {
      htmlContent = customLayout(extraData); // Function-based custom layout
    } else if (typeof customLayout === "string") {
      htmlContent = customLayout; // String HTML layout
    } else if (pageId) {
      const elements = Array.isArray(pageId) ? pageId : [pageId];
      htmlContent = elements
        .map(el => {
          let content = "";
          if (typeof el === "string") content = document.getElementById(el)?.innerHTML || "";
          else if (el instanceof HTMLElement) content = el.innerHTML;
          return `<div class="pdf-page-break">${content}</div>`;
        })
        .join("");
    } else {
      htmlContent = "<div>No content to export</div>"; // Fallback
    }

    const extraHTML = renderExtraData(extraData);

    // -------------------------------
    // Build final HTML layout
    // -------------------------------
    const layout = `
    <link rel="stylesheet" href="${cssPath}">
      <div class="pdf-wrapper">
        ${extraHTML}
        ${htmlContent}
      </div>
    `;

    const element = document.createElement("div");
    element.innerHTML = layout;

    // -------------------------------
    // Generate PDF using html2pdf
    // -------------------------------
    await html2pdf()
      .set({
        margin,
        filename,
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          scrollY: 0
        },

        jsPDF: { unit: "mm", format, orientation },
        pagebreak: {
          mode: ['css', 'legacy']
        }
      })
      .from(element)
      .save();

  } catch (err) {
    if (window.Logger) window.Logger("PDF_EXPORT_ERROR", err);
    else console.error("PDF Export Error:", err);
  }
}

/**
 * Attach  PDF export to a button
 * @param {string} buttonId - DOM ID of the button
 * @param {Object} options - Options to pass to exportPDF
 */
export function initPDFButton(buttonId, options = {}) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener("click", () => exportPDF(options));
}

/**
 * Attach multiple  PDF export buttons at once
 * @param {Array<{id:string,options:Object}>} buttonConfigs
 */
export function initPDFButtons(buttonConfigs = []) {
  buttonConfigs.forEach(cfg => initPDFButton(cfg.id, cfg.options));
}