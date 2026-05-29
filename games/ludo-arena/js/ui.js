// ================= UI.JS =================
// All DOM rendering, board drawing, and display logic

import { path, homePath, homePositions, safeZones } from "./data.js";
import { state } from "./game.js";
import { playSound } from "./main.js";

// ================= BOARD =================
export function initBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";

    createHomeContainer(board, "red");
    createHomeContainer(board, "green");
    createHomeContainer(board, "blue");
    createHomeContainer(board, "yellow");

    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {

            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `cell-${row}-${col}`;

            // ── HOME QUADRANTS ──────────────────────────────────────────
            if (row < 6 && col < 6) {
                cell.classList.add("red-home");
                if (isBorderCell(row, col, 0, 5, 0, 5)) cell.classList.add("red-corner");

            } else if (row < 6 && col > 8) {
                cell.classList.add("green-home");
                if (isBorderCell(row, col, 0, 5, 9, 14)) cell.classList.add("green-corner");

            } else if (row > 8 && col < 6) {
                cell.classList.add("blue-home");
                if (isBorderCell(row, col, 9, 14, 0, 5)) cell.classList.add("blue-corner");

            } else if (row > 8 && col > 8) {
                cell.classList.add("yellow-home");
                if (isBorderCell(row, col, 9, 14, 9, 14)) cell.classList.add("yellow-corner");

                // ── PATH ────────────────────────────────────────────────────
            } else if ((col >= 6 && col <= 8) || (row >= 6 && row <= 8)) {
                cell.classList.add("path");

                if ((col === 7 && row >= 1 && row <= 5) || (row === 1 && col === 8))
                    cell.classList.add("green-path");

                if ((row === 7 && col > 8 && col <= 13) || (col === 13 && row === 8))
                    cell.classList.add("yellow-path");

                if ((col === 7 && row > 8 && row <= 13) || (row === 13 && col === 6))
                    cell.classList.add("blue-path");

                if ((row === 7 && col < 6 && col >= 1) || (col === 1 && row === 6))
                    cell.classList.add("red-path");
            }

            // ── SAFE ZONES ──────────────────────────────────────────────
            if (
                (row === 8 && col === 2) ||
                (row === 2 && col === 6) ||
                (row === 6 && col === 12) ||
                (row === 12 && col === 8)
            ) {
                cell.classList.add("safe-zone");
            }

            board.appendChild(cell);
        }
    }
}

// Returns true if (row, col) is on the border of a home quadrant rectangle
function isBorderCell(row, col, rMin, rMax, cMin, cMax) {
    return (
        row === rMin || row === rMax ||
        col === cMin || col === cMax
    );
}

// ================= HOME CONTAINER =================
export function createHomeContainer(board, color) {
    const home = document.createElement("div");
    home.className = `home-container ${color}-home-container`;
    home.innerHTML = `
        <div class="home-inner ${color}-inner">
            <div class="placeholder-layer">
                <div class="token-slot"></div>
                <div class="token-slot"></div>
                <div class="token-slot"></div>
                <div class="token-slot"></div>
            </div>
            <div class="token-layer"></div>
        </div>
    `;
    board.appendChild(home);
}

// ================= CENTER =================
export function addCenter() {
    const board = document.getElementById("board");
    let center = document.createElement("div");
    center.classList.add("center-big");
    center.innerHTML = `
        <div class="triangle red-tri"></div>
        <div class="triangle green-tri"></div>
        <div class="triangle yellow-tri"></div>
        <div class="triangle blue-tri"></div>
    `;
    board.appendChild(center);
}

// ================= PLAYER NAMES =================
export function addPlayerNames() {
    const board = document.getElementById("board");

    document.querySelectorAll(".home-text").forEach(el => el.remove());

    function createPlayerLabel(color, className) {
        let el = document.createElement("div");
        el.classList.add("home-text", className);
        el.innerHTML = `
            <span class="player-name">${getPlayerNameByColor(color)}</span>
            <span class="player-status" id="status-${color}"></span>
        `;
        board.appendChild(el);
    }

    const { players } = state;

    if (players.some(p => p.color === "red")) createPlayerLabel("red", "red-label");
    if (players.some(p => p.color === "green")) createPlayerLabel("green", "green-label");
    if (players.some(p => p.color === "blue")) createPlayerLabel("blue", "blue-label");
    if (players.some(p => p.color === "yellow")) createPlayerLabel("yellow", "yellow-label");
}

