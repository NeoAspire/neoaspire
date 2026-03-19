/* ===============================
MAIN JS (Master File) 
================================ */

console.log("main.js loaded");

// Global modules (core)
const coreModules = [
    "./core/layout.js",    // layout module
    "./core/alertmsg.js",  // alert messages
    "./core/darkmode.js"   // extra dark mode functionality
];

// Page-specific modules
const pageModules = {
  home: "./core/alertmsg.js",
    
    "syllabus-builder": "./modules/syllabus/syllabus-builder.js"
};

// Detect page
const page = document.body.dataset.page;

// Build module list dynamically
const modules = [
    ...coreModules,
    ...(pageModules[page] ? [pageModules[page]] : [])
];

// Load modules
async function loadModules() {
    const results = await Promise.allSettled(modules.map(path => import(path)));

    results.forEach((res, i) => {
        const path = modules[i];
        if (res.status === "fulfilled") {
            const mod = res.value;
            if (mod.init) mod.init();
            console.log(`✔ ${path} loaded`);
        } else {
            console.error(`✖ ${path} failed`, res.reason);
        }
    });
}

document.addEventListener("DOMContentLoaded", loadModules);