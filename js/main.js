/* ===============================
   NEOASPIRE WEBSITE - MAIN JS
================================ */
console.log("main.js loaded");

// Global modules
const coreModules = [
  "./base.js", // <-- Header JS
  "./alertmsg.js", // <-- alert message JS 
  "./dark-mode.js" // <- dark mode JS
];

// Page specific modules
const pageModules = {
  blueprint: "./modules/blueprint/blueprint-builder.js",
  "syllabus-builder": "./modules/syllabus/syllabus-builder.js"
};

// Detect page
const page = document.body.dataset.page;

// Build module list
const modules = [
  ...coreModules,
  ...(pageModules[page] ? [pageModules[page]] : [])
];

async function loadModules() {

  const results = await Promise.allSettled(
    modules.map(path => import(path))
  );

  results.forEach((res, i) => {

    const modulePath = modules[i];

    if (res.status === "fulfilled") {

      console.log(`✔ ${modulePath} loaded`);

      const module = res.value;

      if (typeof module.init === "function") {

        try {
          module.init();
        } catch (err) {
          console.error(`Init error in ${modulePath}`, err);
        }

      }

    } else {

      console.error(`✖ ${modulePath} failed`, res.reason);

    }

  });

}

document.addEventListener("DOMContentLoaded", loadModules);