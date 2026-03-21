// layout.js → Loads header & footer (partials) + basic UI setup
console.log("HEADER URL:", `${EMS_CONFIG.base}${EMS_CONFIG.partials}header.html`);
import { EMS_CONFIG, APP_CONFIG } from './config.js';

export async function initEMSLayout() {

    try {

 // ✅ Load header (must load)
        const headerRes = await fetch(`${EMS_CONFIG.base}${EMS_CONFIG.partials}header.html`);
        const headerHTML = await headerRes.text();
        document.getElementById('ems-header').innerHTML = headerHTML;

        // ✅ Load footer (optional)
     /*   try {
            const footerRes = await fetch(`${EMS_CONFIG.base}${EMS_CONFIG.partials}footer.html`);
            const footerHTML = await footerRes.text();
            document.getElementById('ems-footer').innerHTML = footerHTML;
        } catch (e) {
            console.warn("Footer not found (ignored)");
        }
*/
        fixPaths();
        initMenuToggle();
        initFiscalYear();
   //     initDarkModeToggle();

    } catch (err) {
        console.error('EMS Layout load error:', err);
    }
};

// Humburger toggle menu
  
function initMenuToggle() {
    const menuToggle = document.getElementById("menuToggle");
    const emsNav = document.getElementById("emsNav");

    if (!menuToggle || !emsNav) {
        console.warn("Menu toggle elements not found");
        return;
    }

    console.log("Menu toggle initialized");

  // Toggle menu
    menuToggle.addEventListener("click", () => {
        emsNav.classList.toggle("show");
    });

    // 🔥 AUTO CLOSE when any nav item clicked
    emsNav.addEventListener("click", (e) => {
        if (e.target.classList.contains("nav-item")) {
            emsNav.classList.remove("show");
        }
    });

    document.addEventListener("click", (e) => {
    if (!emsNav.contains(e.target) && !menuToggle.contains(e.target)) {
        emsNav.classList.remove("show");
    }
});
    
}

// Fiscal Year
function initFiscalYear() {
    const startYear = APP_CONFIG.startYear;
    const currentYear = new Date().getFullYear();
    const displayYear = currentYear === startYear
        ? startYear
        : `${startYear} - ${currentYear.toString().slice(-2)}`;

    const el = document.getElementById('fiscal-year');
    if (el) el.textContent = displayYear;
}

// Dark mode toggle button
/*
function initDarkModeToggle() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;

    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        toggle.textContent = '☀️';
    } else {
        toggle.textContent = '🌙';
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            toggle.textContent = '☀️';
            localStorage.setItem('darkMode', 'enabled');
        } else {
            toggle.textContent = '🌙';
            localStorage.setItem('darkMode', 'disabled');
        }
    });
}
*/
// FIX PATHS

function fixPaths() {

    // Fix links
    document.querySelectorAll('[data-href]').forEach(link => {
        link.setAttribute('href', EMS_CONFIG.base + link.dataset.href);
    });

    // Fix images
    document.querySelectorAll('[data-src]').forEach(img => {
        img.setAttribute('src', EMS_CONFIG.base + img.dataset.src);
    });
}
