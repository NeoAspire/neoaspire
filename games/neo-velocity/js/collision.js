// COLLISION.JS

import { gameState, stopGame, resumeGame } from "./gameState.js";
import { playSound, stopSound }            from "./audio.js";
import { resetTrafficPositions }           from "./traffic.js";
import { resetPolicePosition }             from "./policeTraffic.js";
import { resetSpeed, worldSpeed }                       from "./speed.js";

/* =========================
   ELEMENTS
========================= */

const playerCar      = document.querySelector(".player-car");
const enemyCars      = document.querySelectorAll(".enemy-car");
const gameOverScreen = document.querySelector(".game-over-screen");
const continueScreen = document.querySelector(".continue-screen");
const heartsDisplay  = document.querySelector(".hearts-display");
const continueBtn    = document.querySelector(".continue-btn");
const noChancesText  = document.querySelector(".no-chances-text");
const finalScoreText = document.querySelector(".final-score-text");

/* =========================
   LIVES
========================= */

let lives = 10;

/* =========================
   HITBOX
========================= */

function getHitbox(element) {
    const rect = element.getBoundingClientRect();
    return {
        left:   rect.left   + 26,
        right:  rect.right  - 26,
        top:    rect.top    + 24,
        bottom: rect.bottom - 24
    };
}

function isColliding(a, b) {
    return a.left < b.right  &&
           a.right > b.left  &&
           a.top   < b.bottom &&
           a.bottom > b.top;
}

/* =========================
   UPDATE HEARTS
========================= */

function updateHearts() {
    if (!heartsDisplay) return;
    heartsDisplay.textContent = "❤️".repeat(lives);
}

/* =========================
   COLLISION LOOP
========================= */

function checkCollision() {
    requestAnimationFrame(checkCollision);
    if (!gameState.running) return;

        if (worldSpeed <= 0) return

        
    const playerRect = getHitbox(playerCar);

    enemyCars.forEach((car) => {
        const enemyRect = getHitbox(car);
        if (enemyRect.bottom < 0 || enemyRect.top > window.innerHeight) return;
        if (isColliding(playerRect, enemyRect)) {
            triggerCrash();
        }
    });
}

/* =========================
   CRASH
========================= */

function triggerCrash() {
    if (!gameState.running) return;

    stopGame();

    stopSound("idleEngine");
    stopSound("racingEngine");
    stopSound("siren");

    playSound("crash", false, 0.5);

    document.body.style.animation = "crashShake 0.3s";

    playerCar.style.transition = "transform 0.2s ease";
    playerCar.style.transform  =
        "translateX(-50%) rotate(18deg) scale(0.92)";

    setTimeout(() => {
        lives--;
        updateHearts();

        if (lives > 0) {
            showContinueScreen();
        } else {
            showGameOver();
        }
    }, 500);
}

/* =========================
   CONTINUE SCREEN
========================= */

function showContinueScreen() {
    if (!continueScreen) return;
    if (noChancesText) noChancesText.style.display = "none";
    if (continueBtn)   continueBtn.style.display   = "block";
    continueScreen.classList.add("show-continue");
}

/* =========================
   GAME OVER
========================= */

function showGameOver() {
    if (noChancesText) noChancesText.style.display = "block";

    if (finalScoreText) {
        const scoreEl = document.querySelectorAll(".hud-value")[0];
        finalScoreText.textContent =
            `Final Score: ${scoreEl ? scoreEl.textContent : "0"}`;
    }

    setTimeout(() => {
        gameOverScreen.classList.add("show-game-over");
    }, 400);
}

/* =========================
   CONTINUE BUTTON
========================= */

if (continueBtn) {
    continueBtn.addEventListener("click", () => {

        continueScreen.classList.remove("show-continue");

        // ✅ Reset JS position variables — this is the real fix
        // style.top alone does nothing because traffic.js overwrites it
        resetTrafficPositions();
        resetPolicePosition();
        resetSpeed();
        // Reset player
        playerCar.style.transition = "none";
        playerCar.style.transform  = "translateX(-50%)";
        playerCar.style.left       = "50%";
        playerCar.style.bottom     = "";
        playerCar.style.opacity    = "0";

        // Fade in
        setTimeout(() => {
            playerCar.style.transition = "opacity 0.5s ease";
            playerCar.style.opacity    = "1";
        }, 200);

        // Restart engines
        playSound("idleEngine",   true, 1.0);
        playSound("racingEngine", true, 0.0);

        // Resume after fade
        setTimeout(() => {
            resumeGame();
        }, 700);
    });
}

/* =========================
   RESTART BUTTON
========================= */

const restartBtn = document.querySelector(".restart-btn");

if (restartBtn) {
    restartBtn.addEventListener("click", () => {
        stopSound("crash");
        location.reload();
    });
}

checkCollision();