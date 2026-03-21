// layout.js → Loads header & footer (partials) + basic UI setup

import { PATHS, APP_CONFIG } from './config.js';

export async function init() {

    try {

        const [headerRes, footerRes] = await Promise.all([
            fetch(`${PATHS.base}${PATHS.partials}header.html`),
            fetch(`${PATHS.base}${PATHS.partials}footer.html`)
        ]);

        const [headerHTML, footerHTML] = await Promise.all([
            headerRes.text(),
            footerRes.text()
        ]);

        // ✅ SAFE INJECTION

        const header = document.getElementById('site-header');
        if (header) header.innerHTML = headerHTML;

        const footer = document.getElementById('site-footer');
        if (footer) footer.innerHTML = footerHTML;

        fixPaths();
        initHamburgerMenu();
        initFiscalYear();
        //  initDarkModeToggle();

    } catch (err) {
        console.error('Layout load error:', err);
    }
};

// Humburger toggle menu

function initHamburgerMenu() {
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
function fixPaths() {

    // Fix links
    document.querySelectorAll('[data-href]').forEach(link => {
        link.setAttribute('href', PATHS.base + link.dataset.href);
    });

    // Fix images
    document.querySelectorAll('[data-src]').forEach(img => {
        img.setAttribute('src', PATHS.base + img.dataset.src);
    });
}
