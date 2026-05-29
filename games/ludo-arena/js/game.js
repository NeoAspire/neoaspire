// ================= GAME.JS =================
// All game 
// , logic, and turn management

import { path, homePath, homePositions, startIndex, homeEntryIndex, safeZones } from "./data.js";
import {
    drawTokens, updateStatus, showGameMessage,
    addPlayerNames, initBoard, addCenter, isInFinalCell
} from "./ui.js";
import { playSound } from "./audioEngine.js";

// ================= SHARED STATE =================
// Single source of truth — import `state` anywhere you need it
export const state = {
    tokens: [],
    players: [],
    currentPlayerIndex: 0,
    currentDice: 0,
    selectedToken: null,
    gameOver: false,
    finishedPlayers: [],
    winnerRanks: [],
    isRolling: false
};

// ================= SELECT MODE =================
export function selectMode(mode) {

    let gameMode = document.getElementById("gameMode");

    if (!gameMode) {
        gameMode = document.createElement("select");
        gameMode.id = "gameMode";
        gameMode.style.display = "none";
        for (let i = 1; i <= 4; i++) {
            let opt = document.createElement("option");
            opt.value = i;
            opt.text = i;
            gameMode.appendChild(opt);
        }
        document.body.appendChild(gameMode);
    }

    gameMode.value = String(mode);

    for (let i = 1; i <= 4; i++) {
        let input = document.getElementById("p" + i);
        if (!input) {
            input = document.createElement("input");
            input.id = "p" + i;
            input.value = "Player " + i;
            input.style.display = "none";
            document.body.appendChild(input);
        }
    }

    startGame();
}

// ================= START GAME =================
export function startGame() {
    const mode = parseInt(document.getElementById("gameMode").value);

    // Reset state
    Object.assign(state, {
        tokens: [],
        players: [],
        currentPlayerIndex: 0,
        currentDice: 0,
        selectedToken: null,
        gameOver: false,
        finishedPlayers: [],
        winnerRanks: [],
        isRolling: false
    });

    const p = i => document.getElementById("p" + i)?.value || "Player " + i;

    if (mode === 1) {
        state.players = [
            { name: p(1), isComputer: false, color: "blue" },
            { name: "Computer", isComputer: true, color: "green" }
        ];
    } else if (mode === 2) {
        state.players = [
            { name: p(1), isComputer: false, color: "blue" },
            { name: p(2), isComputer: false, color: "green" }
        ];
    } else if (mode === 3) {
        state.players = [
            { name: p(1), isComputer: false, color: "blue" },
            { name: p(2), isComputer: false, color: "green" },
            { name: p(3), isComputer: false, color: "yellow" }
        ];
    } else {
        state.players = [
            { name: p(1), isComputer: false, color: "blue" },
            { name: p(2), isComputer: false, color: "red" },
            { name: p(3), isComputer: false, color: "green" },
            { name: p(4), isComputer: false, color: "yellow" }
        ];
    }

    // Create 4 tokens per player
    state.players.forEach(pl => {
        for (let i = 0; i < 4; i++) {
            state.tokens.push({
                color: pl.color,
                position: -1,
                homeIndex: i,
                steps: 0,
                inHomePath: false,
                homeStep: 0,
                finished: false
            });
        }
    });

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";

    requestAnimationFrame(() => {
        initBoard();
        addCenter();
        addPlayerNames();

        requestAnimationFrame(() => {
            drawTokens();
            updateStatus();

            if (state.players[state.currentPlayerIndex].isComputer) {
                setTimeout(rollDice, 1400);
            }
        });
    });
}

// ================= DICE =================
export function rollDice() {

    if (state.gameOver) return;
    if (state.isRolling) return;
    if (state.currentDice !== 0) return;

    state.isRolling = true;

    const dice = document.getElementById("dice");
    const cube = document.getElementById("diceCube");

    dice.style.pointerEvents = "none";

    state.currentDice = Math.floor(Math.random() * 6) + 1;

    const finalRotation = {
        1: "rotateX(0deg) rotateY(0deg)",
        2: "rotateX(-90deg) rotateY(0deg)",
        3: "rotateY(90deg)",
        4: "rotateY(-90deg)",
        5: "rotateX(90deg)",
        6: "rotateX(180deg)"
    };

    const randomX = 360 + Math.floor(Math.random() * 180);
    const randomY = 360 + Math.floor(Math.random() * 180);

    // ✅ iOS FIX: sound outside rAF
playSound("diceRoll");

requestAnimationFrame(() => {
    cube.style.transition = "transform 0.45s linear";
    cube.style.transform =
        `rotateX(${randomX}deg) rotateY(${randomY}deg)`;
});

setTimeout(() => {
    cube.style.transition = "transform 0.35s linear";
    cube.style.transform = finalRotation[state.currentDice];

    // ✅ already outside rAF, just clean up the manual DOM code
      playSound("diceHit");
 }, 450);

    updateStatus();

    setTimeout(() => {
        state.isRolling = false;
        handleDiceLogic();
    }, 850);
}

