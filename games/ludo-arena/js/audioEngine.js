// ================= AUDIO ENGINE =================

let soundEnabled = true;
let audioCtx;
let buffers = {};
let unlocked = false;

// ── INIT CONTEXT ───────────────────────────────
function initContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// ── UNLOCK AUDIO (iOS fix) ─────────────────────
export async function unlockAudio() {
    if (unlocked) return;
    unlocked = true;

    initContext();
    await audioCtx.resume();

    // preload fast sounds
    await Promise.all([
        load("diceRoll", "./sounds/dice-roll.mp3"),
        load("diceHit", "./sounds/dice-hit.mp3"),
        load("tokenMove", "./sounds/move.mp3")
    ]);
}

// ── LOAD BUFFER ────────────────────────────────
async function load(name, url) {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    buffers[name] = await audioCtx.decodeAudioData(arr);
}

// ── MAIN PLAY FUNCTION (HYBRID) ───────────────
export function playSound(name) {
    if (!soundEnabled) return;

    // Resume if suspended (iOS fix)
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    // ⚡ TRY Web Audio FIRST
    if (["diceRoll", "diceHit", "tokenMove"].includes(name)) {

        if (buffers[name]) {
            const src = audioCtx.createBufferSource();
            src.buffer = buffers[name];
            src.connect(audioCtx.destination);
            src.start(0);
            return;
        }

        // ❗ FALLBACK to HTML audio if buffer not ready
        console.log("Fallback to HTML for:", name);
    }

    // 🎵 HTML AUDIO (fallback or normal)
    const el = document.getElementById(name);
    if (!el) return;

    el.currentTime = 0;
    const p = el.play();
    if (p) p.catch(() => {});
}

// ── TOGGLE STATE ──────────────────────────────
export function toggleSoundState() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
}