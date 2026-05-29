// ================= MAIN.JS =================
// Entry point — wires everything together
// Sound system + global exports for HTML onclick attributes

import { initBoard, addCenter, setupInputHandler } from "./ui.js";
import { selectMode, startGame, rollDice, nextTurn } from "./game.js";

// ================= SOUND SYSTEM =================
let soundEnabled = true;

// ── iOS AudioContext unlock ──────────────────────────────────────────────────
// iOS Safari suspends AudioContext until a real user gesture.
// We create one shared context and resume it on first touch/click.
// HTMLAudioElement.play() is still used (simpler), but we piggyback
// on the same unlock event so the browser considers audio "allowed".
let audioUnlocked = false;

function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    // Play + immediately pause every audio element to "prime" it on iOS.
    // This must happen synchronously inside the user-gesture handler.
    ["diceRoll", "diceHit", "tokenMove", "tokenKill", "finishSound", "enterSound"]
        .forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.muted = true;
            const p = el.play();
            if (p !== undefined) {
                p.then(() => {
                    el.pause();
                    el.currentTime = 0;
                    el.muted = false;
                }).catch(() => {
                    el.muted = false;
                });
            }
        });
}

// Fire on first tap anywhere (covers both button taps and dice taps)
document.addEventListener("touchstart", unlockAudio, { once: true });
document.addEventListener("mousedown",  unlockAudio, { once: true });

// ── Audio pools ──────────────────────────────────────────────────────────────
// diceRoll / diceHit  → single instance (never overlap)
// everything else     → pool of 4 clones so rapid moves don't cut each other
const SINGLE_SOUNDS = new Set(["diceRoll", "diceHit"]);
const audioPools    = {};

export function playSound(id) {
    if (!soundEnabled) return;

    const original = document.getElementById(id);
    if (!original) return;

    // ── Single-instance sounds ───────────────────────────────────────────────
    if (SINGLE_SOUNDS.has(id)) {
        // Reset fully before playing — avoids iOS "already playing" stall
        original.pause();
        original.currentTime = 0;

        // Fire and forget — NEVER await or chain game logic on this promise
        const p = original.play();
        if (p !== undefined) p.catch(() => {});
        return;
    }

    // ── Pooled sounds (tokenMove, tokenKill, etc.) ───────────────────────────
    if (!audioPools[id]) {
        audioPools[id] = Array.from({ length: 4 }, () => {
            const clone = original.cloneNode();   // cloneNode keeps src + preload
            clone.preload = "auto";
            return clone;
        });
    }

    // Find a free slot (paused or ended)
    const slot = audioPools[id].find(a => a.paused || a.ended);
    if (!slot) return;   // all busy → skip (sound, not gameplay)

    slot.currentTime = 0;
    const p = slot.play();
    if (p !== undefined) p.catch(() => {});
}

export function stopSound(id) {
    const original = document.getElementById(id);
    if (original) { original.pause(); original.currentTime = 0; }

    if (audioPools[id]) {
        audioPools[id].forEach(s => { s.pause(); s.currentTime = 0; });
    }
}

// ================= SOUND TOGGLE =================
export function toggleSound() {
    soundEnabled = !soundEnabled;

    const btn = document.getElementById("soundBtn");
    if (!btn) return;

    btn.textContent = soundEnabled ? "🔊" : "🔇";
    btn.classList.toggle("off", !soundEnabled);
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