// ================= DICE LOGIC =================
export function handleDiceLogic() {

    const { players, currentPlayerIndex, tokens, currentDice } = state;
    const player = players[currentPlayerIndex];

    const playerTokens = tokens
        .map((t, i) => ({ t, i }))
        .filter(obj => obj.t.color === player.color && !obj.t.finished);

    const movableTokens = playerTokens.filter(obj => {
        const t = obj.t;
        if (t.position === -1) return currentDice === 6;
        if (t.inHomePath && t.homeStep === homePath[t.color].length - 1) return false;
        if (t.inHomePath) {
            const remaining = (homePath[t.color].length - 1) - t.homeStep;
            return currentDice <= remaining;
        }
        return true;
    });

    // No valid moves
    if (movableTokens.length === 0) {
        updateStatus();
        state.currentDice = 0;
        setTimeout(nextTurn, 1000);
        return;
    }

    // 🤖 Smart Computer
    if (player.isComputer) {

        setTimeout(() => {

            let bestChoice = movableTokens[0];
            let bestScore = -999;

            movableTokens.forEach(obj => {

                const token = obj.t;

                let score = 0;

                // ================= SIMULATE MOVE =================
                let futurePosition = token.position;
                let futureHomeStep = token.homeStep;
                let futureInHome = token.inHomePath;
                let futureSteps = token.steps;

                if (token.position === -1 && currentDice === 6) {

                    futurePosition = startIndex[token.color];
                    futureSteps = 1;

                } else {

                    for (let i = 0; i < currentDice; i++) {

                        // normal path
                        if (!futureInHome) {

                            const entry = homeEntryIndex[token.color];

                            // enter home path
                            if (
                                futurePosition === entry &&
                                futureSteps >= path.length
                            ) {

                                futureInHome = true;
                                futurePosition = -2;
                                futureHomeStep = 0;

                            } else {

                                futurePosition =
                                    (futurePosition + 1) % path.length;

                                futureSteps++;
                            }

                        } else {

                            // home path movement
                            if (
                                futureHomeStep <
                                homePath[token.color].length - 1
                            ) {
                                futureHomeStep++;
                            }
                        }
                    }
                }
                // ================= PRIORITIES =================

                // 🏁 Finish token immediately
                if (
                    futureInHome &&
                    futureHomeStep === homePath[token.color].length - 1
                ) {
                    score += 1000;
                }

                // 🛣 Enter home path
                if (
                    !token.inHomePath &&
                    futureInHome
                ) {
                    score += 250;
                }

                // 🚀 Strongly prefer advanced tokens
                score += futureSteps * 5;

                // 🎯 Extra boost near finish
                if (futureSteps > 45) score += 180;
                else if (futureSteps > 35) score += 120;
                else if (futureSteps > 25) score += 70;

                // 💥 Kill enemy
                state.tokens.forEach(enemy => {

                    if (enemy.color === token.color) return;
                    if (enemy.position === -1) return;
                    if (enemy.inHomePath) return;

                    if (
                        !futureInHome &&
                        futurePosition === enemy.position
                    ) {
                        score += 350;

                        // kill advanced enemy = huge reward
                        score += enemy.steps * 3;
                    }
                });

                // 🛡 Safe zone bonus
                if (!futureInHome && isSafeCell(futurePosition)) {
                    score += 80;
                }

                // 🧱 Stack with own token
                const friendlyStack = state.tokens.some(t =>
                    t !== token &&
                    t.color === token.color &&
                    !t.inHomePath &&
                    t.position === futurePosition
                );

                if (friendlyStack) {
                    score += 90;
                }

                // ⚠ Danger detection
                let danger = 0;

                state.tokens.forEach(enemy => {

                    if (enemy.color === token.color) return;
                    if (enemy.position === -1) return;
                    if (enemy.inHomePath) return;

                    const dist =
                        (futurePosition - enemy.position + path.length) % path.length;

                    // enemy can kill next turn
                    if (dist > 0 && dist <= 6) {

                        danger += 1;

                        // advanced token more valuable
                        if (token.steps > 35) {
                            score -= 120;
                        } else {
                            score -= 60;
                        }
                    }
                });

                // 🚫 avoid risky overcrowding
                const sameCellCount = state.tokens.filter(t =>
                    t.color === token.color &&
                    t.position === futurePosition
                ).length;

                if (sameCellCount >= 2) {
                    score -= 40;
                }

                // 🎲 Prefer leaving home early game
                const activeTokens = state.tokens.filter(t =>
                    t.color === token.color &&
                    t.position !== -1
                ).length;

                if (
                    token.position === -1 &&
                    currentDice === 6
                ) {

                    if (activeTokens < 2) {
                        score += 180;
                    } else {
                        score += 70;
                    }
                }
                // Save best
                if (score > bestScore) {
                    bestScore = score;
                    bestChoice = obj;
                }
            });

            state.selectedToken = bestChoice.i;

            moveSelectedToken();

        }, 1200);

        return;
    }

    // 👤 Human — only one option → auto move
    if (movableTokens.length === 1) {
        setTimeout(() => {
            state.selectedToken = movableTokens[0].i;
            moveSelectedToken();
        }, 400);
        return;
    }

    // Multiple options → wait for click
    updateStatus();
}

