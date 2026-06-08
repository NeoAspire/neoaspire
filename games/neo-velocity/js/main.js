// MAIN.JS

import { preloadAssets } from "./loader.js";

// ✅ start loading immediately on page load
preloadAssets();

// MAIN.JS — order matters
import "./gameState.js";  // ✅ first
import "./audio.js";      // ✅ second  
import "./level.js";      // ✅ before traffic
import "./speed.js";      // ✅ before traffic
import "./traffic.js";    // ✅ after level + speed
import "./policeTraffic.js";
import "./controls.js";
import "./collision.js";
import "./score.js";
import "./road.js";
import "./finish.js";
import "./ui.js";         // ✅ last


window.addEventListener("load", () => {
    document.body.focus();
});
window.addEventListener("click", () => {
    document.body.focus();
});