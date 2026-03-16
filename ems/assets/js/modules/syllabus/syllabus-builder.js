// ===============================
// SYLLABUS BUILDER MODULE
// ===============================

// Import ERP PDF module for PDF preview/download
import { previewERP_PDF } from '/ems/assets/js/services/export/pdf-export.js';

console.log("SYLLABUS BUILDER MODULE LOADED");

// ===============================
// INIT ENTRY POINT
// ===============================
export function init() {
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
    // Load JSON Data
    // -------------------------------
    const [sessions, classes, subjects, mapping, examTypes] = await Promise.all([
      loadJSON("/ems/data/academic/sessions.json"),
      loadJSON("/ems/data/academic/classes.json"),
      loadJSON("/ems/data/academic/subjects.json"),
      loadJSON("/ems/data/academic/class-subjects.json"),
      loadJSON("/ems/data/academic/exam-types.json")
    ]);

    // -------------------------------
    // DOM ELEMENTS
    // -------------------------------
    const sessionSelect = document.getElementById("session");
    const classSelect = document.getElementById("classSelect");
    const subjectContainer = document.getElementById("subjectContainer");
    const examTypeGroup = document.getElementById("examTypeGroup");
    const examTypeContainer = document.getElementById("examTypeContainer");
    const classGroup = document.getElementById("classGroup");
    const subjectGroup = document.getElementById("subjectGroup");
    const syllabusDetails = document.getElementById("syllabusDetails");
    const syllabusPreview = document.getElementById("syllabusPreview");

    if (!sessionSelect || !classSelect) return;

    // ===============================
    // LOAD SESSION OPTIONS
    // ===============================
    sessions.forEach(s => {
      const option = document.createElement("option");
      option.value = s.id;
      option.textContent = s.name;
      sessionSelect.appendChild(option);
    });

    // ===============================
    // SESSION CHANGE → LOAD CLASSES
    // ===============================
    sessionSelect.addEventListener("change", () => {
      const selectedSession = sessionSelect.value;

      // Reset
      classSelect.innerHTML = '<option value="">Select Class</option>';
      subjectContainer.innerHTML = "";
      examTypeContainer.innerHTML = "";
      subjectGroup?.classList.add("u-hidden");
      examTypeGroup.classList.add("u-hidden");

      if (!selectedSession) {
        classGroup?.classList.add("u-hidden");
        return;
      }

      classGroup?.classList.remove("u-hidden");

      // Populate classes
      classes.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.name;
        classSelect.appendChild(option);
      });
    });

    // ===============================
    // CLASS CHANGE → LOAD SUBJECTS
    // ===============================
    classSelect.addEventListener("change", () => {
      subjectContainer.innerHTML = "";
      examTypeContainer.innerHTML = "";
      subjectGroup?.classList.remove("u-hidden");
      examTypeGroup.classList.add("u-hidden");

      const selectedClass = classSelect.value;
      const classData = mapping.find(c => c.class_id === selectedClass);
      if (!classData) return;

      // Populate subjects as checkboxes
      classData.subjects.forEach(subjectId => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;
        const inputId = `subject-${subject.id}`;

        const label = document.createElement("label");
        label.setAttribute("for", inputId);
        label.innerHTML = `
          <input type="checkbox" id="${inputId}" name="subject" value="${subject.id}">
          ${subject.name}
        `;
        subjectContainer.appendChild(label);
      });
    });

    // ===============================
    // RENDER EXAM DETAIL BLOCKS
    // ===============================
    function renderExamBlocks() {
      const selectedSubjects = Array.from(document.querySelectorAll('input[name="subject"]:checked'));
      const selectedExams = Array.from(document.querySelectorAll('input[name="examType"]:checked'));

      // Preserve previously entered values
      const savedValues = {};
      document.querySelectorAll("#syllabusDetails input").forEach(input => {
        savedValues[input.name] = input.value;
      });

      syllabusDetails.innerHTML = "";

      selectedExams.forEach(exam => {
        const examId = exam.value;
        const examName = exam.parentElement.textContent.trim();
        const div = document.createElement("div");
        div.className = "exam-detail";
        div.id = `detail-${examId}`;

        let subjectsHTML = "";
        selectedSubjects.forEach(sub => {
          const subjectId = sub.value;
          const subjectName = sub.parentElement.textContent.trim();
          const chaptersName = `chapters-${examId}-${subjectId}`;
          const tablesName = `tables-${examId}-${subjectId}`;
          const chaptersValue = savedValues[chaptersName] || "";
          const tablesValue = savedValues[tablesName] || "";

          subjectsHTML += `
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
        });

        div.innerHTML = `<h3>${examName}</h3>${subjectsHTML}`;
        syllabusDetails.appendChild(div);
      });
    }

    // ===============================
    // LIVE PREVIEW
    // ===============================
    function updatePreview() {
      const selectedSubjects = document.querySelectorAll('input[name="subject"]:checked');
      const selectedExams = document.querySelectorAll('input[name="examType"]:checked');
      const previewContent = document.getElementById("previewContent");

      if (!selectedSubjects.length || !selectedExams.length) {
        syllabusPreview.classList.add("u-hidden");
        previewContent.innerHTML = "";
        return;
      }

      syllabusPreview.classList.remove("u-hidden");

      let html = "";

      selectedExams.forEach(exam => {
        const examId = exam.value;
        const examName = exam.parentElement.textContent.trim();
        html += `<div class="preview-exam"><h3>📘 ${examName}</h3>`;

        selectedSubjects.forEach(sub => {
          const subjectId = sub.value;
          const subjectName = sub.parentElement.textContent.trim();
          const chapters = document.querySelector(`input[name="chapters-${examId}-${subjectId}"]`)?.value || "";
          const tables = document.querySelector(`input[name="tables-${examId}-${subjectId}"]`)?.value || "";

          const chapterList = chapters
            ? `<ul class="preview-chapters">${chapters.split(";").map(ch => `<li>${ch.trim()}</li>`).join("")}</ul>`
            : "<p>No chapters listed</p>";

          const tableList = tables ? `<p><strong>Tables:</strong> ${tables}</p>` : "";

          html += `<div class="preview-subject">
                     <h5>${subjectName}</h5>
                     ${chapterList}
                     ${tableList}
                   </div>`;
        });

        html += "</div>";
      });

      previewContent.innerHTML = html;
    }

    // -------------------------------
    // SYLLABUS DETAILS INPUT LISTENER
    // -------------------------------
    syllabusDetails.addEventListener("input", (e) => {
      if (e.target.name && (e.target.name.startsWith("chapters-") || e.target.name.startsWith("tables-"))) {
        updatePreview();
      }
    });

    // ===============================
    // SUBJECT SELECTION → SHOW EXAMS
    // ===============================
    subjectContainer.addEventListener("change", () => {
      const selectedSubjects = document.querySelectorAll('input[name="subject"]:checked');

      if (!selectedSubjects.length) {
        examTypeGroup.classList.add("u-hidden");
        examTypeContainer.innerHTML = "";
        document.querySelectorAll(".exam-detail").forEach(div => div.remove());
        updatePreview();
        return;
      }

      examTypeGroup.classList.remove("u-hidden");

      // Populate exam types dynamically
      examTypes.forEach(exam => {
        if (!document.querySelector(`input[name="examType"][value="${exam.id}"]`)) {
          const inputId = `exam-${exam.id}`;
          const label = document.createElement("label");

 
          label.innerHTML = `<input type="checkbox" name="examType" value="${exam.id}">${exam.name}`;
          examTypeContainer.appendChild(label);
        }
      });

      renderExamBlocks();
      updatePreview();
    });

    // ===============================
    // EXAM TYPE SELECTION → SHOW CHAPTERS & TABLES
    // ===============================
    examTypeContainer.addEventListener("change", () => {
      renderExamBlocks();
      updatePreview();
    });

    // ===============================
    // PDF CONTENT GENERATOR WITH HEADER
    // ===============================
    function getPDFContent() {
      const schoolName = document.getElementById("schoolName").value || "N/A";
      const schoolAddress = document.getElementById("schoolAddress").value || "N/A";
      const session = document.getElementById("session").selectedOptions[0]?.text || "N/A";
      const className = document.getElementById("classSelect").selectedOptions[0]?.text || "N/A";

      const selectedExams = document.querySelectorAll('input[name="examType"]:checked');
      const selectedSubjects = document.querySelectorAll('input[name="subject"]:checked');

      if (!selectedExams.length || !selectedSubjects.length) return "<p>No content to export</p>";

      let html = `
        <div class="pdf-header">
          <h1>${schoolName}</h1>
          <p>${schoolAddress}</p>
          <p>${session} | ${className}</p>
          <hr>
        </div>`;

      selectedExams.forEach(exam => {
        const examId = exam.value;
        const examName = exam.parentElement.textContent.trim();
        html += `<div class="pdf-exam"><h2>${examName}</h2>`;

        selectedSubjects.forEach(sub => {
          const subjectId = sub.value;
          const subjectName = sub.parentElement.textContent.trim();
          const chapters = document.querySelector(`input[name="chapters-${examId}-${subjectId}"]`)?.value || "N/A";
          const tables = document.querySelector(`input[name="tables-${examId}-${subjectId}"]`)?.value || "";

          html += `<div class="pdf-subject">
            <h3>${subjectName}</h3>
            <div class="pdf-chapters">
           
              <ul>
  ${chapters
              .split(";")
              .map(ch => ch.trim())
              .filter(ch => ch) // remove empty strings
              .map(ch => `<li>${ch}</li>`)
              .join("")}
</ul>

            </div>
            ${tables ? `<div>Tables: ${tables}</div>` : ""}
          </div>`;
        });

        html += `</div>`; // close exam
      });

      return html;
    }

    // ===============================
    // INITIALIZE PDF DOWNLOAD BUTTON
    // ===============================
    document.getElementById("downloadPdf").addEventListener("click", () => {
      const pdfContent = getPDFContent();
      if (!pdfContent) {
        alert("Please select subjects and exams first!");
        return;
      }
      previewERP_PDF(pdfContent, "Syllabus.pdf");
    });

    // ===============================
    // INITIAL LIVE PREVIEW
    // ===============================
    updatePreview();

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