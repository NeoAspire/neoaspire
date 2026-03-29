// ===============================
// LAYOUT.JS (Production-ready)
// ===============================

import { CONFIG, resolveLinks, resolveAssets } from './config.js';
import { fetchHTML } from './utils.js';
import { loadPageScript } from './loader.js';

// ===============================
// LOAD HEADER AND FOOTER
// ===============================

export async function loadLayout() {

    const app = document.body.dataset.app || 'main';
    const layout = CONFIG.APPS[app];

    if (!layout) {
        console.warn('No layout found for app:', app);
        return;
    }
    try {
        // Fetch header and footer concurrently
        const [headerHTML, footerHTML] = await Promise.all([
            fetchHTML(layout.header),
            fetchHTML(layout.footer)
        ]);
        const headerContainer = document.getElementById('header-container');
        const footerContainer = document.getElementById('footer-container');


        // Inject header
        if (headerContainer) {
            headerContainer.innerHTML = headerHTML;

            // ✅ Fix all relative <a> and <img>/<script>/<link> paths in the header
            resolveLinks(headerContainer);
            resolveAssets(headerContainer);

            initHamburger();     // ✅ works for all apps
            setActiveNav();      // ✅ highlight active link

        }

        // Inject footer
        if (footerContainer) {
            footerContainer.innerHTML = footerHTML;

            // ✅ Fix all relative links/assets in footer
            resolveLinks(footerContainer);
            resolveAssets(footerContainer);
        }

        // ✅ Load the page-specific JS AFTER header/footer
        loadPageScript();

    }
    catch (err) {
        console.error('❌ Failed to load layout:', err);
    }
}

// HAMBURGER TOGGLE MENU
function initHamburger() {
    const btn =
        document.getElementById('menuToggle') ||
        document.querySelector('.menu-toggle');

    const nav =
        document.querySelector('.nav-links') ||
        document.querySelector('.ems-nav');

    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
        nav.classList.toggle('show');
    });
}

// ACTIVE LINK
function setActiveNav() {
    const currentPage = document.body.dataset.page;

    const links = document.querySelectorAll('.nav-item');

    links.forEach(link => {
        if (link.dataset.page === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}