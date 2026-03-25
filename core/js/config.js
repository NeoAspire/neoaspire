// CONFIG

const BASE_URL = location.hostname.includes("github.io")
    ? "/neoaspire-staging"
    : "";

// MAIN CONFIG OBJECT
export const CONFIG = {

    // App-specific file paths (IMPORTANT: keep relative paths)
    APPS: {
        main: {
            header: `${BASE_URL}/partials/header.html`,
            footer: `${BASE_URL}/partials/footer.html`
        },

        ems: {
            header: `${BASE_URL}/ems/partials/header.html`,
            footer: `${BASE_URL}/ems/partials/footer.html`
        }
    },

    // Alert messages for different apps/pages
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
                message: "👋 Welcome to about Page!",
                type: "info"
            }
        },
        ems: {
            dashboard: {
                message: "📊 EMS Dashboard Loaded!",
                type: "success"
            }
        },
        qbank: {
            blueprints: {
                message: "📘 Blueprint Editor Ready!",
                type: "warning"
            }
        }
    }

};