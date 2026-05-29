// ================= MAIN.JS =================
// Entry point — wires everything together
// Sound system + global exports for HTML onclick attributes

import { initBoard, addCenter, setupInputHandler } from "./ui.js";
import { selectMode, startGame, rollDice, nextTurn } from "./game.js";

// ================= SOUND SYSTEM =================
let soundEnabled = true;

export function toggleSound() {
    soundEnabled = !soundEnabled;

    const btn = document.getElementById("soundBtn");
    if (!btn) return;

    if (soundEnabled) {
        btn.textContent = "🔊 ";
        btn.classList.remove("off");
    } else {
        btn.textContent = "🔇";
        btn.classList.add("off");
    }
}

export function playSound(id) {

    const sound = document.getElementById(id);

    if (!sound) return;

    // iPhone Safari fix
    const clone = sound.cloneNode();

    clone.volume = sound.volume;

    clone.play().catch(() => {});
}

// ================= RESTART =================
export function restartGame() {
    location.reload();
}

// ================= INIT =================
window.onload = () => {
    initBoard();
    addCenter();
    setupInputHandler();

    // Preload sounds
    ["diceRoll", "diceHit", "tokenMove", "tokenKill", "finishSound", "enterSound"]
        .forEach(id => {
            const s = document.getElementById(id);
            if (s) s.load();
        });
};

// ================= GLOBAL EXPORTS =================
// These are needed because HTML uses onclick="selectMode(...)" etc.
// If you switch to addEventListener everywhere you can remove these.
window.selectMode = selectMode;
window.startGame = startGame;
window.rollDice = rollDice;
window.restartGame = restartGame;
window.toggleSound = toggleSound;
