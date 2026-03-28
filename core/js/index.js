// INDEX JS (CORE FILE)

import { loadLayout } from "./layout.js";
import { CONFIG, path } from "./config.js";
import { showAlert } from "./alertmsg.js";


console.log("🚀 Neoaspire index.js loaded");

const page = document.body.dataset.page;

const pageModules = {
    syllabusBuilder: []
};

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

//PAGE ALERT
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

// SAFE INIT
function init() {
    loadLayout();
    loadModules();
        // ✅ Show alert AFTER everything loads
    setTimeout(showPageAlert, 200);

}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}