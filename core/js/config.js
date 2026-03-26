// CONFIG

// ===============================
// CONFIG (Environment + Paths)
// ===============================

// Detect base path (GitHub Pages vs Local)
const BASE_URL = location.hostname.includes("github.io")
    ? "/neoaspire-staging"
    : "";

// Build full path safely
export const path = (p = "/") => {
    if (!p.startsWith("/")) p = "/" + p;   // ensure leading slash
    return BASE_URL + p;
};

// ===============================
// AUTO LINK RESOLVER (KEY FIX)
// ===============================

export function resolveLinks(root = document) {
    root.querySelectorAll("a[href]").forEach(link => {

        // Prevent double processing
        if (link.dataset.resolved) return;

        const href = link.getAttribute("href");

        // Skip special/external links
        if (
            !href ||
            href.startsWith("http") ||
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
        ) return;

        // Fix path using BASE_URL
        link.href = path(href);

        // Mark as processed
        link.dataset.resolved = "true";
    });
}


// MAIN CONFIG OBJECT
export const CONFIG = {

    APPS: {
        main: {
            header: path('/partials/header.html'),
            footer: path('/partials/footer.html')
        },

        ems: {
            header: path('/ems/partials/header.html'),
            footer: path('/ems/partials/footer.html')
        }
    },

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