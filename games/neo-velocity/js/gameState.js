 /* =========================
   GAME STATE.JS
========================= */

export const gameState = {

    running: false
};

/* =========================
   START GAME
========================= */

export function startGame(){

    gameState.running = true;
}

// =============================================
// COTINUOUS GAME LOGIC
// =============================================

export function resumeGame() {
    gameState.running = true;
}

/* =========================
   STOP GAME
========================= */

export function stopGame(){

    gameState.running = false;
}