// ================= TOKEN CLICK (called from ui.js) =================
export function handleTokenClick(token, index) {

    if (state.players[state.currentPlayerIndex].isComputer) return;
    if (isInFinalCell(token)) return;

    if (state.currentDice === 0) {
        showGameMessage("🎲 Roll dice first!", "warning");
        return;
    }

    if (token.position === -1 && state.currentDice !== 6) return;

    if (token.inHomePath) {
        const maxStep = homePath[token.color].length - 1;
        const remaining = maxStep - token.homeStep;
        if (state.currentDice > remaining) {
            showGameMessage("❌ Invalid move!", "warning");
            return;
        }
    }

    state.selectedToken = index;

    document.querySelectorAll(".token").forEach(el => el.classList.remove("selected"));
    // highlight selected
    drawTokens();

    moveSelectedToken();
}

// ================= MOVE SELECTED TOKEN =================
export function moveSelectedToken() {

    if (state.gameOver) return;
    if (state.selectedToken === null || state.currentDice === 0) return;

    const token = state.tokens[state.selectedToken];

    if (!token || token.color !== state.players[state.currentPlayerIndex].color) {
        state.selectedToken = null;
        state.currentDice = 0;
        return;
    }

    const color = token.color;
    const diceValue = state.currentDice;
    state.currentDice = 0;

    let earnedExtraTurn = false;

    // Out of home
    if (token.position === -1) {
        if (diceValue === 6) {
            token.position = startIndex[color];
            token.steps = 1;
            token.inHomePath = false;
            token.homeStep = 0;

            playSound("enterSound");
            drawTokens();

            earnedExtraTurn = true;
            updateStatus();

            if (state.players[state.currentPlayerIndex].isComputer) {
                setTimeout(rollDice, 1600);
            }
        }
        return;
    }

    // Move along path
    animateMove(token, diceValue, () => {

        const oldPositions = state.tokens.map(t => ({ token: t, pos: t.position }));

        checkForKill(token);

        const killed = oldPositions.some(obj =>
            obj.token !== token &&
            obj.pos !== -1 &&
            obj.token.position === -1
        );

        if (killed) earnedExtraTurn = true;
        if (isTokenFinished(token)) earnedExtraTurn = true;
        if (diceValue === 6) earnedExtraTurn = true;

        drawTokens();

        if (isPlayerFinished(token.color)) {
            declareWinner(token.color);
        }

        // Don't give extra turn if player already finished
        if (
            earnedExtraTurn &&
            !state.finishedPlayers.includes(token.color)
        ) {
            updateStatus();

            if (state.players[state.currentPlayerIndex].isComputer) {
                setTimeout(rollDice, 800);
            }
            return;
        }
        // ✅ if player already finished,
       
        if (!state.finishedPlayers.includes(token.color)) {
            setTimeout(nextTurn, 900);
        }
        state.isRolling = false;
    });
}

// ================= ANIMATE MOVE =================
function animateMove(token, steps, callback) {

    if (token.inHomePath) {
        const remaining = (homePath[token.color].length - 1) - token.homeStep;
        if (steps > remaining) { callback(); return; }
    }

    let stepCount = 0;

    function stepMove() {
        if (stepCount >= steps) { callback(); return; }

        playSound("tokenMove");
       // playFastSound("tokenMove");

        if (!token.inHomePath) {
            const nextPos = (token.position + 1) % path.length;
            const entry = homeEntryIndex[token.color];

            if (token.position === entry) {
                token.inHomePath = true;
                token.homeStep = 0;
                token.position = -2;
            } else {
                token.position = nextPos;
            }
        } else {
            if (token.homeStep < homePath[token.color].length - 1) {
                token.homeStep++;
                if (token.homeStep === homePath[token.color].length - 1) {
                    token.finished = true;
                    playSound("finishSound");
                    showGameMessage("🏁 Token Finished!", "success");
                }
            }
        }

        stepCount++;
        drawTokens();
        setTimeout(stepMove, 320);
    }

    stepMove();
}

