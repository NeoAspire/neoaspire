// INDEX JS (CORE FILE)

import { loadLayout } from "./layout.js";
import { loadPageScript } from "./loader.js";
import { CONFIG } from "./config.js";
import { showAlert } from "./alertmsg.js";
import { fetchHTML } from "./utils.js";

console.log("🚀 Neoaspire main.js loaded");

const page = document.body.dataset.page;

const pageModules = {
    home: [],
    dashboard: [],
    blueprints: []
};
// LOAD MODULES
async function loadModules() {
    const modules = pageModules[page] || [];

    const results = await Promise.allSettled(
        modules.map(path => import(path))
    );

    results.forEach((res, i) => {
        if (res.status === "fulfilled") {
            res.value.init?.();
            console.log(`✔ Loaded: ${modules[i]}`);
        } else {
            console.error(`✖ Failed: ${modules[i]}`);
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