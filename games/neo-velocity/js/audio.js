// AUDIO.JS — Web Audio API for reliable iPhone sound

/* =========================
   AUDIO CONTEXT
========================= */

const AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx = null;

// All loaded buffers
const buffers = {};

// All active source nodes
const activeSources = {};

// Gain nodes for volume control
const gainNodes = {};

/* =========================
   SOUND FILES
========================= */
const soundFiles = {
    idleEngine:   "./assets/sounds/idleEngine.mp3",
    racingEngine: "./assets/sounds/racingEngine.mp3",
    policeSiren:        "./assets/sounds/policeSiren.mp3",
    crash:        "./assets/sounds/crash.mp3",
    click:        "./assets/sounds/click.mp3"
};

/* =========================
   INIT — call on first gesture
========================= */

export async function initAudio() {

    if (ctx) return; // already init

    ctx = new AudioContext();

    // Resume if suspended (iOS)
    if (ctx.state === "suspended") {
        await ctx.resume();
    }

    // Load all sounds in parallel
    await Promise.all(
        Object.entries(soundFiles).map(async ([id, url]) => {

            try {
                const res    = await fetch(url);
                const arr    = await res.arrayBuffer();
                buffers[id]  = await ctx.decodeAudioData(arr);
            } catch(e) {
                console.warn("Failed to load sound:", id, e);
            }
        })
    );
}

/* =========================
   PLAY SOUND
========================= */

export function playSound(id, loop = false, volume = 1) {

    if (!ctx || !buffers[id]) return null;

    // Stop existing if any
    stopSound(id);

    const source = ctx.createBufferSource();
    source.buffer = buffers[id];
    source.loop   = loop;

    const gain   = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(ctx.destination);

    source.start(0);

    activeSources[id] = source;
    gainNodes[id]     = gain;

    return { source, gain };
}

/* =========================
   STOP SOUND
========================= */

export function stopSound(id) {

    if (activeSources[id]) {
        try {
            activeSources[id].stop();
        } catch(e) {}
        activeSources[id] = null;
    }
}

/* =========================
   SET VOLUME (0 to 1)
========================= */

export function setVolume(id, vol) {

    if (!gainNodes[id]) return;

    // Clamp 0-1
    const clamped = Math.min(1, Math.max(0, vol));

    gainNodes[id].gain.setTargetAtTime(
        clamped,
        ctx.currentTime,
        0.05  // smooth ramp
    );
}

/* =========================
   SET PLAYBACK RATE (pitch)
========================= */

export function setRate(id, rate) {

    if (!activeSources[id]) return;

    activeSources[id].playbackRate.setTargetAtTime(
        rate,
        ctx.currentTime,
        0.05
    );
}

/* =========================
   IS PLAYING
========================= */

export function isPlaying(id) {
    return !!activeSources[id];
}