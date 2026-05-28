// ================= INIT =================

window.onload = () => {
    initBoard();
    addCenter();
    setupInputHandler();

    // ✅ preload sounds
    ["diceRoll", "diceHit", "tokenMove", "tokenKill", "finishSound", "enterSound"]
        .forEach(id => {
            const s = document.getElementById(id);

            if (s) {
                s.load();
            }
        });
};

let selectedToken = null;
let currentDice = 0;
let gameOver = false;
let finishedPlayers = [];
let isRolling = false;

// ================= SOUND SYSTEM =================
let soundEnabled = true;

// ✅ Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;

    const btn = document.getElementById("soundBtn");

    if (soundEnabled) {
        btn.textContent = "🔊 ";
        btn.classList.remove("off");
    } else {
        btn.textContent = "🔇";
        btn.classList.add("off");
    }
}

// ✅ Play sound by ID with safety checks
/*
function playSound(id, duration = null) {
    if (!soundEnabled) return;

    const sound = document.getElementById(id);
    if (sound) {
        sound.pause();          // stop previous
        sound.currentTime = 0;  // restart
        sound.play().catch(() => { });

        // ⏱️ Stop sound early
        if (duration !== null) {
            setTimeout(() => {
                sound.pause();
                sound.currentTime = 0;
            }, duration);
        }
    }
}
*/
function playSound(id, duration = null) {

    if (!soundEnabled) return;

    const sound = document.getElementById(id);

    if (!sound) return;

    // ✅ iPhone-safe playback
    try {

        sound.currentTime = 0;

        const playPromise = sound.play();

        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }

        // ⏱️ optional stop
        if (duration !== null) {

            setTimeout(() => {

                sound.pause();
                sound.currentTime = 0;

            }, duration);
        }

    } catch (e) {
        console.log(e);
    }
}

// ================= GAME MESSAGE =================
function showGameMessage(text, type = "warning") {
    const msg = document.getElementById("gameMessage");

    // 🎯 Get current player color
    let playerColor = players[currentPlayerIndex]?.color || "red";

    msg.innerText = text;

    // ✅ Apply dynamic color + type
    msg.className = `game-message show ${playerColor} ${type}`;

    setTimeout(() => {
        msg.classList.remove("show");
    }, 1500);
}

// ================= GAME DATA =================

// Main path (52 cells)
const path = [

    // 🔴 RED START (row 6, col 1 → right)
    { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },

    // 🔴 RED → 🔼 UP
    { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },

    // 🔴➡️🟢 TURN (Top corner)
    { r: 0, c: 7 }, { r: 0, c: 8 },

    // 🟢 GREEN START ENTRY (THIS is your green startIndex = 13)
    { r: 1, c: 8 },  // ✅ GREEN should enter here
    { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },

    // 🟢 GREEN → RIGHT
    { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },

    // 🟢➡️🟡 TURN (Right corner)
    { r: 7, c: 14 }, { r: 8, c: 14 },

    // 🟡 YELLOW START ENTRY
    { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },

    // 🟡 YELLOW → DOWN
    { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },

    // 🟡➡️🔵 TURN (Bottom corner)
    { r: 14, c: 7 }, { r: 14, c: 6 },

    // 🔵 BLUE START ENTRY
    { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },

    // 🔵 BLUE → LEFT
    { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },

    // 🔵➡️🔴 TURN (Back to red)
    { r: 7, c: 0 }, { r: 6, c: 0 }
];

// Start positions for each color
const startIndex = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39
};

const homeEntryIndex = {
    red: 50,
    green: 11,
    yellow: 24,
    blue: 37
};

// ✅ SAFE ZONES (no kill allowed)
const safeZones = [
    { r: 6, c: 1 },   // Red start
    { r: 1, c: 8 },   // Green start
    { r: 8, c: 13 },  // Yellow start
    { r: 13, c: 6 },   // Blue start

    // ⭐ PATH SAFE ZONES
    { r: 8, c: 2 },
    { r: 2, c: 6 },
    { r: 6, c: 12 },
    { r: 12, c: 8 }
];

// Home paths (6 cells each)
const homePath = {
    blue: [
        { r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 },
        { r: 10, c: 7 }, { r: 9, c: 7 }, { r: 8, c: 7 }
    ],
    red: [
        { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 },
        { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }
    ],
    green: [
        { r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 },
        { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 6, c: 7 }
    ],
    yellow: [
        { r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 },
        { r: 7, c: 10 }, { r: 7, c: 9 }, { r: 7, c: 8 }
    ]
};

