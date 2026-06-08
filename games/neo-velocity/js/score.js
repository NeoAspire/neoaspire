// SCORE.JS

import {
    gameState
} from "./gameState.js";

import {
    worldSpeed
} from "./speed.js";

/* =========================
   SCORE
========================= */
let score = 0;
const scoreElement =
    document.querySelectorAll(".hud-value")[0];

/* =========================
   SCORE LOOP
========================= */

function updateScore(){
    requestAnimationFrame(updateScore);
    if(!gameState.running) return;
    score += worldSpeed * 0.1;
    scoreElement.textContent =
        Math.floor(score);
}

/* START */

updateScore();