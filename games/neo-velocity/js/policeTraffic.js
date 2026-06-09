// POLICE TRAFFIC.JS

import { gameState }  from "./gameState.js";
import { worldSpeed }  from "./speed.js";
import { enemyCar, enemyCar2 } from "./traffic.js";
import { playSound, stopSound, isPlaying } from "./audio.js";
import {getBoost} from "./level.js";
/* =========================
   ELEMENTS
========================= */

const policeCar   = document.querySelector(".enemy-police");
const policeLanes = [2, 24, 51, 74];

export let policeY = -500;

policeCar.style.left =
    policeLanes[Math.floor(Math.random() * policeLanes.length)] + "%";

/* =========================
   RESET POLICE POSITION
   Called on continue
========================= */

export function resetPolicePosition() {

    policeY = -1800; // far above — won't appear immediately

    policeCar.style.top = policeY + "px";

    // Random lane
    const trafficLane1 = parseInt(enemyCar.style.left);
    const trafficLane2 = parseInt(enemyCar2.style.left);

    const allowedLanes = policeLanes.filter(lane =>
        lane !== trafficLane1 && lane !== trafficLane2
    );

    policeCar.style.left = (
        allowedLanes[Math.floor(Math.random() * allowedLanes.length)]
        || policeLanes[Math.floor(Math.random() * policeLanes.length)]
    ) + "%";

    // Stop police siren
    stopSound("policeSiren");
}

/* =========================
   MOVE POLICE CAR
========================= */
// ✅ import playerCar to read its position
const playerCar = document.querySelector(".player-car");

function movePoliceCar() {

    requestAnimationFrame(movePoliceCar);
    if (!gameState.running) return;

    const trafficCars = document.querySelectorAll(".enemy-car");
    const boost = getBoost() || 0;
   
    let policeSpeed =
    Math.max(2, worldSpeed + 3 + (boost * 0.5));

    /* SMART SLOWDOWN behind traffic */
    trafficCars.forEach((car) => {
        if (car === policeCar) return;
        const policeLane  = parseInt(policeCar.style.left);
        const trafficLane = parseInt(car.style.left);
        const trafficTop  = car.getBoundingClientRect().top;
        const policeTop   = policeCar.getBoundingClientRect().top;
        if (policeLane === trafficLane && trafficTop > policeTop && (trafficTop - policeTop) < 260) {
            policeSpeed = Math.max(1.5, worldSpeed - 0.5);
        }
    });

    policeY += policeSpeed;
    policeCar.style.top = policeY + "px";

    // ✅ Police slowly steers toward player X position
    const playerLeft  = parseFloat(playerCar.style.left) || 50;
    const policeLeft  = parseFloat(policeCar.style.left) || 50;
    const diff        = playerLeft - policeLeft;

    // Only chase when police is on screen
    if (policeY > -200 && policeY < window.innerHeight) {
  // =========================
// SMART CHASE WITHOUT OVERLAP
// =========================

let canMove = true;

trafficCars.forEach((car) => {

    if (car === policeCar) return;

    const trafficLeft = parseFloat(car.style.left);
    const trafficTop  = car.getBoundingClientRect().top;
    const policeTop   = policeCar.getBoundingClientRect().top;

    // block steering into nearby traffic
    if (
        Math.abs(trafficLeft - policeLeft) < 12 &&
        Math.abs(trafficTop - policeTop) < 180
    ) {
        canMove = false;
    }
});

if (canMove) {

    const newLeft = policeLeft + diff * 0.02;

    // road boundaries
    const clampedLeft =
        Math.max(2, Math.min(74, newLeft));

    policeCar.style.left =
        clampedLeft + "%";
}
    }

    /* SIREN */
    const policeVisible = policeY > -200 && policeY < window.innerHeight;
    if (policeVisible) {
        if (!isPlaying("policeSiren")) playSound("policeSiren", true, 0.8);
    } else {
        stopSound("policeSiren");
    }

    /* RESET */
    if (policeY > window.innerHeight) {
        policeY = -900;

        const trafficLane1 = parseInt(enemyCar.style.left);
        const trafficLane2 = parseInt(enemyCar2.style.left);
        const allowedLanes = policeLanes.filter(lane =>
            lane !== trafficLane1 && lane !== trafficLane2
        );
        policeCar.style.left = (
            allowedLanes[Math.floor(Math.random() * allowedLanes.length)]
            || policeLanes[Math.floor(Math.random() * policeLanes.length)]
        ) + "%";
    }
}


movePoliceCar();