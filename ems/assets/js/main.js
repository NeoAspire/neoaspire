/* ===============================
   NEOASPIRE EMS - MAIN JS
   Scalable Module Loader
================================ */

// Global modules (load everywhere)
const coreModules = [
  "./ui/menu-toggle.js"
];

// Feature modules
const featureModules = [
  "./modules/syllabus-builder.js"
];

// Combine all modules
const modules = [...coreModules, ...featureModules];

// Load modules safely
async function loadModules() {

  const results = await Promise.allSettled(
    modules.map(path => import(path))
  );

  results.forEach((res, i) => {

    const modulePath = modules[i];

    if (res.status === "fulfilled") {

      console.log(`✔ ${modulePath} loaded`);

      const module = res.value;

      // Auto initialize module if init() exists
      if (typeof module.init === "function") {

        try {
          module.init();
        } catch (err) {
          console.error(`Init error in ${modulePath}`, err);
        }

      }

    }

    else {

      console.error(`✖ ${modulePath} failed`, res.reason);

    }

  });

  console.log("EMS initialization complete");

}

// Start app after DOM ready
document.addEventListener("DOMContentLoaded", loadModules);