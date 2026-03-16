/* ===============================
   NEOASPIRE EMS - MAIN JS
================================ */

// Global modules
const coreModules = [
  "./ui/menu-toggle.js",
];

// Page specific modules
const pageModules = {
  "syllabus-builder": "./modules/syllabus/syllabus-builder.js",
  blueprint: "./modules/blueprint/blueprint-builder.js",
  questionPaper: "./modules/question-paper/question-paper-generator.js"
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