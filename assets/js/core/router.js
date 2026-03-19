// router.js → SPA navigation using data-page + config

import { ROUTES } from './config.js';

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
    history.pushState({ page }, '', `/${page}`);
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
    const path = location.pathname.replace('/', '');
    return path || 'home';
}