
/* =========================
   FILTER CONFIG (CONTROL UI)
========================= */
const FILTER_CONFIG = {
    classes: ["9","10"],

    subjects: {
        "1": ["english","evs","hindi","math","punjabi","art-craft","general-knowledge","moral-science"],
        "2": ["english","evs","hindi","math","punjabi","art-craft","general-knowledge","moral-science"],
        "3": ["english","hindi","math","punjabi","science","social-science","art-craft","computer","general-knowledge","moral-science"],
        "4": ["english","hindi","math","punjabi","science","social-science","art-craft","computer","general-knowledge","moral-science"],
        "5": ["english","hindi","math","punjabi","science","social-science","art-craft","computer","general-knowledge","moral-science"],
        "6": ["english","hindi","math","punjabi","science","social-science","art-craft","computer","general-knowledge","moral-science"],
        "7": ["english","hindi","math","punjabi","science","social-science","art-craft","computer","general-knowledge","moral-science"],
        "8": ["english","hindi","math","punjabi","science","social-science","art-craft","computer","general-knowledge","moral-science"],
        "9": ["english","hindi","math","punjabi","science","social-science","IT-402"],
        "10": ["english","hindi","math","punjabi","science","social-science","IT-402"]
    }
};


/* =========================
   GLOBAL DATA STORAGE
========================= */
let classesData = [];
let subjectsData = [];
let classSubjectMap = [];


/* =========================
   LOAD JSON
========================= */
async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
}


/* =========================
   INIT PAGE
========================= */
async function initBlueprintPage() {

    try {

        classesData = await loadJSON('/ems/data/academic/classes.json');
        subjectsData = await loadJSON('/ems/data/academic/subjects.json');
        classSubjectMap = await loadJSON('/ems/data/academic/class-subjects.json');

        const classSelect = document.getElementById("classFilter");
        const subjectSelect = document.getElementById("subjectFilter");

        /* ========= LOAD CLASSES ========= */
        classesData
            .filter(cls => FILTER_CONFIG.classes.includes(cls.id))
            .forEach(cls => {

                let option = document.createElement("option");
                option.value = cls.id;
                option.textContent = cls.name;

                classSelect.appendChild(option);

            });


        /* ========= CLASS CHANGE ========= */
        classSelect.addEventListener("change", function () {

            const selectedClass = classSubjectMap.find(c => c.class_id === this.value);

            populateSubjects(
                selectedClass ? selectedClass.subjects : [],
                this.value
            );

        });


        /* ========= BUTTON ========= */
        const btn = document.getElementById("viewBlueprintBtn");

        if (btn) {
            btn.addEventListener("click", loadBlueprint);
        }

    } catch (err) {
        console.error("Init Error:", err);
    }
}


/* =========================
   SUBJECT FILTER
========================= */
function populateSubjects(classSubjects, classId) {

    const subjectSelect = document.getElementById("subjectFilter");

    subjectSelect.innerHTML = `<option value="">Choose Subject</option>`;

    const allowedSubjects = FILTER_CONFIG.subjects[classId] || [];

    subjectsData
        .filter(sub =>
            classSubjects.includes(sub.id) &&
            allowedSubjects.includes(sub.id)
        )
        .forEach(sub => {

            let option = document.createElement("option");
            option.value = sub.id;
            option.textContent = sub.name;

            subjectSelect.appendChild(option);

        });
}


/* =========================
   LOAD BLUEPRINT
========================= */
function loadBlueprint() {

    const classValue = document.getElementById("classFilter").value;
    const subjectValue = document.getElementById("subjectFilter").value;

    if (!classValue || !subjectValue) {
        alert("Please select Class and Subject");
        return;
    }

    const path = `/ems/data/blueprints/class${classValue}/${subjectValue}.json`;

    console.log("Loading:", path); // DEBUG

    fetch(path)
        .then(res => {
            if (!res.ok) throw new Error("Blueprint not found");
            return res.json();
        })
        .then(data => displayBlueprint(data))
        .catch(err => {

            console.error(err);

            const container = document.getElementById("blueprint-content");
            container.classList.remove("hidden");

            container.innerHTML = `
                <div class="blueprint-message">
                    <h3>📄 Blueprint Unavailable</h3>
                    <p>Blueprint not found for selected class & subject.</p>
                </div>
            `;
        });
}


/* =========================
   DISPLAY BLUEPRINT
========================= */
function displayBlueprint(data) {

    const container = document.getElementById("blueprint-content");
    container.classList.remove("hidden");

    let html = `
    <div class="blueprint-header">
        <h2>Class ${data.class} - ${data.subject}</h2>

        <div class="blueprint-meta">
            <div class="meta-box"><span>Session</span>${data.session}</div>
            <div class="meta-box"><span>Subject Code</span>${data.subject_code}</div>
            <div class="meta-box"><span>Maximum Marks</span>${data.maximum_marks}</div>
            <div class="meta-box"><span>Time</span>${data.time}</div>
        </div>
    </div>

    <table class="blueprint-table">
        <thead>
            <tr>
                <th>Section</th>
                <th>Q.No</th>
                <th>Type</th>
                <th>Q Count</th>
                <th>Marks</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
    `;

    data.sections.forEach(section => {

        if (section.subject) {
            html += `<tr><td colspan="6"><strong>${section.subject}</strong></td></tr>`;
        }

        html += `
        <tr>
            <td>${section.section}</td>
            <td>${section.question_range}</td>
            <td>${section.question_type}</td>
            <td>${section.no_of_questions}</td>
            <td>${section.marks_per_question}</td>
            <td>${section.total_marks}</td>
        </tr>
        `;

        if (section.details) {

            let details = Object.entries(section.details)
                .map(([k,v]) => `${k.replace("_"," ")} (${v})`)
                .join(" | ");

            html += `
            <tr>
                <td colspan="6"><strong>Details:</strong> ${details}</td>
            </tr>
            `;
        }

    });

    html += `</tbody></table>`;

    container.innerHTML = html;
}


/* =========================
   START
========================= */
document.addEventListener("DOMContentLoaded", initBlueprintPage);