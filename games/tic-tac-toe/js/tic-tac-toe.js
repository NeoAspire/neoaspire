// ================= DOM ELEMENTS =================
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popupMessage');
const moveSound = document.getElementById('moveSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');
const soundToggle = document.getElementById("soundToggle");
let soundEnabled = true;

// ================= GAME VARIABLES =================
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameActive = false;
let gameMode = "";
let installPrompt = null;
// ================= HELPER FUNCTION =================
function playSound(audio) {
    if (!soundEnabled) return;

    audio.currentTime = 0;
    audio.play().catch(() => {});
}
// ================= CONSTANTS =================
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// ================= DEVICE DETECTOR =================
const DeviceDetector = {
    // Detect if Android device
    isAndroid() {
        return /Android/i.test(navigator.userAgent);
    },

    // Detect if iOS device
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },

    // Detect if Safari browser
    isSafari() {
        return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    },

    // Detect if Edge browser
    isEdge() {
        return /Edg/.test(navigator.userAgent);
    },

    // Detect if Chrome browser
    isChrome() {
        return /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
    },

    // Get browser type
    getBrowser() {
        if (this.isEdge()) return 'edge';
        if (this.isChrome()) return 'chrome';
        if (this.isSafari()) return 'safari';
        if (/Firefox/.test(navigator.userAgent)) return 'firefox';
        return 'unknown';
    },
    isTablet() {
        const ua = navigator.userAgent;
        return /iPad|Android(?!.*Mobile)/.test(ua) || (navigator.maxTouchPoints > 2);
    },

    // Detect if mobile phone
    isMobilePhone() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && !this.isTablet();
    },

    // Detect if desktop
    isDesktop() {
        return !this.isMobilePhone() && !this.isTablet();
    },

    // Get device type
    getDeviceType() {
        if (this.isMobilePhone()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    },

    // Get OS type
    getOS() {
        if (this.isAndroid()) return 'android';
        if (this.isIOS()) return 'ios';
        if (/Windows/i.test(navigator.userAgent)) return 'windows';
        if (/Mac/i.test(navigator.userAgent)) return 'macos';
        if (/Linux/i.test(navigator.userAgent)) return 'linux';
        return 'unknown';
    }
};

// ================= SERVICE WORKER =================
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/games/tic-tac-toe/service-worker.js")
        .then(() => console.log("Service Worker Registered"));
}

// ================= PWA INSTALL =================
// beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
    console.log('✅ Install prompt available');
});
// appinstalled
window.addEventListener('appinstalled', () => {
    console.log('🎉 App installed successfully!');
});

// ================= GAME FUNCTIONS =================
// Functions Selection Mode
function selectMode(mode) {
    gameMode = mode;
    restartGame();
    gameActive = true;
    statusText.innerText = "Player X's Turn";
}
// Handle Cell Clicks
function handleCellClick(e) {
    const index = e.target.dataset.index;

    if (!gameActive || gameState[index] !== "") return;

    makeMove(index, currentPlayer);
    checkResult();

    if (gameMode === "PVC" && gameActive && currentPlayer === "O") {
        setTimeout(computerMove, 1000);
    }
}
// Make Move
function makeMove(index, player) {
    gameState[index] = player;
    cells[index].innerText = player;
    cells[index].classList.add("taken");

    playSound(moveSound);
}
// Computer Move Logic
function computerMove() {
    // 1️⃣ Try to WIN
    let move = findBestMove("O");
    if (move !== null) {
        makeMove(move, "O");
        checkResult();
        return;
    }

    // 2️⃣ Try to BLOCK Player X
    move = findBestMove("X");
    if (move !== null) {
        makeMove(move, "O");
        checkResult();
        return;
    }

    // 3️⃣ Take CENTER if free
    if (gameState[4] === "") {
        makeMove(4, "O");
        checkResult();
        return;
    }

    // 4️⃣ Take a CORNER
    const corners = [0, 2, 6, 8].filter(i => gameState[i] === "");
    if (corners.length > 0) {
        makeMove(corners[Math.floor(Math.random() * corners.length)], "O");
        checkResult();
        return;
    }

    // 5️⃣ Take ANY remaining spot
    const emptyCells = gameState
        .map((v, i) => v === "" ? i : null)
        .filter(v => v !== null);

    makeMove(emptyCells[0], "O");
    checkResult();
}
// Find Best Move for WIN or BLOCK
function findBestMove(player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        const line = [gameState[a], gameState[b], gameState[c]];

        if (
            line.filter(v => v === player).length === 2 &&
            line.includes("")
        ) {
            if (gameState[a] === "") return a;
            if (gameState[b] === "") return b;
            if (gameState[c] === "") return c;
        }
    }
    return null;
}

