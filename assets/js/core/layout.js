// layout.js → Loads header & footer (partials) + basic UI setup

import { PATHS, APP_CONFIG } from './config.js';

export async function init() {

    try {
        const depth = window.location.pathname.split('/').length - 2;
        const base = '../'.repeat(depth);

        const [headerRes, footerRes] = await Promise.all([
            fetch(`${base}partials/header.html`),
            fetch(`${base}partials/footer.html`)
        ]);

        const [headerHTML, footerHTML] = await Promise.all([
            headerRes.text(),
            footerRes.text()
        ]);

        document.getElementById('site-header').innerHTML = headerHTML;
        document.getElementById('site-footer').innerHTML = footerHTML;

        initHamburgerMenu();
        initFiscalYear();
        initDarkModeToggle();

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
