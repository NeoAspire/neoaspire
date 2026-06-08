// FINISH.JS

import { gameState, stopGame, resumeGame } from "./gameState.js";
import { worldSpeed, setSpeed, resetSpeed } from "./speed.js";
import { playSound, stopSound }             from "./audio.js";
import { resetTrafficPositions }            from "./traffic.js";
import { getLevelData, levelUp, resetLevel, initLevel, showLevelBanner } from "./level.js"; 

let finished = false;
let distance  = 0;

const finishLine = document.querySelector(".finish-line");
const finishText = document.querySelector(".finish-text");
const kmDisplay  = document.querySelector(".km-display");

let finishY = -600;

/* =========================
   MAIN LOOP
========================= */

function updateFinish() {

    requestAnimationFrame(updateFinish);
    if (!gameState.running) return;

    // track distance
    distance += worldSpeed * 0.0001;
    kmDisplay.textContent = distance.toFixed(2) + " KM";

    // ✅ get current level's target km
    const levelData = getLevelData();
    const progress  = distance / levelData.targetKm;

    // move finish line
    finishY = -200 + (progress * (window.innerHeight + 200));
    finishLine.style.top = finishY + "px";

    // ✅ check if reached this level's target
    if (distance >= levelData.targetKm && !finished) {
        finishLevel();
    }
}

/* =========================
   LEVEL COMPLETE
========================= */

function finishLevel() {

    finished = true;

    stopGame();
    setSpeed(0);

    stopSound("idleEngine");
    stopSound("racingEngine");
    stopSound("policeSiren");

    // ✅ save BEFORE levelUp() changes currentLevel
const completedLevelNum = getLevelData().level;

    // ✅ try to go to next level
    const hasNextLevel = levelUp();

    if (hasNextLevel) {

        finishText.style.display = "block";
          finishText.textContent   = `✅ Level ${completedLevelNum} Complete!`;
     setTimeout(() => {
            startNextLevel();
        }, 2000);

    } else {

        // all 5 levels done
        finishText.style.display = "block";
        finishText.textContent   = "🏆 YOU WIN! All Levels Complete!";

        setTimeout(() => {
            fullReset();
        }, 3000);
    }
}

/* =========================
   NEXT LEVEL
   distance resets, level stays
========================= */
function startNextLevel() {
    finished = false;
    distance = 0;
    finishY  = -600;

    finishLine.style.top     = finishY + "px";
    finishText.style.display = "none";
    kmDisplay.textContent    = "0.00 KM";

    // ✅ show next level banner
    showLevelBanner(`🏎️ Level ${getLevelData().level} — GO!`);

    resetSpeed();
    resetTrafficPositions();

    playSound("idleEngine",   true, 1.0);
    playSound("racingEngine", true, 0.0);

    resumeGame();
}


/* =========================
   FULL RESET
   after all levels complete
========================= */

function fullReset() {

    finished = false;
    distance = 0;
    finishY  = -600;

    finishLine.style.top     = finishY + "px";
    finishText.style.display = "none";
    kmDisplay.textContent    = "0.00 KM";

    resetLevel();          // ✅ back to level 1
    resetSpeed();
    resetTrafficPositions();

    playSound("idleEngine",   true, 1.0);
    playSound("racingEngine", true, 0.0);

    resumeGame();
}

updateFinish();