// ===============================
// WORD EXPORT MODULE
// ===============================
export function downloadWord(options = {}) {
  const {
    previewId = "previewContent",
    filename = "syllabus.doc"
  } = options;

  const preview = document.getElementById(previewId)?.innerHTML || "";

  const blob = new Blob(['\ufeff', preview], {
    type: "application/msword"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Optional helper to attach to a button
export function initWordButton(buttonId = "downloadWord", options = {}) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener("click", () => downloadWord(options));
}