// SPEED.JS

import { gameState } from "./gameState.js";
import { setVolume, setRate } from "./audio.js";
import {getCurrentLevel} from "./level.js";

/* =========================
   GAME SPEED
========================= */

export let worldSpeed = 0;
export function setSpeed(value) {
    worldSpeed = value;
}
export function resetSpeed() {
    worldSpeed = 0;
}
export let playerSpeed = 120;

/* =========================
   HUD
========================= */

const speedElement =
    document.querySelectorAll(".hud-value")[1];

/* =========================
   KEYS
========================= */

const keys = { accelerate: false, brake: false };
window.addEventListener("keydown", (e) => {
    console.log("Pressed:", e.key); // debug

    if (e.key === "ArrowUp") {
        keys.accelerate = true;
    }

    if (e.key === "ArrowDown") {
        keys.brake = true;
    }
});

window.addEventListener("keyup", (e) => {
    console.log("Released:", e.key); // debug
    if (e.key === "ArrowUp") {
        keys.accelerate = false;
    }

    if (e.key === "ArrowDown") {
        console.log("Brake released"); // debug
        keys.brake = false;
    }
});

/* =========================
   MOBILE
========================= */

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || window.innerWidth <= 900;

let mobileTouching = false;

document.addEventListener("touchstart", () => { mobileTouching = true;  });
document.addEventListener("touchend",   () => { mobileTouching = false; });

/* =========================
   SPEED LOOP
========================= */

function updateSpeed() {
    requestAnimationFrame(updateSpeed);

    if (!gameState.running) return;

    /* ACCELERATION */

    if (isMobile) {
    if (mobileTouching) {
        worldSpeed += 0.15;
    } else {
        worldSpeed -= 0.03;
    }
} 
else {
    if (keys.accelerate) {
        worldSpeed += 0.2;   // 🚀 BOOST
    } 
    else if (keys.brake) {
        worldSpeed -= 0.1;
    } 
    else {
        worldSpeed -= 0.02;
    }
}

/* CLAMP — max speed increases per level */
const maxSpeedMap = [8, 10, 12, 13, 15];
const maxSpeed    = maxSpeedMap[getCurrentLevel()] || 15;

worldSpeed = Math.min(maxSpeed, Math.max(0, worldSpeed));

    /* HUD */
    playerSpeed  = Math.floor(worldSpeed * 30);
    speedElement.textContent = playerSpeed;

    /* =========================
       ENGINE SOUND MIXING
       — uses setVolume/setRate
         from audio.js (Web Audio)
    ========================= */

    const targetPitch = 0.9 + (worldSpeed / 22);
    setRate("racingEngine", Math.min(1.4, targetPitch));

    if (worldSpeed < 3) {
        setVolume("idleEngine",   1);
        setVolume("racingEngine", 0);
    } else {
        // Crossfade
        const ratio = Math.min(1, (worldSpeed - 3) / 6);
        setVolume("idleEngine",   Math.max(0, 1 - ratio));
        setVolume("racingEngine", Math.min(0.6, ratio * 0.6));
    }
}

updateSpeed();