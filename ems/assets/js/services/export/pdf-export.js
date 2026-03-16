// ===============================
// ERP GLOBAL PDF EXPORT MODULE
// CSS is separated in /ems/assets/css/pdf-export.css
// ===============================

/**
 * Open a PDF preview window before downloading
 * @param {string} contentHTML - Full HTML content to show in preview
 * @param {string} [filename="document.pdf"] - PDF filename when downloaded
 */
export function previewERP_PDF(contentHTML, filename = "document.pdf") {
  if (!contentHTML) {
    alert("No content to preview");
    return;
  }

  // -------------------------------
  // Open a new window for preview
  // -------------------------------
  const previewWindow = window.open("", "_blank", "width=900,height=700");

  previewWindow.document.write(`
    <html>
      <head>
        <title>PDF Preview</title>
        <link rel="stylesheet" href="/ems/assets/css/pdf-export.css">
      </head>
  
       <body>
   <div class="pdf-wrapper">

          <!-- PAGE 1+: Header + Content together -->
          <div class="pdf-page">
            <div class="pdf-header-area">
              ${typeof contentHTML === "object" ? contentHTML.header || "" : ""}
            </div>

            <div id="pdfContent">
              ${typeof contentHTML === "object" ? contentHTML.body || contentHTML : contentHTML}
            </div>
          </div>

   <!-- Download Button -->
          <div class="download-btn-wrapper">
            <button id="downloadBtn" data-html2canvas-ignore="true">Download PDF</button>
          </div>
        </div>

  <!-- html2pdf.js Library -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

  <script>
document.getElementById('downloadBtn').addEventListener('click', () => {
            html2pdf()
              .set({
                margin: [8,10,8,10],
                filename: '${filename}',
                html2canvas: { scale: 1.5, useCORS: true, scrollY: 0 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css','legacy'] }
              })
              .from(document.querySelector('.pdf-wrapper'))
              .save();
          });
</script>

</body>

    </html>
  `);

  previewWindow.document.close();
}

/**
 * Generate PDF for any ERP module/page
 * @param {Object} options
 * @param {string|string[]|HTMLElement[]} [options.pageId] - DOM ID(s) or HTMLElements to export
 * @param {string} [options.filename="document.pdf"] - PDF file name
 * @param {Object} [options.extraData] - Optional info to display at top (school, session, etc.)
 * @param {string|function} [options.customLayout] - Optional function or HTML string to customize layout
 * @param {number} [options.margin=10] - PDF margin in mm
 * @param {string} [options.format="a4"] - PDF page format
 * @param {string} [options.orientation="portrait"] - PDF orientation
 */
export async function exportERP_PDF(options = {}) {
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
      <link rel="stylesheet" href="/ems/assets/css/pdf-export.css">
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
    if (window.erpLogger) window.erpLogger("PDF_EXPORT_ERROR", err);
    else console.error("PDF Export Error:", err);
  }
}

/**
 * Attach ERP PDF export to a button
 * @param {string} buttonId - DOM ID of the button
 * @param {Object} options - Options to pass to exportERP_PDF
 */
export function initERP_PDFButton(buttonId, options = {}) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener("click", () => exportERP_PDF(options));
}

/**
 * Attach multiple ERP PDF export buttons at once
 * @param {Array<{id:string,options:Object}>} buttonConfigs
 */
export function initERP_PDFButtons(buttonConfigs = []) {
  buttonConfigs.forEach(cfg => initERP_PDFButton(cfg.id, cfg.options));
}