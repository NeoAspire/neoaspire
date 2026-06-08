// LOADER.JS

const loadingScreen  = document.getElementById("loadingScreen");
const loadingFill    = document.getElementById("loadingFill");
const loadingPercent = document.getElementById("loadingPercent");

/* =========================
   ASSETS TO LOAD
========================= */

const IMAGES = [
    "./assets/images/cars/player/nv-player-car-sport-v1.png",
    "./assets/images/cars/enemy/nv-enemy-car-sport-v1.png",
    "./assets/images/cars/enemy/nv-enemy-car-sport-v2.png",
    "./assets/images/cars/enemy/nv-enemy-police-car-v1.png",
    "./assets/images/logo/neovelocity-logo-v1.png"
];

const SOUNDS = [
    "./assets/sounds/idleEngine.mp3",
    "./assets/sounds/racingEngine.mp3",
    "./assets/sounds/siren.mp3",
    "./assets/sounds/crash.mp3",
    "./assets/sounds/click.mp3"
];

const ALL_ASSETS = [...IMAGES, ...SOUNDS];

/* =========================
   LOAD IMAGE
========================= */

function loadImage(src) {
    return new Promise((resolve) => {
        const img   = new Image();
        img.onload  = () => resolve({ src, ok: true  });
        img.onerror = () => resolve({ src, ok: false });
        img.src     = src;
    });
}

/* =========================
   LOAD SOUND
========================= */

function loadSound(src) {
    return new Promise((resolve) => {
        const audio      = new Audio();
        audio.oncanplaythrough = () => resolve({ src, ok: true  });
        audio.onerror          = () => resolve({ src, ok: false });
        audio.src        = src;
        audio.load();

        // ✅ timeout fallback — don't block if sound takes too long
        setTimeout(() => resolve({ src, ok: false }), 5000);
    });
}

/* =========================
   UPDATE BAR
========================= */

function updateProgress(loaded, total) {
    const percent = Math.round((loaded / total) * 100);
    loadingFill.style.width    = percent + "%";
    loadingPercent.textContent = percent + "%";
}

/* =========================
   PRELOAD ALL
========================= */

export async function preloadAssets() {

    const total  = ALL_ASSETS.length;
    let   loaded = 0;

    // ✅ load all in parallel but update progress as each finishes
    const promises = ALL_ASSETS.map(src => {

        const isImage = /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(src);
        const loader  = isImage ? loadImage(src) : loadSound(src);

        return loader.then(result => {
            loaded++;
            updateProgress(loaded, total);

            if (!result.ok) {
                console.warn("Failed to load:", result.src);
            }
        });
    });

    await Promise.all(promises);

    // ✅ show 100% briefly
    await new Promise(r => setTimeout(r, 500));

    // ✅ fade out
    loadingScreen.classList.add("hidden");

    setTimeout(() => loadingScreen.remove(), 500);
}