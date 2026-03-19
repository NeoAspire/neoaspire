fetch("../../ems/data/blueprints/filter.json")
    .then(res => res.json())
    .then(data => {

        const classSelect = document.getElementById("classFilter");
        const subjectSelect = document.getElementById("subjectFilter");

        data.classes.forEach(cls => {

            let option = document.createElement("option");
            option.value = cls.id;
            option.textContent = cls.name;

            classSelect.appendChild(option);

        });

        classSelect.addEventListener("change", function () {

            subjectSelect.innerHTML = `<option value="">Choose Subject</option>`;

            let selectedClass = data.classes.find(c => c.id === this.value);

            if (selectedClass) {

                selectedClass.subjects.forEach(sub => {

                    let option = document.createElement("option");
                    option.value = sub.id;
                    option.textContent = sub.name;

                    subjectSelect.appendChild(option);

                });

            }

        });

    });