// Check Game Result
function checkResult() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;

        if (gameState[a] &&
            gameState[a] === gameState[b] &&
            gameState[a] === gameState[c]) {

            [a, b, c].forEach(i => {
                cells[i].classList.add("winner");
            });

            // 🎊 LAUNCH CONFETTI
            launchConfetti();

            playSound(winSound);

            gameActive = false;
            // Delay popup to ensure last move is rendered
            setTimeout(() => {
                showPopup(`🏆 PLAYER ${currentPlayer} WINS! 🏆`);
            }, 1000);
            return;
        }
    }

    if (!gameState.includes("")) {
        gameActive = false;
        // Delay popup to ensure last move is rendered
        setTimeout(() => {
            playSound(drawSound);
            showPopup("😐 It's a Draw!");
        }, 1000);
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.innerText = `Player ${currentPlayer}'s Turn`;
}
// Popup Functions
function showPopup(message) {
    popupMessage.innerText = message;
    popup.style.display = "flex";
}
// Close Popup
function closePopup() {
    popup.style.display = "none";
    restartGame();
}
// Restart Game
function restartGame() {
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    gameActive = false;
    statusText.innerText = "Select Game Mode";
    cells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove("taken");
        cell.classList.remove("winner");
    });
}

// ================= WINNER CONFETTI  =================
function launchConfetti() {
    const container = document.getElementById("confetti-container");

    const colors = [
        "#FFD700",
        "#FF4D4D",
        "#4CAF50",
        "#2196F3",
        "#FF9800",
        "#E91E63"
    ];

    for (let i = 0; i < 150; i++) {
        const piece = document.createElement("div");

        piece.className = "confetti";
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.width = (5 + Math.random() * 8) + "px";
        piece.style.height = (5 + Math.random() * 8) + "px";

        piece.style.animationDuration =
            (2 + Math.random() * 3) + "s";

        piece.style.transform =
            `rotate(${Math.random() * 360}deg)`;

        container.appendChild(piece);

        setTimeout(() => {
            piece.remove();
        }, 5000);
    }
}
// ================= IOS BANNER =================
function showIosBanner() {
    const iosBanner = document.getElementById('iosInstallBanner');
    if (iosBanner) {
        iosBanner.style.display = 'flex';
        console.log('📱 Showing iOS Safari install banner');
    }
}

function closeIosBanner() {
    const iosBanner = document.getElementById('iosInstallBanner');
    if (iosBanner) {
        iosBanner.style.display = 'none';
        // Store that user closed the banner (don't show again this session)
        sessionStorage.setItem('iosBannerClosed', 'true');
        console.log('iOS Safari banner closed');
    }
}

// Auto-show banner for iOS Safari on page load
if (DeviceDetector.isIOS() && DeviceDetector.isSafari() && !sessionStorage.getItem('iosBannerClosed')) {
    // Check if not already installed
    if (window.navigator.standalone !== true) {
        setTimeout(() => {
            showIosBanner();
        }, 500);
    }
}

// Log app installation state
if (window.navigator.standalone === true) {
    console.log('📲 App is running in standalone mode');
}

// ================= INITIALIZATION =================
// Log device info for debugging
console.log(`📱 Device: ${DeviceDetector.getDeviceType()}`);
console.log(`🖥️ OS: ${DeviceDetector.getOS()}`);
console.log(`🌐 Browser: ${DeviceDetector.getBrowser()}`);

// ================= EVENT LISTENERS =================
cells.forEach(cell => cell.addEventListener("click", handleCellClick));
document.getElementById("resetBtn").addEventListener("click", restartGame);

// ================= SOUND TOGGLE =================
soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;

    soundToggle.textContent = soundEnabled
        ? "🔊 Sound ON"
        : "🔇 Sound OFF";
});

window.selectMode = selectMode;
window.closePopup = closePopup;
window.closeIosBanner = closeIosBanner;




