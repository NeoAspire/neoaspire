// layout.js
export async function init() {
    try {
        const response = await fetch('../base.html'); // adjust path if needed
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        const header = doc.querySelector('#site-header').innerHTML;
        const footer = doc.querySelector('#site-footer').innerHTML;

        const headerContainer = document.getElementById('header-container');
        const footerContainer = document.getElementById('footer-container');

        if (headerContainer) headerContainer.innerHTML = header;
        if (footerContainer) footerContainer.innerHTML = footer;

        // Initialize modules that depend on header/footer
        setupHamburgerNav();
        setupDarkModeToggle();

        // Fiscal Year
        const startYear = 2025;
        const currentYear = new Date().getFullYear();
        const displayYear = (currentYear === startYear)
            ? startYear
            : `${startYear} - ${currentYear.toString().slice(-2)}`;

        const fiscalElem = document.getElementById("fiscal-year");
        if (fiscalElem) fiscalElem.textContent = displayYear;

    } catch (error) {
        console.error('Error loading layout:', error);
    }
}

function setupHamburgerNav() {
    const hamburger = document.querySelector('.nav-hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => navLinks.classList.toggle('show'));

    document.addEventListener('click', e => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('show');
        }
    });
}

function setupDarkModeToggle() {
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (!toggleButton) return;

    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        toggleButton.textContent = '☀️';
    } else {
        toggleButton.textContent = '🌙';
    }

    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            toggleButton.textContent = '☀️';
            localStorage.setItem('darkMode', 'enabled');
        } else {
            toggleButton.textContent = '🌙';
            localStorage.setItem('darkMode', 'disabled');
        }
    });
}