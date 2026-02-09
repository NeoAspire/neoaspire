
let currentIndex = 0; // Global variable for tracking current section

document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll("aside a");
    const sections = document.querySelectorAll("article .content-section");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    console.log("Page loaded");
    console.log("Found " + sections.length + " sections");
    console.log("Prev button:", prevBtn);
    console.log("Next button:", nextBtn);

    // Hide all sections initially
    sections.forEach(sec => sec.style.display = "none");

    // Show first section by default
    if (sections.length > 0) {
        sections[0].style.display = "block";
        currentIndex = 0;
    }

    // Function to update active class on sidebar links
    function updateActiveLink() {
        if (currentIndex >= 0 && currentIndex < sections.length) {
            const currentSectionId = sections[currentIndex].id;
            links.forEach(link => {
                const linkHref = link.getAttribute("href").substring(1);
                if (linkHref === currentSectionId) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            });
        }
    }

    // Function to show a specific section
    function showSection(index) {
        if (index < 0 || index >= sections.length) return;
        
        sections.forEach(sec => sec.style.display = "none");
        sections[index].style.display = "block";
        sections[index].scrollIntoView({ behavior: "smooth" });
        currentIndex = index;
        updateActiveLink(); // Update active link when showing section
        console.log("Showing section " + (index + 1));
    }

    // Add click event to each aside link
    links.forEach((link, index) => {
        link.addEventListener("click", function(e) {
            e.preventDefault();

            // Get the target section id
            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            // Find and show the clicked section
            if (targetSection) {
                for (let i = 0; i < sections.length; i++) {
                    if (sections[i].id === targetId) {
                        showSection(i);
                        break;
                    }
                }
            }
        });
    });

    // Add functionality for Previous button
    if (prevBtn) {
        prevBtn.addEventListener("click", function() {
            console.log("Previous clicked, current index: " + currentIndex);
            if (currentIndex > 0) {
                showSection(currentIndex - 1);
            }
        });
    }

    // Add functionality for Next button
    if (nextBtn) {
        nextBtn.addEventListener("click", function() {
            console.log("Next clicked, current index: " + currentIndex);
            if (currentIndex < sections.length - 1) {
                showSection(currentIndex + 1);
            }
        });
    }

    // Set active class on first link initially
    updateActiveLink();
});


