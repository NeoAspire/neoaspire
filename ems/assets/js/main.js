/* ===============================
MAIN JS (Master File) of EXAM MANAGEMENT SYSTEM
================================ */

console.log("main.js loaded");

// Global modules (core)
const coreModules = [
    "./core/config.js", 
    "./core/layout.js",    // layout module
    "./core/router.js"
];

// Page-specific modules
const pageModules = {
 
 
};

// Detect page
const page = document.body.dataset.page;

// Build module list dynamically
const modules = [
    ...coreModules,
    ...(Array.isArray(pageModules[page])
        ? pageModules[page]
        : pageModules[page]
        ? [pageModules[page]]
        : [])
];

// Load modules
async function loadModules() {
    const results = await Promise.allSettled(modules.map(path => import(path)));

    results.forEach((res, i) => {
        const path = modules[i];
        if (res.status === "fulfilled") {
            const mod = res.value;
            if (mod.initEMSLayout) mod.initEMSLayout();
            console.log(`✔ ${path} loaded`);
        } else {
            console.error(`✖ ${path} failed`, res.reason);
        }
    });
}

document.addEventListener("DOMContentLoaded", loadModules);