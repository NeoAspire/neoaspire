// ROAD.JS

import {
    gameState
} from "./gameState.js";

import {
    worldSpeed
} from "./speed.js";


/* =========================
   ELEMENT
========================= */

const roadLines =
    document.querySelector(".road-lines");

    const gameArea =
    document.querySelector(".game-area");

/* =========================
   ROAD OFFSET
========================= */

let roadOffset = 0;

/* =========================
   ROAD LOOP
========================= */

function updateRoad(){

    requestAnimationFrame(updateRoad);

    if(!gameState.running) return;

    /* =========================
       MOVE ROAD
    ========================= */

    roadOffset += worldSpeed * 4.5;

    /* LOOP */

    if(roadOffset > 160){

        roadOffset = 0;
    }

    roadLines.style.transform =

        `translateX(-50%) translateY(${roadOffset}px)`;

    /* =========================
       HIGH SPEED EFFECT
    ========================= */

if(worldSpeed > 10){

    roadLines.classList.add("high-speed");

    gameArea.classList.add("speed-shake");
}

else{

    roadLines.classList.remove("high-speed");

    gameArea.classList.remove("speed-shake");
}
}

/* START */

updateRoad();