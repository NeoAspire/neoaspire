// CONFIG

// Detects base path based on where the app is running

const getBasePath = () => {
    // Works for GitHub Pages, local, and custom domains
    const path = window.location.pathname;

    // If hosted inside a repo like /neoaspire-staging/
    if (path.includes("neoaspire-staging")) {
        return "/neoaspire-staging/";
    }

    // Local or production root domain
    return "/";
};

// MAIN CONFIG OBJECT
export const CONFIG = {

    // Base URL used for all dynamic paths
    BASE_URL: getBasePath(),
    
    // App-specific file paths (IMPORTANT: keep relative paths)
    APPS: {
        main: {
            header: '/partials/header.html',
            footer: '/partials/footer.html'
        },
        
        ems: {
            header: '/ems/partials/header.html',
            footer: '/ems/partials/footer.html'
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