// ================= KILL CHECK =================
function checkForKill(movedToken) {
    if (movedToken.inHomePath) return;
    if (isSafeCell(movedToken.position)) return;

    state.tokens.forEach(token => {
        if (token === movedToken) return;
        if (token.color === movedToken.color) return;
        if (token.position === -1) return;
        if (token.inHomePath) return;
        if (isSafeCell(token.position)) return;

        if (token.position === movedToken.position) {
            playSound("tokenKill");
            showGameMessage("💥 Token Killed!", "danger");
            token.position = -1;
            token.inHomePath = false;
            token.homeStep = 0;
        }
    });
}

// ================= HELPERS =================
function isSafeCell(positionIndex) {
    if (positionIndex < 0) return false;
    const pos = path[positionIndex];
    return safeZones.some(safe => safe.r === pos.r && safe.c === pos.c);
}

function isTokenFinished(token) {
    return token.inHomePath &&
        token.homeStep === homePath[token.color].length - 1;
}

function isPlayerFinished(color) {
    return state.tokens
        .filter(t => t.color === color)
        .every(t => isTokenFinished(t));
}

function declareWinner(color) {

    const player = state.players.find(p => p.color === color);

    // already finished
    if (state.finishedPlayers.includes(color)) return;

    // add to finished list
    state.finishedPlayers.push(color);

    // add rank
    state.winnerRanks.push(player.name);

    const rank = state.winnerRanks.length;

    let rankText = "";

    if (rank === 1) rankText = "🥇 1st Place";
    else if (rank === 2) rankText = "🥈 2nd Place";
    else if (rank === 3) rankText = "🥉 3rd Place";
    else rankText = `🏅 ${rank}th Place`;

    // 🎉 celebration
    launchConfetti();

    showGameMessage(
        `🎉 ${player.name} got ${rankText}!`,
        "success",
        4000
    );

    // remaining active players
    const remaining = state.players.filter(
        p => !state.finishedPlayers.includes(p.color)
    );

    // ================= GAME OVER =================
    // End ONLY when 1 player left
    if (remaining.length === 1) {

        state.gameOver = true;

        // last player automatically gets final rank
        state.winnerRanks.push(remaining[0].name);

        setTimeout(() => {

            launchConfetti();

            const results = state.winnerRanks
                .map((name, i) => {

                    let medal = "";

                    if (i === 0) medal = "🥇";
                    else if (i === 1) medal = "🥈";
                    else if (i === 2) medal = "🥉";
                    else medal = "🏅";

                    return `${medal} ${i + 1}. ${name}`;
                })
                .join("\n");

            showGameMessage(
                `🏆 GAME OVER\n${results}`,
                "success",
                0
            );

        }, 1200);

        return;
    }

    // ================= IMPORTANT FIX =================
    // If current player just finished,
    // immediately move to next valid player
    if (state.players[state.currentPlayerIndex].color === color) {

        setTimeout(() => {
            nextTurn();
        }, 1000);
    }
}

function launchConfetti() {

    for (let i = 0; i < 25; i++) {

        const cracker = document.createElement("div");

        cracker.className = "confetti";

        cracker.style.left = Math.random() * window.innerWidth + "px";

        cracker.style.background =
            ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"][
            Math.floor(Math.random() * 4)
            ];

        cracker.style.animationDuration =
            (2 + Math.random() * 2) + "s";

        document.body.appendChild(cracker);

        setTimeout(() => cracker.remove(), 4000);
    }
}

// ================= NEXT TURN =================
export function nextTurn() {
    if (state.gameOver) return;

    state.selectedToken = null;
    state.currentDice = 0;
    state.isRolling = false;

    document.getElementById("dice").style.pointerEvents = "auto";
    document.querySelectorAll(".token").forEach(el => el.classList.remove("selected"));

    let attempts = 0;
    do {
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        attempts++;
        if (attempts > state.players.length) break;
    } while (state.finishedPlayers.includes(state.players[state.currentPlayerIndex].color));

    drawTokens();
    updateStatus();

    if (state.players[state.currentPlayerIndex].isComputer) {
        setTimeout(rollDice, 1600);
    }
}
