// INDEX JS (CORE FILE)

import { loadLayout } from "./layout.js";
import { CONFIG, path } from "./config.js";
import { showAlert } from "./alertmsg.js";

console.log("🚀 Neoaspire index.js loaded");

// ===============================
// GOOGLE ANALYTICS INIT
// ===============================
function initAnalytics() {
    const GA_ID = "G-98HN7ZGHW1"; // 🔥 replace with your ID

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_ID);

    console.log("📊 GA Loaded");
}

// ===============================
// GLOBAL EVENT TRACKING
// ===============================
function initEventTracking() {
     document.addEventListener('click', function(e) {

        const el = e.target.closest('a, button');
        if (!el) return;

        const page = el.dataset.page || "unknown";
         const app = el.dataset.app || document.body.dataset.app || "main";

        if (typeof gtag === 'function') {
            gtag('event', 'click', {
                link_text: el.textContent.trim(),
                page_name: page,
                app_name: app,
                path: window.location.pathname
            });
        }
    });
}


// ===============================
// LOAD MODULES DYNAMICALLY FROM CONFIG
// ===============================
async function loadModules() {
    const app = document.body.dataset.app || "main";
    const page = document.body.dataset.page;

    // Get module paths for current app and page
    const modules = CONFIG.MODULES?.[app]?.[page] || [];

    if (modules.length === 0) return;

    const results = await Promise.allSettled(
    modules.map(p => import(path(p)))
    );

    results.forEach((res, i) => {
        if (res.status === "fulfilled") {
            // Call init() if exported
            res.value.init?.();
            console.log(`✔ Loaded: ${modules[i]}`);
        } else {
            console.error(`✖ Failed: ${modules[i]}`, res.reason);
        }
    });
}

// ===============================
// PAGE ALERT
// ===============================
function showPageAlert() {
    const app = document.body.dataset.app || "main";
    const page = document.body.dataset.page;
    const appAlerts = CONFIG.ALERTS?.[app];   

    if (appAlerts && appAlerts[page]) {
        const alert = appAlerts[page];

        showAlert({
            message: alert.message,
            type: alert.type || "info",
            duration: alert.duration !== undefined ? alert.duration : 3000
        });
        
    }
}

// ===============================
// MAIN INIT
// ===============================
function init() {
    initAnalytics();        // ✅ MUST CALL
    initEventTracking();    // ✅ Tracking

    loadLayout();
    loadModules();
        // ✅ Show alert AFTER everything loads
    setTimeout(showPageAlert, 200);

}
// ===============================
// SAFE INIT
// ===============================
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

