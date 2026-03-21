// config.js → Global app configuration (ES2025)

/* =========================
   App Info
========================= */
export const APP_CONFIG = Object.freeze({
    name: "Neoaspire",
    version: "1.0.0",
    startYear: 2025
});

/* =========================
   Base Paths
========================= */
export const PATHS = Object.freeze({

    base: window.location.hostname.includes('github.io')
        ? `/${window.location.pathname.split('/')[1]}/`
        : '/',       // root path

    partials: "partials/",                   // header/footer folder
    assets: "assets/",
    images: "assets/images/",
    css: "assets/css/",
    js: "assets/js/"
});

/* =========================
   Routes (for router.js)
========================= */
export const ROUTES = Object.freeze({
    home: "index.html",
    about: "pages/about.html",
    career: "pages/career-guidance.html",
    comingSoon: "pages/coming-soon.html",
    contact: "pages/contact-us.html",
    downloads: "pages/downloads.html",
    privacyPolicy: "legal/privacy-policy.html",
    termsOfService: "legal/terms-of-service.html",
    payments: "payments/payments.html"
});

/* =========================
   Local Storage Keys
========================= */
export const STORAGE_KEYS = Object.freeze({
    darkMode: "dark-mode",
    user: "user-data"
});

/* =========================
   UI Settings (Alert Message)
========================= */
export const UI_CONFIG = Object.freeze({
    alertDuration: 3000,    // 3 seconds
    animationSpeed: 300
});

/* =========================
   Contact Info
========================= */
export const CONTACT = Object.freeze({
    email: "neoaspire9@gmail.com",
    phone: "+91-XXXXXXXXXX"
});

/* =========================
   Environment Config
========================= */
export const ENV_CONFIG = Object.freeze({
    env: "development",       // 'development' | 'staging' | 'production'
    debug: true
});

/* =========================
   Module Paths
========================= */
export const MODULE_PATHS = Object.freeze({
    courses: "courses/",
    creatives: "creatives/",
    ems: "ems/",
    games: "games/",
    legal: "legal/",
    qbank: "q-bank/"
});

/* =========================
   API Config
========================= */
export const API_CONFIG = Object.freeze({
    baseURL:
        window.location.hostname === "localhost"
            ? "http://localhost:3000"
            : window.location.hostname.includes("neoaspire-staging")
                ? "https://staging.api.neoaspire.in"
                : "https://api.neoaspire.in",

    timeout: 5000
});