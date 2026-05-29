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

// ================= PLAY SOUND SYSTEM =================
const audioPools = {};
const SINGLE_INSTANCE_SOUNDS = ["diceRoll", "diceHit"];

export function playSound(id) {

    if (!soundEnabled) return;

    const original = document.getElementById(id);

    if (!original) return;

    // dice sounds should NEVER overlap
  if (SINGLE_INSTANCE_SOUNDS.includes(id)){

        original.pause();
        original.currentTime = 0;

        original.play().catch(() => {});

        return;
    }

    // pooled sounds for token movement etc
    if (!audioPools[id]) {

        audioPools[id] = [];

        for (let i = 0; i < 5; i++) {

            const clone = original.cloneNode();

            clone.preload = "auto";

            audioPools[id].push(clone);
        }
    }

    const sound =
        audioPools[id].find(a => a.paused || a.ended);

    if (!sound) return;

    sound.currentTime = 0;

    sound.play().catch(() => {});
}

export function stopSound(id) {

    const original = document.getElementById(id);

    if (original) {

        original.pause();
        original.currentTime = 0;
    }

    if (audioPools[id]) {

        audioPools[id].forEach(sound => {

            sound.pause();
            sound.currentTime = 0;
        });
    }
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
