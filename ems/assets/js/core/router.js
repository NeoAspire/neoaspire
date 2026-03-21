// EMS router.js → SPA navigation using data-page + config

import { EMS_ROUTES, EMS_CONFIG, } from './config.js';

export function initEMSRouter() {

    // Handle link clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-ems-link]');
        if (!link) return;

        e.preventDefault();

        const page = link.dataset.page;
        navigateTo(page);
    });

    // Back / Forward support
    window.addEventListener('popstate', router);

    // Initial load
    router();
}

/* Navigate using page key */

function navigateTo(page) {
    const path = EMS_ROUTES[page] || EMS_ROUTES.landing;
    history.pushState(
        { page },
        '',
        `${EMS_CONFIG.base}${path}`
    );
    router();
}

/* Load page */
async function router() {
    const page = history.state?.page || getPageFromURL();

    const path = EMS_ROUTES[page] || EMS_ROUTES.landing;

    try {
        const response = await fetch(`${EMS_CONFIG.base}${path}`);
        const html = await response.text();

        const doc = new DOMParser().parseFromString(html, 'text/html');
        const content = doc.querySelector('#ems-content').innerHTML
                                    || doc.querySelector('main')?.innerHTML 
                                    ||  "<h2>Page not found</h2>";

        document.querySelector('#ems-content').innerHTML = content;

    } catch (err) {
        console.error('EMS Router error:', err);
    }
}

/* Get page from URL */

function getPageFromURL() {
    const base = EMS_CONFIG.base;

    let path = location.pathname.replace(EMS_CONFIG.base, '');

    // remove trailing slash
    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }

    // ✅ reverse match
    const match = Object.entries(EMS_ROUTES)
        .find(([key, value]) => value === path);

    return path || 'landing';
}