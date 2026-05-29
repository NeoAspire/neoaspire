// ================= MAIN.JS =================
// Entry point — wires everything together
// Sound system + global exports for HTML onclick attributes

// 1. Game logic (core)
import { selectMode, startGame, rollDice, nextTurn } from "./game.js";
// 2. UI (depends on game)
import { initBoard, addCenter, setupInputHandler } from "./ui.js";
// 3. Services (independent systems)
import { unlockAudio, toggleSoundState } from "./audioEngine.js";

// ================= SOUND SYSTEM =================
//let soundEnabled = true;

// ── iOS AudioContext unlock ──────────────────────────────────────────────────

let audioUnlocked = false;

// Fire on first tap anywhere (covers both button taps and dice taps)
document.addEventListener("touchstart", unlockAudio, { once: true });
document.addEventListener("mousedown",  unlockAudio, { once: true });

// ── Audio pools ──────────────────────────────────────────────────────────────

export function stopSound(id) {
    const original = document.getElementById(id);
    if (original) { original.pause(); original.currentTime = 0; }

    if (audioPools[id]) {
        audioPools[id].forEach(s => { s.pause(); s.currentTime = 0; });
    }
}

// ================= SOUND TOGGLE =================

export function toggleSound() {
    const enabled = toggleSoundState();

    const btn = document.getElementById("soundBtn");
    if (!btn) return;

    btn.textContent = enabled ? "🔊" : "🔇";
    btn.classList.toggle("off", !enabled);
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

    // Preload (tells browser to buffer the files)
    ["diceRoll", "diceHit", "tokenMove", "tokenKill", "finishSound", "enterSound"]
        .forEach(id => {
            const s = document.getElementById(id);
            if (s) s.load();
        });
};

// ================= GLOBAL EXPORTS =================
window.selectMode  = selectMode;
window.startGame   = startGame;
window.rollDice    = rollDice;
window.restartGame = restartGame;
window.toggleSound = toggleSound;