// LAYOUT JS

import { CONFIG } from './config.js';
import { resolveLinks, resolveAssets } from './config.js';
import { fetchHTML } from './utils.js';
import { loadPageScript } from './loader.js';
import { path } from './config.js';

// ===============================
// DYNAMIC CORE ASSETS (CSS + JS) PER APP
// ===============================
function loadCoreAssets() {
    const app = document.body.dataset.app || 'main';
    const layout = CONFIG.APPS[app];

    if (!layout) return;

// Load CSS for this app only
    if (layout.css) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = layout.css;
        document.head.appendChild(link);
    }

    // Load JS for this app only
    if (layout.js) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = layout.js;
        document.head.appendChild(script);
    }
}

// ===============================
// LOAD HEADER AND FOOTER
// ===============================

export async function loadLayout() {
      // Load app-specific CSS/JS first
    loadCoreAssets();
    
    const app = document.body.dataset.app || 'main';
    const layout = CONFIG.APPS[app];

    if (!layout) {
        console.warn('No layout found for app:', app);
        return;
    }

    const [headerHTML, footerHTML] = await Promise.all([
        fetchHTML(layout.header),
        fetchHTML(layout.footer)
    ]);
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');

    if (headerContainer) {
        headerContainer.innerHTML = headerHTML;

        // ✅ Fix all relative <a> and <img>/<script>/<link> paths in the header
        resolveLinks(headerContainer);
        resolveAssets(headerContainer);

        initHamburger();     // ✅ works for all apps
        setActiveNav();      // ✅ highlight active link

    }

    if (footerContainer) {
        footerContainer.innerHTML = footerHTML;

        // ✅ Fix all relative links/assets in footer
        resolveLinks(footerContainer);
        resolveAssets(footerContainer);
    }

    // ✅ Load the page-specific JS AFTER header/footer
    loadPageScript();

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