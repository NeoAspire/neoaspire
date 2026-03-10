/* Blueprint.js - Handles loading and displaying question paper blueprints based on user selection */

function loadBlueprint(){

const classValue = document.getElementById("classFilter").value;
const subjectValue = document.getElementById("subjectFilter").value;

if(!classValue || !subjectValue){
alert("Please select Class and Subject");
return;
}

const path = `/ems/data/blueprints/class${classValue}/${subjectValue}.json`;

fetch(path)

.then(response => {

if(!response.ok){
throw new Error("Blueprint not found");
}

return response.json();

})

.then(data => {

console.log(data);

displayBlueprint(data);

})

.catch(error => {

console.error(error);

const container = document.getElementById("blueprint-content");

container.classList.remove("hidden");

container.innerHTML = `
<div class="blueprint-message">
<h3>📄 Blueprint Unavailable</h3>
<p>The blueprint for the selected class and subject has not been published yet.</p>
</div>
`;

});

}

/* Displays the blueprint data in a structured format on the page */
function displayBlueprint(data){

const container = document.getElementById("blueprint-content");

container.classList.remove("hidden");

let html = `

<div class="blueprint-header">

<h2>Class ${data.class} - ${data.subject}</h2>

<div class="blueprint-meta">

<div class="meta-box">
<span class="meta-title">Session</span>
<span class="meta-value">${data.session}</span>
</div>

<div class="meta-box">
<span class="meta-title">Subject Code</span>
<span class="meta-value">${data.subject_code}</span>
</div>

<div class="meta-box">
<span class="meta-title">Maximum Marks</span>
<span class="meta-value">${data.maximum_marks}</span>
</div>

<div class="meta-box">
<span class="meta-title">Time Duration</span>
<span class="meta-value">${data.time}</span>
</div>

</div>

</div>


<table class="blueprint-table">

<thead>
<tr>
<th>Section</th>
<th>Question No</th>
<th>Type</th>
<th>No. of Questions</th>
<th>Marks per Question</th>
<th>Total Marks</th>
</tr>
</thead>

<tbody>
`;

data.sections.forEach(section => {

if(section.subject){

html += `
<tr class="subject-row">
<td colspan="6"><strong>${section.subject}</strong></td>
</tr>
`;

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

/* Show breakdown if details exist */

if(section.details){

let detailText = Object.entries(section.details)
.map(([key,value]) => `${key.replace("_"," ")} (${value})`)
.join(" | ");

html += `
<tr class="details-row">
<td colspan="6">
<strong>Breakdown:</strong> ${detailText}
</td>
</tr>
`;

}

});

/*  */
html += `
</tbody>
</table>
`;

/* Internal Choice Section */

if(data.internal_choice){

let choiceText = Object.entries(data.internal_choice)
.map(([key,value]) => `<li><strong>${key.replace("_"," ").toUpperCase()}:</strong> ${value}</li>`)
.join("");

html += `
<div class="internal-choice">
<h3>Internal Choices</h3>
<ul class="choice-list">
${choiceText}
</ul>
</div>
`;

}

html += `
<p class="total-questions">
<strong>Total Questions:</strong> ${data.total_questions}
</p>
`;

container.innerHTML = html;

}