// Final cells (where tokens must reach to win)
const finalCells = [
    { r: 8, c: 7 },
    { r: 7, c: 6 },
    { r: 6, c: 7 },
    { r: 7, c: 8 }
];

const dicePositionMap = {
    red: "dice-red",       // 🔴 top-left
    green: "dice-green",   // 🟢 top-right
    yellow: "dice-yellow", // 🟡 bottom-right
    blue: "dice-blue"      // 🔵 bottom-left
};

// Tokens (4 per player for now)
let tokens = [];
let players = [];
let currentPlayerIndex = 0;

// ================= HOME PLACEHOLDERS =================
function createHomeContainer(board, color) {

    const home = document.createElement("div");

    home.className = `home-container ${color}-home-container`;

    home.innerHTML = `
        <div class="home-inner ${color}-inner">

            <!-- placeholders -->
            <div class="placeholder-layer">
                <div class="token-slot"></div>
                <div class="token-slot"></div>
                <div class="token-slot"></div>
                <div class="token-slot"></div>
            </div>

            <!-- tokens -->
            <div class="token-layer"></div>

        </div>
    `;

    board.appendChild(home);
}

// ================= 
// BOARD 
// =================
function initBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";

    createHomeContainer(board, "red");
createHomeContainer(board, "green");
createHomeContainer(board, "blue");
createHomeContainer(board, "yellow");

    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {

          //  let cell = document.createElement("div");
       //     cell.classList.add("cell");

let cell = document.createElement("div");
cell.classList.add("cell");

// ✅ UNIQUE CELL ID
cell.id = `cell-${row}-${col}`;

            // HOMES
            if (row < 6 && col < 6) {
                cell.classList.add("red-home");

                // 🔴 Only 4 corner squares
                if (
                    (row === 0 && col === 0) ||
                    (row === 0 && col === 1) ||
                    (row === 0 && col === 2) ||
                    (row === 0 && col === 3) ||
                    (row === 0 && col === 4) ||
                    (row === 0 && col === 5) ||
                    (row === 5 && col === 0) ||
                    (row === 5 && col === 1) ||
                    (row === 5 && col === 2) ||
                    (row === 5 && col === 3) ||
                    (row === 5 && col === 4) ||
                    (row === 5 && col === 5) ||
                    (row === 1 && col === 0) ||
                    (row === 2 && col === 0) ||
                    (row === 3 && col === 0) ||
                    (row === 4 && col === 0) ||
                    (row === 1 && col === 5) ||
                    (row === 2 && col === 5) ||
                    (row === 3 && col === 5) ||
                    (row === 4 && col === 5)

                ) {
                    cell.classList.add("red-corner");
                }
            }

            else if (row < 6 && col > 8) {
                cell.classList.add("green-home");

                if (
                    (row === 0 && col === 9) ||
                    (row === 0 && col === 10) ||
                    (row === 0 && col === 11) ||
                    (row === 0 && col === 12) ||
                    (row === 0 && col === 13) ||
                    (row === 0 && col === 14) ||
                    (row === 5 && col === 9) ||
                    (row === 5 && col === 10) ||
                    (row === 5 && col === 11) ||
                    (row === 5 && col === 12) ||
                    (row === 5 && col === 13) ||
                    (row === 5 && col === 14) ||
                    (row === 1 && col === 9) ||
                    (row === 2 && col === 9) ||
                    (row === 3 && col === 9) ||
                    (row === 4 && col === 9) ||
                    (row === 1 && col === 14) ||
                    (row === 2 && col === 14) ||
                    (row === 3 && col === 14) ||
                    (row === 4 && col === 14)
                ) {
                    cell.classList.add("green-corner");
                }
            }

            else if (row > 8 && col < 6) {
                cell.classList.add("blue-home");

                if (
                    (row === 9 && col === 0) ||
                    (row === 9 && col === 1) ||
                    (row === 9 && col === 2) ||
                    (row === 9 && col === 3) ||
                    (row === 9 && col === 4) ||
                    (row === 9 && col === 5) ||
                    (row === 14 && col === 0) ||
                    (row === 14 && col === 1) ||
                    (row === 14 && col === 2) ||
                    (row === 14 && col === 3) ||
                    (row === 14 && col === 4) ||
                    (row === 14 && col === 5) ||
                    (row === 10 && col === 0) ||
                    (row === 11 && col === 0) ||
                    (row === 12 && col === 0) ||
                    (row === 13 && col === 0) ||
                    (row === 10 && col === 5) ||
                    (row === 11 && col === 5) ||
                    (row === 12 && col === 5) ||
                    (row === 13 && col === 5)
                ) {
                    cell.classList.add("blue-corner");
                }
            }

            else if (row > 8 && col > 8) {
                cell.classList.add("yellow-home");

                if (
                    (row === 9 && col === 9) ||
                    (row === 9 && col === 10) ||
                    (row === 9 && col === 11) ||
                    (row === 9 && col === 12) ||
                    (row === 9 && col === 13) ||
                    (row === 9 && col === 14) ||
                    (row === 14 && col === 9) ||
                    (row === 14 && col === 10) ||
                    (row === 14 && col === 11) ||
                    (row === 14 && col === 12) ||
                    (row === 14 && col === 13) ||
                    (row === 14 && col === 14) ||
                    (row === 10 && col === 9) ||
                    (row === 11 && col === 9) ||
                    (row === 12 && col === 9) ||
                    (row === 13 && col === 9) ||
                    (row === 10 && col === 14) ||
                    (row === 11 && col === 14) ||
                    (row === 12 && col === 14) ||
                    (row === 13 && col === 14)
                ) {
                    cell.classList.add("yellow-corner");
                }
            }

            // PATH
            else if ((col >= 6 && col <= 8) || (row >= 6 && row <= 8)) {
                cell.classList.add("path");

                // 🟩 GREEN (row 2 → 6, col 7)
                if (
                    (col === 7 && row >= 1 && row <= 5) ||
                    (row === 1 && col === 8) // Extra cell for green corner
                ) {
                    cell.classList.add("green-path");
                }

                // 🟨 YELLOW (right side)
                if (
                    (row === 7 && col > 8 && col <= 13) ||
                    (col === 13 && row === 8) // Extra cell for yellow corner
                ) {
                    cell.classList.add("yellow-path");
                }

                // 🟦 BLUE (bottom)
                if (
                    (col === 7 && row > 8 && row <= 13) ||
                    (row === 13 && col === 6) // Extra cell for blue corner
                ) {
                    cell.classList.add("blue-path");
                }

                // 🟥 RED (left)
                if (
                    (row === 7 && col < 6 && col >= 1) ||
                    (col === 1 && row === 6) // Extra cell for red corner
                ) {
                    cell.classList.add("red-path");
                }
            }
            // ⭐ SAFE ZONE DESIGN (ADD HERE)
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

// ============ PLAYER NAMES ============
function addPlayerNames() {
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

    if (players.some(p => p.color === "red")) {
        createPlayerLabel("red", "red-label");
    }

    if (players.some(p => p.color === "green")) {
        createPlayerLabel("green", "green-label");
    }

    if (players.some(p => p.color === "blue")) {
        createPlayerLabel("blue", "blue-label");
    }

    if (players.some(p => p.color === "yellow")) {
        createPlayerLabel("yellow", "yellow-label");
    }
}

// ================= 
// CENTER 
// =================
function addCenter() {
    const board = document.getElementById("board");

    // CENTER TRIANGLE
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

// ================= INPUT HANDLER =================
function setupInputHandler() {
    const gameMode = document.getElementById("gameMode");
    if (!gameMode) return; // ✅ prevent crash

    const inputs = [
        document.getElementById("p1"),
        document.getElementById("p2"),
        document.getElementById("p3"),
        document.getElementById("p4")
    ];

    function updateInputs() {
        const count = parseInt(gameMode.value);

        inputs.forEach(input => input.style.display = "none");

        if (count === 1) {
            inputs[0].style.display = "block";
        } else {
            for (let i = 0; i < count; i++) {
                inputs[i].style.display = "block";
            }
        }
    }

    gameMode.addEventListener("change", updateInputs);
    updateInputs();
}

// =================
// GAME LOGIC
// =================
const homePositions = {
    red: [
        { r: 1, c: 1 },
        { r: 1, c: 4 },
        { r: 4, c: 1 },
        { r: 4, c: 4 }
    ],
    green: [
        { r: 1, c: 10 },
        { r: 1, c: 13 },
        { r: 4, c: 10 },
        { r: 4, c: 13 }
    ],
    blue: [
        { r: 10, c: 1 },
        { r: 10, c: 4 },
        { r: 13, c: 1 },
        { r: 13, c: 4 }
    ],
    yellow: [
        { r: 10, c: 10 },
        { r: 10, c: 13 },
        { r: 13, c: 10 },
        { r: 13, c: 13 }
    ]
};

// ================= MODE SELECTION (FOR TESTING) =================
function selectMode(mode) {

    let gameMode = document.getElementById("gameMode");

    if (!gameMode) {
        gameMode = document.createElement("select");
        gameMode.id = "gameMode";
        gameMode.style.display = "none";

        // ✅ ADD OPTIONS (FIX)
        for (let i = 1; i <= 4; i++) {
            let opt = document.createElement("option");
            opt.value = i;
            opt.text = i;
            gameMode.appendChild(opt);
        }

        document.body.appendChild(gameMode);
    }

    // ✅ Now this will work correctly
    gameMode.value = String(mode);

    // Create player inputs
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
function startGame() {
    const mode = parseInt(document.getElementById("gameMode").value);

    players = [];
    tokens = [];

    // ✅ FORCE COLORS
    if (mode === 1) {
        let name = document.getElementById("p1").value || "Player 1";

        players = [
            { name: name, isComputer: false, color: "blue" },   // 🔵 Player
            { name: "Computer ", isComputer: true, color: "green" } // 🟢 Computer
        ];
    } else if (mode === 2) {
        let p1 = document.getElementById("p1").value || "Player 1";
        let p2 = document.getElementById("p2").value || "Player 2";

        players = [
            { name: p1, isComputer: false, color: "blue" },  // 🔵 Player 1
            { name: p2, isComputer: false, color: "green" }  // 🟢 Player 2
        ];
    } else if (mode === 3) {

        let p1 = document.getElementById("p1").value || "Player 1";
        let p2 = document.getElementById("p2").value || "Player 2";
        let p3 = document.getElementById("p3").value || "Player 3";

        players = [
            { name: p1, isComputer: false, color: "blue" },
            { name: p2, isComputer: false, color: "green" },
            { name: p3, isComputer: false, color: "yellow" }
        ];

    } else {
        // 4 players
        let p1 = document.getElementById("p1").value || "Player 1";
        let p2 = document.getElementById("p2").value || "Player 2";
        let p3 = document.getElementById("p3").value || "Player 3";
        let p4 = document.getElementById("p4").value || "Player 4";

        players = [
            { name: p1, isComputer: false, color: "blue" },
            { name: p2, isComputer: false, color: "red" },
            { name: p3, isComputer: false, color: "green" },
            { name: p4, isComputer: false, color: "yellow" }
        ];
    }


    // ✅ Create tokens
    players.forEach(p => {
        for (let i = 0; i < 4; i++) {
            tokens.push({
                color: p.color,
                position: -1,
                homeIndex: i,
                steps: 0,
                inHomePath: false,
                homeStep: 0,
                finished: false
            });
        }
    });

    currentPlayerIndex = 0;

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";

    initBoard();
    addCenter();
    addPlayerNames();
    drawTokens();
    updateStatus();


    // 🤖 If computer starts
    if (players[currentPlayerIndex].isComputer) {
        setTimeout(rollDice, 1000);
    }
}

// ================= UTILS =================
function getPlayerNameByColor(color) {
    let p = players.find(pl => pl.color === color);
    return p ? p.name : "";
}

// ================= DRAW TOKENS =================
function drawTokens() {

    // 🧹 Remove old tokens
    document.querySelectorAll(".token").forEach(t => t.remove());

    // 🧠 Group tokens by cell
    let cellMap = {};

    tokens.forEach((token, index) => {

        let pos;

        if (token.position === -1) {
            pos = homePositions[token.color][token.homeIndex];
        } else if (token.position === -2) {

            // ✅ SAFETY CHECK
            if (
                token.homeStep === undefined ||
                token.homeStep < 0 ||
                token.homeStep >= homePath[token.color].length
            ) {
                console.error("Invalid homeStep:", token);
                return; // skip this token safely
            }

            pos = homePath[token.color][token.homeStep];
        } else {
            if (path[token.position]) {
                pos = path[token.position];
            } else {
                console.log("Invalid position fixed:", token.position);
                token.position = startIndex[token.color];
                pos = path[token.position];
            }
        }

        if (!pos) {
            console.error("Invalid position detected:", token);
            return;
        }
        let key = pos.r + "-" + pos.c;

        if (!cellMap[key]) cellMap[key] = [];
        cellMap[key].push({ token, index, pos });
    });

    // 🎯 Draw tokens with offset
    Object.values(cellMap).forEach(group => {

        group.forEach((obj, i) => {

            let { token, index, pos } = obj;

         //   let cellIndex = pos.r * 15 + pos.c;
         //   let cell = document.getElementById("board").children[cellIndex];

            let cell = document.getElementById(`cell-${pos.r}-${pos.c}`);

            let t = document.createElement("div");
            t.classList.add("token", token.color);

            // 🔥 Remove old position classes 
            t.classList.remove("pos-0", "pos-1", "pos-2", "pos-3", "center-pos");

             // ✅ Positioning
            if (group.length === 1) {
                // ✅ Only one token → center it
                t.classList.add("center-pos");
            } else {
                // ✅ Multiple tokens → spread them
                t.classList.add(`pos-${i}`);
            }

                  // 🎯 Offset logic

            let count = group.length;

            // =============================
            // 🚫 FINAL CELL CHECK
            // =============================
            let isFinal = isInFinalCell(token);

            if (isFinal) {
                t.style.opacity = "0.6";     // faded look
                t.style.cursor = "default";  // not clickable
            }

            // ================= CLICK LOGIC =================
const isMyTurn = token.color === players[currentPlayerIndex].color;

if (!players[currentPlayerIndex].isComputer && isMyTurn) {

    t.style.cursor = "pointer";

    t.onclick = () => {

        if (players[currentPlayerIndex].isComputer) return;
        if (isInFinalCell(token)) return;

        if (currentDice === 0) {
            showGameMessage("🎲 Roll dice first!", "warning");
            return;
        }

        let clickedToken = tokens[index];

        if (clickedToken.position === -1 && currentDice !== 6) return;

        if (clickedToken.inHomePath) {
            let maxStep = homePath[clickedToken.color].length - 1;
            let remaining = maxStep - clickedToken.homeStep;

            if (currentDice > remaining) {
                showGameMessage("❌ Invalid move!", "warning");
                return;
            }
        }

        selectedToken = index;

        document.querySelectorAll(".token").forEach(el => el.classList.remove("selected"));
        t.classList.add("selected");

        moveSelectedToken();
    };

} else {
    // 🚫 disable other players tokens
    t.style.pointerEvents = "none";
    t.style.cursor = "default";
}
           
// ================= HOME TOKENS =================
if (token.position === -1) {

    // find correct home container
    const homeContainer = document.querySelector(`.${token.color}-home-container`);

    if (homeContainer) {

        const tokenLayer = homeContainer.querySelector(".token-layer");

        // position inside placeholder
        t.classList.add(`home-token-${token.homeIndex}`);

        tokenLayer.appendChild(t);
    }

} else {

    // ================= BOARD TOKENS =================
    const tokenLayer = cell.querySelector(".token-layer");

    if (tokenLayer) {
        tokenLayer.appendChild(t);
    } else {
        cell.appendChild(t);
    }
}
        });
    });
}

// ================= CHECK FINAL CELL =================
function isInFinalCell(token) {
    if (!token.inHomePath) return false;

    let finalIndex = homePath[token.color].length - 1;
    return token.homeStep === finalIndex;
}

//================= CHECK SAFE CELL =================
function isSafeCell(positionIndex) {
    if (positionIndex < 0) return false;

    let pos = path[positionIndex];

    return safeZones.some(
        safe => safe.r === pos.r && safe.c === pos.c
    );
}

// ================= CHECK FOR KILL =================
function checkForKill(movedToken) {

    // ❌ Don't kill inside home path
    if (movedToken.inHomePath) return;

    // ✅ SAFE ZONE CHECK
    if (isSafeCell(movedToken.position)) return;

    tokens.forEach(token => {

        // Skip self
        if (token === movedToken) return;
        // Skip same color
        if (token.color === movedToken.color) return;
        // Skip tokens in home
        if (token.position === -1) return;
        // Skip tokens already in home path
        if (token.inHomePath) return;

        // ❌ Don't kill if OTHER token is also on safe zone
        if (isSafeCell(token.position)) return;

        // ✅ Same board position
        if (token.position === movedToken.position) {

            // 🔊 PLAY KILL SOUND
            playSound("tokenKill");

            showGameMessage("💥 Token Killed!", "danger");

            // 🔥 Send killed token back home
            token.position = -1;
            token.inHomePath = false;
            token.homeStep = 0;

            console.log(token.color + " token killed!");
        }
    });
}

// ================= CHECK FINISH =================
function isTokenFinished(token) {
    return token.inHomePath &&
        token.homeStep === homePath[token.color].length - 1;
}

function isPlayerFinished(color) {
    let playerTokens = tokens.filter(t => t.color === color);
    return playerTokens.every(t => isTokenFinished(t));
}

// ================= DECLARE WINNER =================
function declareWinner(color) {

    let player = players.find(p => p.color === color);

    // ✅ Add to finished list
    if (!finishedPlayers.includes(color)) {
        finishedPlayers.push(color);
    }

    // 🎉 Show ranking (not game over)
    showGameMessage("🏆 " + player.name + " finished!");

    // ✅ Check if only 1 player left
    let remainingPlayers = players.filter(p => !finishedPlayers.includes(p.color));

    if (remainingPlayers.length === 1) {
        gameOver = true;

        setTimeout(() => {
            showGameMessage("🎯 Game Over!\nLast player: " + remainingPlayers[0].name);
        }, 200);
    }
}

// ================= ANIMATE MOVE =================
function animateMove(token, steps, callback) {

     // 🛑 BLOCK overshoot in home path (strict rule)
    if (token.inHomePath) {
        let maxStep = homePath[token.color].length - 1;
        let remaining = maxStep - token.homeStep;

        if (steps > remaining) {
            callback(); // ❌ no movement
            return;
        }
    }

    let stepCount = 0;

    function stepMove() {

        if (stepCount >= steps) {
            callback(); // done moving
            return;
        }

        // 🔊 PLAY MOVE SOUND (each step)
        playSound("tokenMove"); // 150ms short tick

        // 🚶 NORMAL PATH
        if (!token.inHomePath) {

            let nextPos = (token.position + 1) % path.length;

            let entry = homeEntryIndex[token.color];

            // 🎯 Enter home path
            if (token.position === entry) {
                token.inHomePath = true;
                token.homeStep = 0;
                token.position = -2;
            } else {
                token.position = nextPos;
            }
        }

        // 🏠 HOME PATH
        else {
            if (token.homeStep < homePath[token.color].length - 1) {
                token.homeStep++;

                // 🎉 TOKEN JUST REACHED FINAL CELL
                if (token.homeStep === homePath[token.color].length - 1) {
                    token.finished = true;

                    playSound("finishSound"); // 🔥 PLAY FINISH SOUND
                    showGameMessage("🏁 Token Finished!", "success"); // optional UI
                }
            }
        }

        stepCount++;
        drawTokens(); // redraw each step

        setTimeout(stepMove, 250); // ⏱️ speed (adjust: 150 fast / 300 slow)
    }

    stepMove();
}


// ================= MOVE SELECTED TOKEN =================
function moveSelectedToken() {

    if (gameOver) return;
    if (selectedToken === null || currentDice === 0) return;

    let token = tokens[selectedToken];

    if (!token || token.color !== players[currentPlayerIndex].color) {
        selectedToken = null;
        currentDice = 0;
        return;
    }

    let color = token.color;

    // ✅ save dice value
    let diceValue = currentDice;
    currentDice = 0;

    // ✅ NEW: extra turn tracker
    let earnedExtraTurn = false;

    // 🏠 OUT OF HOME
    if (token.position === -1) {

        if (diceValue === 6) {

            token.position = startIndex[color];
            token.steps = 1;
            token.inHomePath = false;
            token.homeStep = 0;

            playSound("enterSound");

            drawTokens();

            // ✅ rolling 6 gives extra turn
            earnedExtraTurn = true;

            updateStatus("(Extra Turn - Roll Again)");

            if (players[currentPlayerIndex].isComputer) {
                setTimeout(rollDice, 800);
            }

            return;
        }

        return;
    }

    // 🚶 MOVE
    animateMove(token, diceValue, () => {

        // =============================
        // 💥 CHECK KILL
        // =============================
        let oldPositions = tokens.map(t => ({
            token: t,
            pos: t.position
        }));

        checkForKill(token);

        // ✅ detect if someone got killed
        let killed = oldPositions.some(obj =>
            obj.token !== token &&
            obj.pos !== -1 &&
            obj.token.position === -1
        );

        if (killed) {
            earnedExtraTurn = true;
          //  showGameMessage("🔥 Extra Turn for Kill!", "success");
        }

        drawTokens();

        // =============================
        // 🏁 TOKEN FINISHED
        // =============================
        if (isTokenFinished(token)) {
            earnedExtraTurn = true;
            showGameMessage("🏁 Extra Turn for Finish!", "success");
        }

        // =============================
        // 🏆 PLAYER FINISHED
        // =============================
        if (isPlayerFinished(token.color)) {
            declareWinner(token.color);
        }

        // =============================
        // 🎲 ROLLING 6
        // =============================
        if (diceValue === 6) {
            earnedExtraTurn = true;
        }

        // =============================
        // 🔁 HANDLE EXTRA TURN
        // =============================
        if (earnedExtraTurn) {

            updateStatus("(Extra Turn - Roll Again)");

            if (players[currentPlayerIndex].isComputer) {
                setTimeout(rollDice, 800);
            }

            return;
        }

        // =============================
        // ➡️ NORMAL NEXT TURN
        // =============================
        setTimeout(nextTurn, 500);
        isRolling = false;
    });
}

// ================= STATUS =================
function updateStatus() {

    // remove highlight
    document.querySelectorAll(".home-text").forEach(el => {
        el.classList.remove("active-player");
    });

    // clear all statuses
    ["red", "green", "blue", "yellow"].forEach(color => {
        let el = document.getElementById("status-" + color);
        if (el) el.innerText = "";
    });

    let player = players[currentPlayerIndex];
    let color = player.color;

    let statusEl = document.getElementById("status-" + color);

    if (statusEl && finishedPlayers.includes(color)) {
        statusEl.innerText = " 🏁 Finished";
        return; // 🚫 stop further execution
    }

    if (statusEl) {
        statusEl.innerText = " ";

        // highlight active player
        let parent = statusEl.closest(".home-text");
        if (parent) parent.classList.add("active-player");
    }

    updateDicePosition();
    updateTurnIndicator();
}

// ================= PLAYER TURN INDICATOR  =================
function updateTurnIndicator(extraText = "") {
    const el = document.getElementById("turnIndicator");
    const text = document.getElementById("turnText");

    if (!el || !text) return;

    let player = players[currentPlayerIndex];

    // 🎨 Remove old color classes
    el.classList.remove("red", "green", "blue", "yellow");

    // 🎨 Add current player color
    el.classList.add(player.color);

    // 🧠 Set text
    text.innerText = `${player.name}'s Turn ${extraText}`;
}

// ================= DICE POSITION =================

function updateDicePosition() {

    const dice = document.getElementById("dice");

    let color = players[currentPlayerIndex].color;

    let targetBox;

    if (color === "red") {
        targetBox = document.querySelector(".top-left");
    }

    if (color === "green") {
        targetBox = document.querySelector(".top-right");
    }

    if (color === "blue") {
        targetBox = document.querySelector(".bottom-left");
    }

    if (color === "yellow") {
        targetBox = document.querySelector(".bottom-right");
    }

    // ✅ move dice into current player box
    targetBox.appendChild(dice);

    
dice.onclick = rollDice;

dice.addEventListener("click", function (e) {

    e.stopPropagation();

    if (!isRolling) {
        rollDice();
    }

});


    // ✅ enable / disable
    if (currentDice === 0) {
        dice.style.pointerEvents = "auto";
        dice.style.opacity = "1";
    } else {
        dice.style.pointerEvents = "none";
        dice.style.opacity = "0.6";
    }
}

// ================= DICE =================
function rollDice() {

    if (gameOver) return;
    if (isRolling) return;
    if (currentDice !== 0) return;

    isRolling = true;

    const dice = document.getElementById("dice");
    const cube = document.getElementById("diceCube");

    dice.style.pointerEvents = "none";

    // 🎲 generate dice number
    currentDice = Math.floor(Math.random() * 6) + 1;

    const finalRotation = {
        1: "rotateX(0deg) rotateY(0deg)",
        2: "rotateX(-90deg) rotateY(0deg)",
        3: "rotateY(90deg)",
        4: "rotateY(-90deg)",
        5: "rotateX(90deg)",
        6: "rotateX(180deg)"
    };

    // 🎲 random spin values
    let randomX = 1440 + Math.floor(Math.random() * 720);
    let randomY = 1440 + Math.floor(Math.random() * 720);

    // ✅ force browser repaint FIRST
    cube.offsetHeight;

    // ✅ use requestAnimationFrame for smooth start
    requestAnimationFrame(() => {

        playSound("diceRoll");

        cube.style.transition = "transform 1s ease-out";

        cube.style.transform =
            `rotateX(${randomX}deg) rotateY(${randomY}deg)`;

    });

    // ⏳ settle on final face
    setTimeout(() => {

        cube.style.transition = "transform 0.35s ease-out";
        cube.style.transform = finalRotation[currentDice];

        const roll = document.getElementById("diceRoll");

        if (roll) {
            roll.pause();
            roll.currentTime = 0;
        }

        playSound("diceHit");

    }, 1000);

    updateStatus();
    updateStatus("(Rolled: " + currentDice + ")");

    setTimeout(() => {

        isRolling = false;
        handleDiceLogic();

    }, 1400);
}

// ================= DICE LOGIC =================
function handleDiceLogic() {

    let player = players[currentPlayerIndex];

    let playerTokens = tokens
        .map((t, i) => ({ t, i }))
        .filter(obj => obj.t.color === player.color && !obj.t.finished);

    let movableTokens = playerTokens.filter(obj => {

        let t = obj.t;

        if (t.position === -1) return currentDice === 6;

        if (t.inHomePath && t.homeStep === homePath[t.color].length - 1)
            return false;

        if (t.inHomePath) {
            let maxStep = homePath[t.color].length - 1;
            let remaining = maxStep - t.homeStep;

            return currentDice <= remaining; // ✅ only allow valid moves
        }

        return true;
    });

    // ❌ No move
    if (movableTokens.length === 0) {
        updateStatus("(No move)");
        currentDice = 0;
        setTimeout(nextTurn, 1000);
        return;
    }

    // 🤖 COMPUTER MOVE (ALWAYS AUTO)
    if (player.isComputer) {

        setTimeout(() => {

            // 🎯 If only one → choose it
            if (movableTokens.length === 1) {
                selectedToken = movableTokens[0].i;
            }
            else {
                // 🎲 Multiple → random choice
                let choice = movableTokens[Math.floor(Math.random() * movableTokens.length)];
                selectedToken = choice.i;
            }

            moveSelectedToken();

        }, 600);

        return;
    }

    // 👤 HUMAN PLAYER LOGIC

    // ❌ No move → auto next player
    if (movableTokens.length === 0) {
        updateStatus("(No move possible)");
        currentDice = 0;
        setTimeout(nextTurn, 1000);
        return;
    }

    // ✅ Only ONE token → auto move (like Ludo King)
    if (movableTokens.length === 1) {
        setTimeout(() => {
            selectedToken = movableTokens[0].i;
            moveSelectedToken();
        }, 400);
        return;
    }

    // ✅ MULTIPLE OPTIONS → WAIT FOR PLAYER CLICK
    updateStatus();
    updateStatus("(Select a token)");


}

// ================= NEXT TURN =================
function nextTurn() {

    if (gameOver) return;

    // reset
    selectedToken = null;
    currentDice = 0;
    isRolling = false;


    document.getElementById("dice").style.pointerEvents = "auto";
    document.querySelectorAll(".token").forEach(el => el.classList.remove("selected"));

    let attempts = 0;

    do {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        attempts++;

        // safety (avoid infinite loop)
        if (attempts > players.length) break;

    } while (finishedPlayers.includes(players[currentPlayerIndex].color));

    drawTokens();
    updateStatus();

    // 🤖 auto turn
    if (players[currentPlayerIndex].isComputer) {
        setTimeout(rollDice, 1000);
    }


}

// ================= RESTART =================
function restartGame() {
    location.reload();
}

// ================= GLOBAL =================
window.selectMode = selectMode;
window.startGame = startGame;
window.rollDice = rollDice;
window.restartGame = restartGame;
window.toggleSound = toggleSound;