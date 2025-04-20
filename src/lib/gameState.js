/**
 * Game State Module
 *
 * Centralized game state management for keeping track of players, scores, rounds,
 * and other core game variables. Provides methods to modify and query the game state.
 *
 * @module gameState
 */

/**
 * Core game state object containing all dynamic game information
 * @type {Object}
 */
const gameState = {
	/**
	 * Array of player objects with name, score, tokens, avatar
	 * @type {Array<Object>}
	 */
	players: [],

	/**
	 * Current index of the judge (player array index)
	 * @type {number}
	 */
	currentPlayerIndex: 0,

	/**
	 * Score needed to win the game
	 * @type {number}
	 */
	targetScore: 5,

	/**
	 * Cards available in the deck
	 * @type {Array<string>}
	 */
	availableCards: [],

	/**
	 * Currently displayed prompts for the round
	 * @type {Array<string>}
	 */
	currentlyDisplayedPrompts: [],

	/**
	 * Text of the prompt chosen for the current round
	 * @type {string|null}
	 */
	chosenPromptForRound: null,

	/**
	 * Index of the player selected as the winner for this round
	 * @type {number|null}
	 */
	selectedWinnerIndexForRound: null,

	/**
	 * Recent alignment rolls (abbreviations)
	 * @type {Array<string>}
	 */
	recentAlignments: [],

	/**
	 * Current alignment for the round
	 * @type {string|null}
	 */
	currentRolledAlignment: null,

	/**
	 * Current number of players in the game
	 * @type {number}
	 */
	currentPartySize: 3,

	/**
	 * Tracks if the game has started
	 * @type {boolean}
	 */
	gameStarted: false,

	/**
	 * Tracks the current round number
	 * @type {number}
	 */
	currentRound: 1,

	/**
	 * Selected deck keys for this game session
	 * @type {Array<string>}
	 */
	selectedDecks: ["core_white", "creative_cyan", "hypothetical_magenta"],
};

/**
 * Creates a new player object with default values
 * @param {string} name - The player's name
 * @param {string} avatar - The avatar filename
 * @returns {Object} - The new player object
 */
function createPlayer(name, avatar) {
	return {
		name: name,
		score: 0,
		tokens: {
			mindReader: 0,
			artBro: 0,
			perfectlyAligned: 0,
			psychopath: 0,
		},
		avatar: avatar,
	};
}

/**
 * Adds a player to the game
 * @param {string} name - The player's name
 * @param {string} avatar - The avatar filename
 */
function addPlayer(name, avatar) {
	gameState.players.push(createPlayer(name, avatar));
}

/**
 * Resets the player array and clears all players
 */
function clearPlayers() {
	gameState.players = [];
}

/**
 * Updates the target score needed to win the game
 * @param {number} score - The new target score
 */
function setTargetScore(score) {
	gameState.targetScore = score;
}

/**
 * Updates the party size (number of players)
 * @param {number} count - The new party size
 */
function setPartySize(count) {
	gameState.currentPartySize = count;
}

/**
 * Advances to the next judge (player)
 */
function advanceToNextJudge() {
	gameState.currentPlayerIndex =
		(gameState.currentPlayerIndex + 1) % gameState.players.length;
	gameState.currentRound++;
}

/**
 * Gets the current judge player object
 * @returns {Object} - The current judge
 */
function getCurrentJudge() {
	return gameState.players[gameState.currentPlayerIndex];
}

/**
 * Gets all non-judge players (contestants)
 * @returns {Array<Object>} - Array of player objects who are not the judge
 */
function getContestants() {
	return gameState.players.filter(
		(_, index) => index !== gameState.currentPlayerIndex
	);
}

/**
 * Sets the prompts displayed for this round
 * @param {Array<string>} prompts - The prompts to display
 */
function setDisplayedPrompts(prompts) {
	gameState.currentlyDisplayedPrompts = prompts;
}

/**
 * Sets the chosen prompt for this round
 * @param {string} prompt - The chosen prompt text
 */
function setChosenPrompt(prompt) {
	gameState.chosenPromptForRound = prompt;
}

/**
 * Sets the current alignment for the round
 * @param {string} alignment - The alignment code (e.g., "LG", "CE")
 */
function setCurrentAlignment(alignment) {
	gameState.currentRolledAlignment = alignment;
	// Keep track of recent alignments for preventing repeats
	gameState.recentAlignments.push(alignment);
	if (gameState.recentAlignments.length > 3) {
		gameState.recentAlignments.shift();
	}
}

/**
 * Sets the winner for the current round
 * @param {number} playerIndex - Index of the winning player
 */
function setRoundWinner(playerIndex) {
	gameState.selectedWinnerIndexForRound = playerIndex;
}

/**
 * Awards a point to a player
 * @param {number} playerIndex - Index of the player to award point to
 */
