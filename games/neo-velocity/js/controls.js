// CONTROLS.JS
import { gameState } from "./gameState.js";

/* =========================
   PLAYER CAR
========================= */
const playerCar = document.querySelector(".player-car");

/* =========================
   LANES SYSTEM
========================= */
let playerX = 50;
let speedX = 0;

/* =========================
   KEY STATES
========================= */
const keys = {
    left: false,
    right: false
};

/* =========================
   KEYBOARD CONTROLS
========================= */
document.addEventListener("keydown", (event) => {

    if (event.key === "ArrowLeft") {
        keys.left = true;
        event.preventDefault();
    }

    if (event.key === "ArrowRight") {
        keys.right = true;
        event.preventDefault();
    }
});

document.addEventListener("keyup", (event) => {

    if (event.key === "ArrowLeft") {
        keys.left = false;
    }

    if (event.key === "ArrowRight") {
        keys.right = false;
    }
});

/* =========================
   MOBILE TOUCH CONTROLS
========================= */
document.addEventListener("touchmove", (event) => {
    if (!gameState.running) return;

    event.preventDefault();

    const touch = event.touches[0];
    const screenWidth = window.innerWidth;

    const movePercent = (touch.clientX / screenWidth) * 100;

    playerX = movePercent;
    speedX = 0;
}, { passive: false });

/* RESET ROTATION */
document.addEventListener("touchend", () => {
    playerCar.style.transform = "translateX(-50%) rotate(0deg)";
});

/* =========================
   GAME LOOP
========================= */
function updateControls() {
    requestAnimationFrame(updateControls);

    if (!gameState.running) return;

    // steering
    if (keys.left) speedX -= 0.6;
    if (keys.right) speedX += 0.6;

    // movement
    playerX += speedX;

    // friction
    speedX *= 0.85;

    // boundaries
    if (playerX < 5) playerX = 5;
    if (playerX > 95) playerX = 95;

    // rotation effect
    if (speedX < -0.5) {
        playerCar.style.transform = "translateX(-50%) rotate(-10deg)";
    } else if (speedX > 0.5) {
        playerCar.style.transform = "translateX(-50%) rotate(10deg)";
    } else {
        playerCar.style.transform = "translateX(-50%) rotate(0deg)";
    }

    playerCar.style.left = playerX + "%";
}

/* START LOOP */
updateControls();