// syllabus-builder.js
console.log("SYLLABUS BUILDER LOADED");

export async function initSyllabusBuilder() {
  try {
    const [sessions, classes, subjects, mapping] = await Promise.all([
      loadJSON("/ems/data/academic/sessions.json"),
      loadJSON("/ems/data/academic/classes.json"),
      loadJSON("/ems/data/academic/subjects.json"),
      loadJSON("/ems/data/class-subjects.json")
    ]);

    const sessionSelect = document.getElementById("session");
    const classSelect = document.getElementById("classSelect");
    const subjectSelect = document.getElementById("subjectSelect");
    const form = document.getElementById("syllabusForm");

    // Load sessions
    sessions.forEach(s => {
      const option = document.createElement("option");
      option.value = s.id;
      option.textContent = s.name;
      sessionSelect.appendChild(option);
    });

    // Load classes
    classes.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = c.name;
      classSelect.appendChild(option);
    });

    // Load subjects when class changes
    classSelect.addEventListener("change", () => {
      subjectSelect.innerHTML = '<option value="">Select Subject</option>';
      const selectedClass = classSelect.value;
      if (!mapping[selectedClass]) return;

      mapping[selectedClass].forEach(subjectId => {
        const subject = subjects.find(s => s.id == subjectId);
        if (subject) {
          const option = document.createElement("option");
          option.value = subject.id;
          option.textContent = subject.name;
          subjectSelect.appendChild(option);
        }
      });
    });

    // Form submit
    form.addEventListener("submit", e => {
      e.preventDefault();
      const data = {
        school: document.getElementById("schoolName").value,
        session: sessionSelect.value,
        class: classSelect.value,
        subject: subjectSelect.value
      };
      console.log("Syllabus Data:", data);
      alert("Syllabus Builder Started");
    });

  } catch (err) {
    console.error("Syllabus Builder initialization failed:", err);
  }
}

async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Cannot load ${path}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}