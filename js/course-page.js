
document.addEventListener("DOMContentLoaded", function () {

    let currentIndex = 0;

    const links = document.querySelectorAll("aside a");
    const sections = document.querySelectorAll("article .content-section");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const toggleBtn = document.getElementById("menuToggle");
    const sidebar = document.querySelector("aside");

    /* ==========================================
       INITIAL SETUP
    ========================================== */

    // Hide all sections
    sections.forEach(section => {
        section.style.display = "none";
    });

    // Show first section by default
    if (sections.length > 0) {
        sections[0].style.display = "block";
        currentIndex = 0;
    }

    updateActiveLink();


    /* ==========================================
       FUNCTIONS
    ========================================== */

    function updateActiveLink() {
        if (!sections[currentIndex]) return;

        const currentId = sections[currentIndex].id;

        links.forEach(link => {
            const linkId = link.getAttribute("href").substring(1);
            link.classList.toggle("active", linkId === currentId);
        });
    }

    // Show section by index
    function showSection(index) {
        if (index < 0 || index >= sections.length) return;

        // Hide completion section if visible
        const completeSection = document.querySelector(".course-complete");
        if (completeSection) {
            completeSection.classList.remove("active");
        }

        // Restore Next button
        if (nextBtn) {
            nextBtn.style.display = "inline-block";
        }

        // Hide all sections
        sections.forEach(section => {
            section.style.display = "none";
        });

        // Show selected section
        sections[index].style.display = "block";
        sections[index].scrollIntoView({ behavior: "smooth", block: "start" });

        currentIndex = index;
        updateActiveLink();
    }

    /* ==========================================
       SIDEBAR LINK CLICK
    ========================================== */

    links.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            const targetId = this.getAttribute("href").substring(1);

            sections.forEach((section, index) => {
                if (section.id === targetId) {
                    showSection(index);
                }
            });

            // Auto close sidebar on mobile
            if (window.innerWidth <= 900 && sidebar) {
                sidebar.classList.remove("active");
            }
        });
    });


    /* ==========================================
       PREVIOUS BUTTON
    ========================================== */

    if (prevBtn) {
        prevBtn.addEventListener("click", function () {

            const completeSection = document.querySelector(".course-complete");

            // If completion screen is visible
            if (completeSection && completeSection.classList.contains("active")) {

                completeSection.classList.remove("active");

                // Show the LAST lesson properly
                showSection(sections.length - 1);

                return;
            }

            // Normal backward navigation
            if (currentIndex > 0) {
                showSection(currentIndex - 1);
            }
        });
    }

    /* ==========================================
     NEXT BUTTON
  ========================================== */

    if (nextBtn) {
        nextBtn.addEventListener("click", function () {

            // If NOT last lesson → go next
            if (currentIndex < sections.length - 1) {
                showSection(currentIndex + 1);
            }

            // If LAST lesson → show completion screen
            else {

                // Hide all lesson sections
                sections.forEach(section => {
                    section.style.display = "none";
                });

                // Show completion section
                const completeSection = document.querySelector(".course-complete");
                if (completeSection) {
                    completeSection.classList.add("active");
                }

                // Optional: disable next button
                nextBtn.style.display = "none";
            }
        });
    }


    /* ==========================================
       HAMBURGER MENU TOGGLE
    ========================================== */

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", function () {
            sidebar.classList.toggle("active");
        });
    }

});

