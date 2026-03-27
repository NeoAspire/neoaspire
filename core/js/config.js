// ===============================
// CONFIG (Environment + Paths)
// ===============================

// Detect BASE URL (GitHub repo vs domain vs local)
const BASE_URL = (() => {
    const repo = "neoaspire-staging";

    if (
        location.hostname.includes("github.io") &&
        location.pathname.startsWith(`/${repo}`)
    ) {
        return `/${repo}`;
    }

    return ""; // custom domain or localhost
})();

// Build full path safely
export const path = (p = "/") => {
    if (!p.startsWith("/")) p = "/" + p;
    return BASE_URL + p;
};

// ===============================
// LINK RESOLVER (Fix <a href>)
// ===============================

export function resolveLinks(root = document) {
    root.querySelectorAll("a[href]").forEach(link => {

        if (link.dataset.resolved) return;

        const href = link.getAttribute("href");

        if (
            !href ||
            href.startsWith("http") ||
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
        ) return;

        link.href = path(href);
        link.dataset.resolved = "true";
    });
}

// ===============================
// ASSET RESOLVER (Fix CSS + JS)
// ===============================

export function resolveAssets(root = document) {

    // Fix CSS
    root.querySelectorAll("link[href]").forEach(link => {

        if (link.dataset.resolved) return;

        const href = link.getAttribute("href");

        if (!href || href.startsWith("http")) return;

        link.href = path(href);
        link.dataset.resolved = "true";
    });

    // Fix JS
    root.querySelectorAll("script[src]").forEach(script => {

        if (script.dataset.resolved) return;

        const src = script.getAttribute("src");

        if (!src || src.startsWith("http")) return;

        script.src = path(src);
        script.dataset.resolved = "true";
    });
}

// ===============================
// MASTER RESOLVER (RUN THIS)
// ===============================

export function resolveAll(root = document) {
    resolveLinks(root);
    resolveAssets(root);
}

// ===============================
// MAIN CONFIG OBJECT
// ===============================

export const CONFIG = {

    // APP WISE HEADER AND FOOTER
    APPS: {
        main: {
            header: path('/partials/header.html'),
            footer: path('/partials/footer.html'),
            css: path('/assets/css/main.css'),       // main app CSS
            js: path('/core/js/index.js')            // core JS
        },

        ems: {
            header: path('/ems/partials/header.html'),
            footer: path('/ems/partials/footer.html'),
            css: path('/ems/assets/css/main.css'),    // EMS app CSS
            js: path('/core/js/index.js')        // EMS app JS if different
        }
    },

    // APP PAGE WISE ALERTS
    ALERTS: {
        main: {
            home: {
                message: `👋 Welcome to NeoAspire! Learn HTML, CSS, JS, and more.
Online classes are coming soon.
Stay tuned! 🚀`,
                type: "info",
                duration: 5000
            },
            about: {
                message: "",
                type: "info"
            },
            blueprints: {
                message: "📘 Blueprint viewer Ready!",
                type: "warning"
            }
        },

        ems: {
            dashboard: {
                message: "📊 EMS Dashboard Loaded!",
                type: "success"
            }
        }
    }

};