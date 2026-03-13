// ===============================
// SYLLABUS BUILDER MODULE
// ===============================

console.log("SYLLABUS BUILDER MODULE LOADED");

export function init() {

  const form = document.getElementById("syllabusForm");

  if (!form) return;

  initSyllabusBuilder();
}

async function initSyllabusBuilder() {

  try {

    const [sessions, classes, subjects, mapping, examTypes] = await Promise.all([
      loadJSON("/ems/data/academic/sessions.json"),
      loadJSON("/ems/data/academic/classes.json"),
      loadJSON("/ems/data/academic/subjects.json"),
      loadJSON("/ems/data/academic/class-subjects.json"),
      loadJSON("/ems/data/academic/exam-types.json")
    ]);

    const sessionSelect = document.getElementById("session");
    const classSelect = document.getElementById("classSelect");

    const subjectContainer = document.getElementById("subjectContainer");

    const examTypeGroup = document.getElementById("examTypeGroup");
    const examTypeContainer = document.getElementById("examTypeContainer");

    const classGroup = document.getElementById("classGroup");
    const subjectGroup = document.getElementById("subjectGroup");

    const form = document.getElementById("syllabusForm");

    if (!sessionSelect || !classSelect) return;


    /* ===============================
       Load Sessions
    =============================== */

    sessions.forEach(s => {

      const option = document.createElement("option");
      option.value = s.id;
      option.textContent = s.name;

      sessionSelect.appendChild(option);

    });


    /* ===============================
       Session Change → Load Classes
    =============================== */
sessionSelect.addEventListener("change", () => {

  const selectedSession = sessionSelect.value;

  classSelect.innerHTML = '<option value="">Select Class</option>';
  subjectContainer.innerHTML = "";
  examTypeContainer.innerHTML = "";

  subjectGroup?.classList.add("u-hidden");
  examTypeGroup.classList.add("u-hidden");

  // If session is not selected → hide class also
  if (!selectedSession) {
    classGroup?.classList.add("u-hidden");
    return;
  }

  // Show class group
  classGroup?.classList.remove("u-hidden");

  classes.forEach(c => {

    const option = document.createElement("option");

    option.value = c.id;
    option.textContent = c.name;

    classSelect.appendChild(option);

  });

});
    


    /* ===============================
       Class Change → Load Subjects
    =============================== */

    classSelect.addEventListener("change", () => {

      subjectContainer.innerHTML = "";
      examTypeContainer.innerHTML = "";

      if (subjectGroup) subjectGroup.classList.remove("u-hidden");

      examTypeGroup.classList.add("u-hidden");

      const selectedClass = classSelect.value;

      const classData = mapping.find(c => c.class_id === selectedClass);

      if (!classData) return;

      classData.subjects.forEach(subjectId => {

        const subject = subjects.find(s => s.id === subjectId);

        if (!subject) return;

        const label = document.createElement("label");

        label.innerHTML = `
          <input type="checkbox" name="subject" value="${subject.id}">
          ${subject.name}
        `;

        subjectContainer.appendChild(label);

      });

    });


    /* ===============================
       Subject Selection → Show Exams
    =============================== */

    subjectContainer.addEventListener("change", () => {

      const selectedSubjects = document.querySelectorAll('input[name="subject"]:checked');

      examTypeContainer.innerHTML = "";

      if (selectedSubjects.length === 0) {

        examTypeGroup.classList.add("u-hidden");
        return;

      }

      examTypeGroup.classList.remove("u-hidden");

      examTypes.forEach(exam => {

        const label = document.createElement("label");

        label.innerHTML = `
          <input type="checkbox" name="examType" value="${exam.id}">
          ${exam.name}
        `;

        examTypeContainer.appendChild(label);

      });

    });


    /* ===============================
       Form Submit
    =============================== */

    form.addEventListener("submit", e => {

  e.preventDefault();

  const selectedSubjects = document.querySelectorAll('input[name="subject"]:checked');
  const selectedExamTypes = document.querySelectorAll('input[name="examType"]:checked');

  // Validate subjects
  if (selectedSubjects.length === 0) {
    alert("Please select at least one subject.");
    return;
  }

  // Validate exam types
  if (selectedExamTypes.length === 0) {
    alert("Please select at least one exam type.");
    return;
  }

  const data = {

    school: document.getElementById("schoolName").value,

    session: sessionSelect.value,

    class: classSelect.value,

    subjects: Array.from(selectedSubjects).map(el => el.value),

    examTypes: Array.from(selectedExamTypes).map(el => el.value)

  };

  console.log("Syllabus Data:", data);

  alert("Syllabus Builder Started");

});


  }
  catch (err) {

    console.error("Syllabus Builder initialization failed:", err);

  }
}


/* ===============================
   JSON Loader
================================ */

async function loadJSON(path) {

  try {

    const res = await fetch(path);

    if (!res.ok) {
      throw new Error(`Cannot load ${path}`);
    }

    return await res.json();

  }
  catch (err) {

    console.error("JSON Load Error:", err);

    return [];

  }

}