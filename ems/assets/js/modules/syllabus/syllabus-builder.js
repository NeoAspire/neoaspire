// ===============================
// SYLLABUS BUILDER MODULE
// ===============================
import { path } from '../../../../../core/js/config.js';
import { generatePDF } from '../../../../../core/pdf/pdfGenerator.js'; // universal PDF engine

console.log("SYLLABUS BUILDER MODULE LOADED");

// ===============================
// INIT ENTRY POINT
// ===============================
export function init() {
  console.log("💡 Syllabus Builder INIT called");
  const form = document.getElementById("syllabusForm");
  if (!form) return;
  initSyllabusBuilder();
}

// ===============================
// MAIN SYLLABUS BUILDER FUNCTION
// ===============================
async function initSyllabusBuilder() {
  try {
    // -------------------------------
    // LOAD JSON DATA
    // -------------------------------
    const [sessions, classes, subjects, mapping, examTypes] = await Promise.all([
      loadJSON(path("/ems/data/academic/sessions.json")),
      loadJSON(path("/ems/data/academic/classes.json")),
      loadJSON(path("/ems/data/academic/subjects.json")),
      loadJSON(path("/ems/data/academic/class-subjects.json")),
      loadJSON(path("/ems/data/academic/exam-types.json"))
    ]);

    // -------------------------------
    // DOM ELEMENTS
    // -------------------------------
    const DOM = {
      sessionSelect: document.getElementById("session"),
      classSelect: document.getElementById("classSelect"),
      subjectContainer: document.getElementById("subjectContainer"),
      examTypeGroup: document.getElementById("examTypeGroup"),
      examTypeContainer: document.getElementById("examTypeContainer"),
      classGroup: document.getElementById("classGroup"),
      subjectGroup: document.getElementById("subjectGroup"),
      syllabusDetails: document.getElementById("syllabusDetails"),
      syllabusPreview: document.getElementById("syllabusPreview"),
      previewContent: document.getElementById("previewContent"),
      schoolName: document.getElementById("schoolName"),
      schoolAddress: document.getElementById("schoolAddress")
    };

    if (!DOM.sessionSelect || !DOM.classSelect) return;

    // ===============================
    // LOAD SESSION OPTIONS
    // ===============================
    populateSelect(DOM.sessionSelect, sessions);

    // ===============================
    // SESSION CHANGE → LOAD CLASSES
    // ===============================
    DOM.sessionSelect.addEventListener("change", () => {
      resetSelection();
      const selectedSession = DOM.sessionSelect.value;
      if (!selectedSession) {
        DOM.classGroup?.classList.add("u-hidden");
        return;
      }
      DOM.classGroup?.classList.remove("u-hidden");
      populateSelect(DOM.classSelect, classes);
    });

    // ===============================
    // CLASS CHANGE → LOAD SUBJECTS
    // ===============================
    DOM.classSelect.addEventListener("change", () => {
      resetSubjectsAndExams();
      const selectedClass = DOM.classSelect.value;
      const classData = mapping.find(c => c.class_id === selectedClass);
      if (!classData) return;
      populateSubjects(classData.subjects);
    });

    // ===============================
    // SUBJECT SELECTION → SHOW EXAMS
    // ===============================
    DOM.subjectContainer.addEventListener("change", () => {
      const selectedSubjects = getChecked('subject');
      if (!selectedSubjects.length) {
        DOM.examTypeGroup.classList.add("u-hidden");
        DOM.examTypeContainer.innerHTML = "";
        DOM.syllabusDetails.innerHTML = "";
        updatePreview();
        return;
      }
      DOM.examTypeGroup.classList.remove("u-hidden");
      populateExamTypes();
      renderExamBlocks();
      updatePreview();
    });

    // ===============================
    // EXAM TYPE SELECTION → SHOW CHAPTERS & TABLES
    // ===============================
    DOM.examTypeContainer.addEventListener("change", () => {
      renderExamBlocks();
      updatePreview();
    });

    // ===============================
    // SYLLABUS DETAILS INPUT LISTENER
    // ===============================
    DOM.syllabusDetails.addEventListener("input", (e) => {
      if (e.target.name?.startsWith("chapters-") || e.target.name?.startsWith("tables-")) {
        updatePreview();
      }
    });

    // ===============================
    // INITIAL LIVE PREVIEW
    // ===============================
    updatePreview();

    // ===============================
    // PDF DOWNLOAD BUTTON
    // ===============================
    document.getElementById("downloadPdf").addEventListener("click", () => {
      const pdfContent = getPDFContent();
      if (!pdfContent) {
        alert("Please select subjects and exams first!");
        return;
      }

      const tempDiv = document.createElement("div");
      tempDiv.id = "pdf-temp-content";
      tempDiv.innerHTML = pdfContent;
      document.body.appendChild(tempDiv);

      generatePDF({
        contentId: "pdf-temp-content",
        mode: "basic",
        title: `${DOM.schoolName.value || "School"} Syllabus`,
        data: {
    header: `
      <h2>${DOM.schoolName.value || ""}</h2>
      <p class="address">${DOM.schoolAddress.value || ""}</p>
      <p class="meta">
        ${DOM.sessionSelect.selectedOptions[0]?.text || ""} |
        ${DOM.classSelect.selectedOptions[0]?.text || ""}
      </p>
    `,
    footer: ` `
  }
      });

      setTimeout(() => tempDiv.remove(), 1000);
    });

    // ===============================
    // -------------------------------HELPER FUNCTIONS-------------------------------
    // ===============================

    function populateSelect(selectEl, items) {
      selectEl.innerHTML = '<option value="">Select</option>';
      items.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.name;
        selectEl.appendChild(opt);
      });
    }

    function resetSelection() {
      DOM.classSelect.innerHTML = '<option value="">Select Class</option>';
      resetSubjectsAndExams();
      DOM.classGroup?.classList.add("u-hidden");
    }

    function resetSubjectsAndExams() {
      DOM.subjectContainer.innerHTML = "";
      DOM.examTypeContainer.innerHTML = "";
      DOM.subjectGroup?.classList.add("u-hidden");
      DOM.examTypeGroup.classList.add("u-hidden");
      DOM.syllabusDetails.innerHTML = "";
    }

    function populateSubjects(subjectIds) {
      DOM.subjectGroup?.classList.remove("u-hidden");
      subjectIds.forEach(id => {
        const sub = subjects.find(s => s.id === id);
        if (!sub) return;
        const inputId = `subject-${sub.id}`;
        const label = document.createElement("label");
        label.setAttribute("for", inputId);
        label.innerHTML = `<input type="checkbox" id="${inputId}" name="subject" value="${sub.id}">${sub.name}`;
        DOM.subjectContainer.appendChild(label);
      });
    }

    function populateExamTypes() {
      examTypes.forEach(exam => {
        if (!document.querySelector(`input[name="examType"][value="${exam.id}"]`)) {
          const inputId = `exam-${exam.id}`;
          const label = document.createElement("label");
          label.setAttribute("for", inputId);
          label.innerHTML = `<input type="checkbox" id="${inputId}" name="examType" value="${exam.id}">${exam.name}`;
          DOM.examTypeContainer.appendChild(label);
        }
      });
    }

    function getChecked(type) {
      return Array.from(document.querySelectorAll(`input[name="${type}"]:checked`));
    }

    function renderExamBlocks() {
      const selectedSubjects = getChecked('subject');
      const selectedExams = getChecked('examType');

      const savedValues = {};
      DOM.syllabusDetails.querySelectorAll("input").forEach(input => savedValues[input.name] = input.value);
      DOM.syllabusDetails.innerHTML = "";

      selectedExams.forEach(exam => {
        const examId = exam.value;
        const examName = exam.parentElement.textContent.trim();
        const div = document.createElement("div");
        div.className = "exam-detail";
        div.id = `detail-${examId}`;
        div.innerHTML = selectedSubjects.map(sub => createSubjectBlock(sub, examId, savedValues)).join("");
        div.innerHTML = `<h3>${examName}</h3>` + div.innerHTML;
        DOM.syllabusDetails.appendChild(div);
      });
    }

    function createSubjectBlock(subjectEl, examId, savedValues = {}) {
      const subjectId = subjectEl.value;
      const subjectName = subjectEl.parentElement.textContent.trim();
      const chaptersName = `chapters-${examId}-${subjectId}`;
      const tablesName = `tables-${examId}-${subjectId}`;
      const chaptersValue = savedValues[chaptersName] || "";
      const tablesValue = savedValues[tablesName] || "";

      return `
        <div class="subject-block">
          <h4>${subjectName}</h4>
          <div class="form-group">
            <label>Chapters</label>
            <input type="text" name="${chaptersName}" value="${chaptersValue}" placeholder="Ex: 1,2,3 or 1 to 4">
          </div>
          ${subjectName.toLowerCase() === "maths" ? `
          <div class="form-group">
            <label>Tables</label>
            <input type="text" name="${tablesName}" value="${tablesValue}" placeholder="Ex: 2 to 13">
          </div>` : ""}
        </div>
      `;
    }

    function updatePreview() {
      const selectedSubjects = getChecked('subject');
      const selectedExams = getChecked('examType');

      if (!selectedSubjects.length || !selectedExams.length) {
        DOM.syllabusPreview.classList.add("u-hidden");
        DOM.previewContent.innerHTML = "";
        return;
      }

      DOM.syllabusPreview.classList.remove("u-hidden");

      DOM.previewContent.innerHTML = selectedExams.map(exam => {
        const examId = exam.value;
        const examName = exam.parentElement.textContent.trim();
        const subjectsHTML = selectedSubjects.map(sub => createPreviewSubject(sub, examId)).join("");
        return `<div class="preview-exam"><h3>📘 ${examName}</h3>${subjectsHTML}</div>`;
      }).join("");
    }

    function createPreviewSubject(subjectEl, examId) {
      const subjectId = subjectEl.value;
      const subjectName = subjectEl.parentElement.textContent.trim();
      const chapters = document.querySelector(`input[name="chapters-${examId}-${subjectId}"]`)?.value || "";
      const tables = document.querySelector(`input[name="tables-${examId}-${subjectId}"]`)?.value || "";
      const chapterList = chapters ? `<ul class="preview-chapters">${chapters.split(";").map(ch => `<li>${ch.trim()}</li>`).join("")}</ul>` : "<p>No chapters listed</p>";
      const tableList = tables ? `<p><strong>Tables:</strong> ${tables}</p>` : "";
      return `<div class="preview-subject"><h5>${subjectName}</h5>${chapterList}${tableList}</div>`;
    }

  // GET PDF CONTENT BASED ON CURRENT SELECTIONS
