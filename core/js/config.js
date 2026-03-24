// CONFIG
export const CONFIG = {

    BASE_URL: "/",
    
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