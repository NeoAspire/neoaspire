// ================= DATA.JS =================
// All static game data — no logic, no DOM

// Main path (52 cells)
export const path = [

    // 🔴 RED START (row 6, col 1 → right)
    { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },

    // 🔴 RED → 🔼 UP
    { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },

    // 🔴➡️🟢 TURN (Top corner)
    { r: 0, c: 7 }, { r: 0, c: 8 },

    // 🟢 GREEN START ENTRY
    { r: 1, c: 8 },
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
export const startIndex = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39
};

export const homeEntryIndex = {
    red: 50,
    green: 11,
    yellow: 24,
    blue: 37
};

// ✅ SAFE ZONES (no kill allowed)
export const safeZones = [
    { r: 6, c: 1 },   // Red start
    { r: 1, c: 8 },   // Green start
    { r: 8, c: 13 },  // Yellow start
    { r: 13, c: 6 },  // Blue start

    // ⭐ Path safe zones
    { r: 8, c: 2 },
    { r: 2, c: 6 },
    { r: 6, c: 12 },
    { r: 12, c: 8 }
];

// Home paths (6 cells each)
export const homePath = {
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

// Final cells (center — where tokens must reach to win)
export const finalCells = [
    { r: 8, c: 7 },
    { r: 7, c: 6 },
    { r: 6, c: 7 },
    { r: 7, c: 8 }
];

// Home spawn positions (4 slots per color)
export const homePositions = {
    red: [
        { r: 1, c: 1 }, { r: 1, c: 4 },
        { r: 4, c: 1 }, { r: 4, c: 4 }
    ],
    green: [
        { r: 1, c: 10 }, { r: 1, c: 13 },
        { r: 4, c: 10 }, { r: 4, c: 13 }
    ],
    blue: [
        { r: 10, c: 1 }, { r: 10, c: 4 },
        { r: 13, c: 1 }, { r: 13, c: 4 }
    ],
    yellow: [
        { r: 10, c: 10 }, { r: 10, c: 13 },
        { r: 13, c: 10 }, { r: 13, c: 13 }
    ]
};

export const dicePositionMap = {
    red: "dice-red",
    green: "dice-green",
    yellow: "dice-yellow",
    blue: "dice-blue"
};
