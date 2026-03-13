/* ===============================
   NEOASPIRE EMS - MAIN JS
   Robust Module Loader
================================ */

const modules = [
   // Critical UI Components modules
  "./ui/menu-toggle.js",
  // Modules
  "./modules/syllabus-builder.js",
];

Promise.allSettled(modules.map(path => import(path)))
  .then(results => {
    results.forEach((res, i) => {
      if (res.status === "fulfilled") {
        console.log(`${modules[i]} loaded successfully`);
      } else {
        console.error(`${modules[i]} failed to load`, res.reason);
      }
    });

    // Safe to initialize the app now
    console.log("All modules attempted. EMS can now start safely.");
  });