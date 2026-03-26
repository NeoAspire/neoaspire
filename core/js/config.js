// CONFIG

// Sets base path based on environment (GitHub vs local/production)
const BASE_URL = location.hostname.includes("github.io")
    ? "/neoaspire-staging"
    : "";

//Utility: builds full URL using BASE_URL + filePath
export const path = (p) => `${BASE_URL}${p}`;

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