function awardPoint(playerIndex) {
	gameState.players[playerIndex].score++;
}

/**
 * Checks if any player has reached the target score
 * @returns {Object|null} - The winning player object or null if no winner yet
 */
function checkForWinner() {
	return (
		gameState.players.find((player) => player.score >= gameState.targetScore) ||
		null
	);
}

/**
 * Awards a token to a player
 * @param {number} playerIndex - Index of the player to award token to
 * @param {string} tokenType - Type of token to award (e.g., "mindReader")
 */
function awardToken(playerIndex, tokenType) {
	if (
		gameState.players[playerIndex] &&
		gameState.players[playerIndex].tokens.hasOwnProperty(tokenType)
	) {
		gameState.players[playerIndex].tokens[tokenType]++;
	}
}

/**
 * Deducts tokens from a player
 * @param {number} playerIndex - Index of the player to deduct tokens from
 * @param {string} tokenType - Type of token to deduct (or "any" for any token)
 * @param {number} count - Number of tokens to deduct
 * @returns {boolean} - True if successful, false if not enough tokens
 */
function deductTokens(playerIndex, tokenType, count) {
	const player = gameState.players[playerIndex];
	if (!player) return false;

	if (tokenType === "any") {
		// Count total tokens
		const totalTokens = Object.values(player.tokens).reduce(
			(sum, val) => sum + val,
			0
		);
		if (totalTokens < count) return false;

		// Deduct from various token types
		let remaining = count;
		for (const type in player.tokens) {
			if (remaining <= 0) break;

			const deduct = Math.min(player.tokens[type], remaining);
			player.tokens[type] -= deduct;
			remaining -= deduct;
		}

		return true;
	} else if (player.tokens.hasOwnProperty(tokenType)) {
		if (player.tokens[tokenType] < count) return false;
		player.tokens[tokenType] -= count;
		return true;
	}

	return false;
}

/**
 * Gets the total number of tokens a player has
 * @param {number} playerIndex - Index of the player
 * @returns {number} - Total token count
 */
function getPlayerTokenTotal(playerIndex) {
	const player = gameState.players[playerIndex];
	if (!player) return 0;

	return Object.values(player.tokens).reduce((sum, val) => sum + val, 0);
}

/**
 * Steals a point from one player and gives it to another
 * @param {number} stealerIndex - Index of the player stealing the point
 * @param {number} targetIndex - Index of the player losing the point
 * @returns {boolean} - True if steal was successful
 */
function stealPoint(stealerIndex, targetIndex) {
	const stealer = gameState.players[stealerIndex];
	const target = gameState.players[targetIndex];

	if (!stealer || !target || target.score <= 0) return false;

	// Check if stealer has enough tokens
	if (!deductTokens(stealerIndex, "any", 3)) return false;

	target.score--;
	stealer.score++;
	return true;
}

/**
 * Updates the list of selected decks for the game
 * @param {Array<string>} deckKeys - Array of deck identifiers
 */
function setSelectedDecks(deckKeys) {
	gameState.selectedDecks = deckKeys;
}

/**
 * Sets game started status
 * @param {boolean} started - Whether the game has started
 */
function setGameStarted(started) {
	gameState.gameStarted = started;
	if (started) {
		gameState.currentRound = 1;
	}
}

/**
 * Resets the game state for a new game
 * @param {boolean} keepPlayers - Whether to keep existing players
 */
function resetGame(keepPlayers = true) {
	const playersBackup = keepPlayers ? gameState.players : [];

	// Reset scores and tokens if keeping players
	if (keepPlayers) {
		playersBackup.forEach((player) => {
			player.score = 0;
			player.tokens = {
				mindReader: 0,
				artBro: 0,
				perfectlyAligned: 0,
				psychopath: 0,
			};
		});
	}

	// Reset game state
	gameState.players = playersBackup;
	gameState.currentPlayerIndex = 0;
	gameState.availableCards = [];
	gameState.currentlyDisplayedPrompts = [];
	gameState.chosenPromptForRound = null;
	gameState.selectedWinnerIndexForRound = null;
	gameState.recentAlignments = [];
	gameState.currentRolledAlignment = null;
	gameState.currentRound = 1;
	gameState.gameStarted = false;
}

export {
	gameState,
	createPlayer,
	addPlayer,
	clearPlayers,
	setTargetScore,
	setPartySize,
	advanceToNextJudge,
	getCurrentJudge,
	getContestants,
	setDisplayedPrompts,
	setChosenPrompt,
	setCurrentAlignment,
	setRoundWinner,
	awardPoint,
	checkForWinner,
	awardToken,
	deductTokens,
	getPlayerTokenTotal,
	stealPoint,
	setSelectedDecks,
	setGameStarted,
	resetGame,
};
