// TRAFFIC.JS — with level speed boost

import { gameState }         from "./gameState.js";
import { worldSpeed }        from "./speed.js";
import { getBoost } from "./level.js";  // ✅ import boost

export const enemyCar  = document.querySelector(".enemy-car");
export const enemyCar2 = document.querySelector(".enemy-car-2");

const lanes = [2, 24, 51, 74];
let enemySpeed1 = 4 + Math.random() * 3;
let enemySpeed2 = 4 + Math.random() * 3;

export let enemyPosition  = -220;
export let enemyPosition2 = -600;

enemyCar.style.left  = lanes[Math.floor(Math.random() * lanes.length)] + "%";
enemyCar2.style.left = lanes[Math.floor(Math.random() * lanes.length)] + "%";

export function resetTrafficPositions() {

    enemyPosition  = -900;
    enemyPosition2 = -1400;

    enemyCar.style.top  = enemyPosition  + "px";
    enemyCar2.style.top = enemyPosition2 + "px";

    const lane1 = lanes[Math.floor(Math.random() * lanes.length)];
    let lane2;
    do { lane2 = lanes[Math.floor(Math.random() * lanes.length)]; }
    while (lane2 === lane1);

    enemyCar.style.left  = lane1 + "%";
    enemyCar2.style.left = lane2 + "%";

    enemySpeed1 = 4 + Math.random() * 3;
    enemySpeed2 = 4 + Math.random() * 3;
}

function moveEnemyCars() {

    if (!gameState.running) {
        requestAnimationFrame(moveEnemyCars);
        return;
    }

    if (!enemySpeed1) enemySpeed1 = 5;
    if (!enemySpeed2) enemySpeed2 = 5;

    const minCrawl       = 0.5;
    const effectiveSpeed = Math.max(minCrawl, worldSpeed);

    // ✅ trafficSpeedBoost added here
    const boost = getBoost() || 0;

    /* CAR 1 */
    enemyPosition  += effectiveSpeed + enemySpeed1 + boost;
    enemyCar.style.top = enemyPosition + "px";

    /* CAR 2 */
    enemyPosition2 += effectiveSpeed + enemySpeed2 + boost;
    enemyCar2.style.top = enemyPosition2 + "px";

    /* RESET CAR 1 */
    if (enemyPosition > window.innerHeight) {
        enemyPosition = -450;
        const availableLanes = lanes.filter(l => l !== parseInt(enemyCar2.style.left));
        enemyCar.style.left = availableLanes[Math.floor(Math.random() * availableLanes.length)] + "%";
    }

    /* RESET CAR 2 */
    if (enemyPosition2 > window.innerHeight) {
        enemyPosition2 = -700;
        const availableLanes2 = lanes.filter(l => l !== parseInt(enemyCar.style.left));
        enemyCar2.style.left = availableLanes2[Math.floor(Math.random() * availableLanes2.length)] + "%";
    }

    requestAnimationFrame(moveEnemyCars);
}

moveEnemyCars();