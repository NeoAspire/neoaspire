// UI.JS

import { startGame } from "./gameState.js";
import { initAudio, playSound } from "./audio.js";
import { initLevel } from "./level.js";

/* =========================
   ELEMENTS
========================= */

const startScreen = document.querySelector(".start-screen");
const playBtn     = document.querySelector(".play-btn");

/* =========================
   START GAME
========================= */

playBtn.addEventListener("click", async () => {

    await initAudio();

    playSound("click",        false, 0.4);
    playSound("idleEngine",   true,  1.0);
    playSound("racingEngine", true,  0.0);

    startGame();
    initLevel(); // ✅ shows "Level 1 — GO!" on screen

    startScreen.classList.add("hide-start");
});