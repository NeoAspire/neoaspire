// router.js → SPA navigation using data-page + config

import { ROUTES, PATHS } from './config.js';

export function initRouter() {

    // Handle link clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-link]');
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
    history.pushState(
        { page },
        '',
        `${PATHS.base}${page}`
    );
    router();
}

/* Load page */
async function router() {
    const page = history.state?.page || getPageFromURL();

    const path = ROUTES[page] || ROUTES.home;

    try {
        const response = await fetch(path);
        const html = await response.text();

        const doc = new DOMParser().parseFromString(html, 'text/html');
        const content = doc.querySelector('main').innerHTML;

        document.querySelector('main').innerHTML = content;

    } catch (err) {
        console.error('Router error:', err);
    }
}

/* Get page from URL */


function getPageFromURL() {
    const base = PATHS.base;
    const path = location.pathname
        .replace(base, '')
        .replace('/', '');

    return path || 'home';
}