// ================= DRAW TOKENS =================
export function drawTokens() {

    document.querySelectorAll(".token").forEach(t => t.remove());

    const { tokens, players, currentPlayerIndex } = state;

    // Group tokens by cell
    let cellMap = {};

    tokens.forEach((token, index) => {

        let pos;

        if (token.position === -1) {
            pos = homePositions[token.color][token.homeIndex];
        } else if (token.position === -2) {
            if (
                token.homeStep === undefined ||
                token.homeStep < 0 ||
                token.homeStep >= homePath[token.color].length
            ) {
                console.error("Invalid homeStep:", token);
                return;
            }
            pos = homePath[token.color][token.homeStep];
        } else {
            if (path[token.position]) {
                pos = path[token.position];
            } else {
                console.warn("Invalid position fixed:", token.position);
                token.position = 0;
                pos = path[0];
            }
        }

        if (!pos) { console.error("No pos for token:", token); return; }

        let key = `${pos.r}-${pos.c}`;
        if (!cellMap[key]) cellMap[key] = [];
        cellMap[key].push({ token, index, pos });
    });

    // Draw each group
    Object.values(cellMap).forEach(group => {

        group.forEach((obj, i) => {

            const { token, index, pos } = obj;
            const cell = document.getElementById(`cell-${pos.r}-${pos.c}`);

            let t = document.createElement("div");
            t.classList.add("token", token.color);
            t.classList.remove("pos-0", "pos-1", "pos-2", "pos-3", "center-pos");

            if (group.length === 1) {
                t.classList.add("center-pos");
            } else {
                t.classList.add(`pos-${i}`);
            }

            // Faded if finished
            if (isInFinalCell(token)) {
                t.style.opacity = "1";
                t.style.cursor = "default";
            }

            // Click handler (human players only)
            const isMyTurn = token.color === players[currentPlayerIndex].color;

            if (!players[currentPlayerIndex].isComputer && isMyTurn) {
                t.style.cursor = "pointer";
                t.onclick = () => onTokenClick(token, index);
            } else {
                t.style.pointerEvents = "none";
                t.style.cursor = "default";
            }

            // Append to home container or board cell
            if (token.position === -1) {
                const homeContainer = document.querySelector(`.${token.color}-home-container`);
                if (homeContainer) {
                    homeContainer.querySelector(".token-layer").appendChild(t);
                }
            } else {
                const tokenLayer = cell?.querySelector(".token-layer");
                if (tokenLayer) tokenLayer.appendChild(t);
                else cell?.appendChild(t);
            }
        });
    });
}

// Token click — delegated back to game logic
function onTokenClick(token, index) {
    // Import here to avoid circular — game.js handles click
    import("./game.js").then(({ handleTokenClick }) => {
        handleTokenClick(token, index);
    });
}

// ================= STATUS =================
export function updateStatus(extraText = "") {
    const { players, currentPlayerIndex, finishedPlayers } = state;

    document.querySelectorAll(".home-text").forEach(el => el.classList.remove("active-player"));
    ["red", "green", "blue", "yellow"].forEach(color => {
        let el = document.getElementById("status-" + color);
        if (el) el.innerText = "";
    });

    const player = players[currentPlayerIndex];
    const color = player.color;
    const statusEl = document.getElementById("status-" + color);

    if (statusEl && finishedPlayers.includes(color)) {
        statusEl.innerText = " 🏁 Finished";
        return;
    }

    if (statusEl) {
        statusEl.innerText = " ";
        const parent = statusEl.closest(".home-text");
        if (parent) parent.classList.add("active-player");
    }

    updateDicePosition();
    updateTurnIndicator(extraText);
}

// ================= TURN INDICATOR =================
export function updateTurnIndicator(extraText = "") {
    const el = document.getElementById("turnIndicator");
    const text = document.getElementById("turnText");
    if (!el || !text) return;

    const { players, currentPlayerIndex } = state;
    const player = players[currentPlayerIndex];

    el.classList.remove("red", "green", "blue", "yellow");
    el.classList.add(player.color);
    text.innerText = `${player.name}'s Turn ${extraText}`;
}

// ================= DICE POSITION =================
export function updateDicePosition() {
    const dice = document.getElementById("dice");
    const { players, currentPlayerIndex, currentDice } = state;
    const color = players[currentPlayerIndex].color;

    const boxMap = {
        red: ".top-left",
        green: ".top-right",
        blue: ".bottom-left",
        yellow: ".bottom-right"
    };

    const targetBox = document.querySelector(boxMap[color]);
    if (targetBox) targetBox.appendChild(dice);

    dice.onclick = () => {
        import("./game.js").then(({ rollDice }) => rollDice());
    };

    dice.style.pointerEvents = currentDice === 0 ? "auto" : "none";
    dice.style.opacity = currentDice === 0 ? "1" : "0.8";
}

// ================= GAME MESSAGE =================
let gameMessageTimeout = null;

export function showGameMessage(text, type = "warning", duration = 1500) {

    const msg = document.getElementById("gameMessage");

    const { players, currentPlayerIndex } = state;

    const playerColor =
        players[currentPlayerIndex]?.color || "red";

    // clear previous timeout
    if (gameMessageTimeout) {
        clearTimeout(gameMessageTimeout);
    }

    msg.innerText = text;

    msg.className =
        `game-message show ${playerColor} ${type}`;

    // duration 0 = stay forever
    if (duration > 0) {

        gameMessageTimeout = setTimeout(() => {

            msg.classList.remove("show");

        }, duration);
    }
}

// ================= INPUT HANDLER =================
export function setupInputHandler() {
    const gameMode = document.getElementById("gameMode");
    if (!gameMode) return;

    const inputs = [1, 2, 3, 4].map(i => document.getElementById("p" + i));

    function updateInputs() {
        const count = parseInt(gameMode.value);
        inputs.forEach(input => { if (input) input.style.display = "none"; });

        if (count === 1) {
            inputs[0].style.display = "block";
        } else {
            for (let i = 0; i < count; i++) {
                if (inputs[i]) inputs[i].style.display = "block";
            }
        }
    }

    gameMode.addEventListener("change", updateInputs);
    updateInputs();
}

// ================= HELPERS =================
export function getPlayerNameByColor(color) {
    const { players } = state;
    let p = players.find(pl => pl.color === color);
    return p ? p.name : "";
}

export function isInFinalCell(token) {
    if (!token.inHomePath) return false;
    return token.homeStep === homePath[token.color].length - 1;
}
