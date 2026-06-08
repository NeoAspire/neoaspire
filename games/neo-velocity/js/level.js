// LEVEL.JS

import { gameState } from "./gameState.js";

/* =========================
   LEVEL CONFIG
========================= */

export const LEVELS = [
    { level: 1, targetKm: 0.5,  boost: 0  },
    { level: 2, targetKm: 1.0,  boost: 1  },
    { level: 3, targetKm: 1.5,  boost: 3  },
    { level: 4, targetKm: 2.0,  boost: 6  },
    { level: 5, targetKm: 2.5,  boost: 10 }
];

/* =========================
   LEVEL STATE
========================= */

export let currentLevel      = 0;
export let trafficSpeedBoost = 0;

/* =========================
   HUD + MESSAGE ELEMENTS
========================= */

const levelDisplay = document.querySelector(".level-display");
const levelMessage = document.querySelector(".level-message");

let messageTimeout = null;

/* =========================
   SHOW LEVEL ON SCREEN
   Call this on game start
   and after each level up
========================= */

export function showLevelBanner(text) {

    if (!levelMessage) return;

    // clear previous timeout
    if (messageTimeout) clearTimeout(messageTimeout);

    levelMessage.textContent  = text;
    levelMessage.classList.add("show-level-message");

    messageTimeout = setTimeout(() => {
        levelMessage.classList.remove("show-level-message");
    }, 2500);
}

/* =========================
   GET CURRENT LEVEL DATA
========================= */

export function getLevelData() {
    return LEVELS[currentLevel];
}

/* =========================
   LEVEL UP
========================= */

export function levelUp() {

    if (currentLevel < LEVELS.length - 1) {

        // ✅ show completed message first
        showLevelBanner(
            `✅ Level ${LEVELS[currentLevel].level} Complete!`
        );

        currentLevel++;
        trafficSpeedBoost = LEVELS[currentLevel].boost;

        // ✅ update HUD
        if (levelDisplay) {
            levelDisplay.textContent = "LVL " + LEVELS[currentLevel].level;
        }

        return true;
    }

    return false;
}

/* =========================
   RESET
========================= */

export function resetLevel() {

    currentLevel      = 0;
    trafficSpeedBoost = LEVELS[0].boost;

    if (levelDisplay) {
        levelDisplay.textContent = "LVL 1";
    }

    // ✅ show level 1 banner on reset
    showLevelBanner("🏎️ Level 1 — GO!");
}

/* =========================
   INIT — show level 1
   on first game start
========================= */

export function initLevel() {
    if (levelDisplay) {
        levelDisplay.textContent = "LVL 1";
    }
    showLevelBanner("🏎️ Level 1 — GO!");
}