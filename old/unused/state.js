// Centralized game state - This might conflict if script.js also declares gameState
const gameState = { // Removed export
    players: [],
    currentPlayerIndex: 0,
    targetScore: 5,
    availableCards: [],
    currentlyDisplayedPrompts: [],
    chosenPromptForRound: null,
    selectedWinnerIndexForRound: null,
    recentAlignments: [],
    currentRolledAlignment: null,
    timerInterval: null,
    timerTotalSeconds: 90,
    selectedAvatars: {},
    currentTutorialStep: 0,
    flickerInterval: null,
};

// --- State Utility Functions ---
// These functions might need to be moved into script.js if they weren't originally here

// Helper: Calculate total tokens for a player
function getPlayerTokenTotal(player) { // Removed export
    if (!player || !player.tokens) return 0;
    // Reverted to simple sum, assuming script.js uses the old token keys
    return Object.values(player.tokens).reduce((sum, count) => sum + count, 0);
}

// Helper: Deduct a specific number of tokens from a player
function deductTokens(player, count) { // Removed export
    if (!player || !player.tokens) return false;
    let totalTokens = getPlayerTokenTotal(player);
    if (totalTokens < count) {
        return false;
    }
    let tokensToDeduct = count;
    // Reverted to specific order based on original keys expected by script.js
    const spendOrder = ['mindReader', 'technicalMerit', 'plotTwist', 'perfectAlignment'];

    for (const type of spendOrder) {
        if (tokensToDeduct === 0) break;
        const available = player.tokens[type] || 0;
        const deductAmount = Math.min(tokensToDeduct, available);
        if (deductAmount > 0) {
            player.tokens[type] -= deductAmount;
            tokensToDeduct -= deductAmount;
        }
    }
    return tokensToDeduct === 0;
}

// Helper: Shuffle an array in place
function shuffleArray(array) { // Removed export
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Reset specific parts of the state for a new game
function resetGameStateForNewGame() { // Removed export
    // Assumes gameState is the global object from script.js or this file
    gameState.players = [];
    gameState.currentPlayerIndex = 0;
    gameState.targetScore = 5;
    gameState.availableCards = [];
    gameState.currentlyDisplayedPrompts = [];
    gameState.chosenPromptForRound = null;
    gameState.selectedWinnerIndexForRound = null;
    gameState.recentAlignments = [];
    gameState.currentRolledAlignment = null;
    gameState.selectedAvatars = {};
}

// Reset state specific to the start of a new round
function resetRoundState() { // Removed export
    // Assumes gameState is the global object from script.js or this file
    gameState.chosenPromptForRound = null;
    gameState.selectedWinnerIndexForRound = null;
    gameState.currentRolledAlignment = null;
    if (gameState.flickerInterval) {
        clearInterval(gameState.flickerInterval);
        gameState.flickerInterval = null;
    }
}