function getPDFContent() {
  const selectedExams = getChecked('examType');
  const selectedSubjects = getChecked('subject');

  if (!selectedExams.length || !selectedSubjects.length) {
    return "<p>No content to export</p>";
  }
/*
  let html = `
    <div class="header">
      <h2>${DOM.schoolName.value || "N/A"}</h2>
      <p class="address">${DOM.schoolAddress.value || "N/A"}</p>
      <p class="meta">
        ${DOM.sessionSelect.selectedOptions[0]?.text || "N/A"} | 
        ${DOM.classSelect.selectedOptions[0]?.text || "N/A"}
      </p>
    </div>
  `;
  */
let html = ``;

  selectedExams.forEach(exam => {
    const examId = exam.value;
    const examName = exam.parentElement.textContent.trim();
/*
    html += `
      <div class="pdf-exam">
        <h2>${examName}</h2>
        ${selectedSubjects.map(sub => createPDFSubject(sub, examId)).join("")}
      </div>
    `;
*/
/*
    html += `
  <h2 class="exam-title">${examName}</h2>
  ${selectedSubjects.map(sub => createPDFSubject(sub, examId)).join("")}
`;*/

html += `
  <div class="pdf-exam avoid-break">
    <h2 class="exam-title">${examName}</h2>
    ${selectedSubjects.map(sub => createPDFSubject(sub, examId)).join("")}
  </div>
`;
  });

  return html;
}

    function createPDFSubject(subjectEl, examId) {
      const subjectId = subjectEl.value;
      const subjectName = subjectEl.parentElement.textContent.trim();
      const chapters = document.querySelector(`input[name="chapters-${examId}-${subjectId}"]`)?.value || "N/A";
      const tables = document.querySelector(`input[name="tables-${examId}-${subjectId}"]`)?.value || "";
      return `<div class="pdf-subject avoid-break">
      <h3>${subjectName}</h3>
      <ul>${chapters.split(";").map(ch => `<li>${ch.trim()}</li>`).join("")}</ul>
      ${tables ? `<p>Tables: ${tables}</p>` : ""}
      </div>`;
    }

  } catch (err) {
    console.error("Syllabus Builder Error:", err);
  }
}

// ===============================
// HELPER: LOAD JSON FILE
// ===============================
async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Cannot load ${path}`);
    return await res.json();
  } catch (err) {
    console.error("JSON Load Error:", err);
    return [];
  }
}