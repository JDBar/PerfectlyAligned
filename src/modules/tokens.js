/**
 * Tokens Module
 *
 * Manages the token economy including awarding, deducting, and tracking token balances.
 *
 * @module tokens
 */

import { logError, logWarning } from "./logger.js";
import { playSound } from "./audio.js";
import { gameState } from "./gameState.js";

/**
 * Token types configuration with their properties
 * @type {Object}
 */
let tokenTypes = {};

/**
 * Token costs for various actions
 * @type {Object}
 */
let tokenCosts = {
	reroll: 1,
	steal: 3,
};

/**
 * Loads token data from JSON
 * @param {string} url - URL to the tokens.json file
 * @returns {Promise<boolean>} - Promise that resolves to true if loading was successful
 */
export async function loadTokenData(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch token data: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();

		if (data.tokenTypes && Array.isArray(data.tokenTypes)) {
			// Convert array to object for easier access
			tokenTypes = {};
			data.tokenTypes.forEach((token) => {
				if (token.id) {
					tokenTypes[token.id] = token;
				}
			});
		}

		if (data.tokenCosts) {
			tokenCosts = { ...tokenCosts, ...data.tokenCosts };
		}

		return true;
	} catch (error) {
		logError(`Error loading token data: ${error.message}`);
		return false;
	}
}

/**
 * Gets all available token types
 * @returns {Object} - Token types configuration
 */
export function getTokenTypes() {
	return tokenTypes;
}

/**
 * Gets the cost for a specific action
 * @param {string} action - The action to get the cost for (e.g., "reroll", "steal")
 * @returns {number} - The token cost for the action
 */
export function getTokenCost(action) {
	return tokenCosts[action] || 0;
}

/**
 * Awards a token to a player
 * @param {number} playerIndex - Index of the player to award token to
 * @param {string} tokenType - Type of token to award
 * @returns {boolean} - Whether the token was successfully awarded
 */
export function awardToken(playerIndex, tokenType) {
	if (!tokenTypes[tokenType]) {
		logWarning(`Invalid token type: ${tokenType}`);
		return false;
	}

	if (playerIndex < 0 || playerIndex >= gameState.players.length) {
		logWarning(`Invalid player index: ${playerIndex}`);
		return false;
	}

	gameState.players[playerIndex].tokens[tokenType]++;
	playSound("token_gain");

	return true;
}

/**
 * Gets the total tokens a player has
 * @param {number} playerIndex - Index of the player
 * @returns {number} - Total tokens
 */
export function getPlayerTokenTotal(playerIndex) {
	if (playerIndex < 0 || playerIndex >= gameState.players.length) {
		logWarning(`Invalid player index: ${playerIndex}`);
		return 0;
	}

	const player = gameState.players[playerIndex];
	return Object.values(player.tokens).reduce((sum, val) => sum + val, 0);
}

/**
 * Checks if a player has enough tokens for an action
 * @param {number} playerIndex - Index of the player
 * @param {string} action - Action to check (e.g., "reroll", "steal")
 * @returns {boolean} - Whether the player has enough tokens
 */
export function canAffordAction(playerIndex, action) {
	const cost = getTokenCost(action);
	if (cost <= 0) return true;

	return getPlayerTokenTotal(playerIndex) >= cost;
}

/**
 * Deducts tokens from a player for an action
 * @param {number} playerIndex - Index of the player
 * @param {string} action - Action being performed
 * @returns {boolean} - Whether the deduction was successful
 */
export function deductActionCost(playerIndex, action) {
	const cost = getTokenCost(action);
	if (cost <= 0) return true;

	if (!canAffordAction(playerIndex, action)) {
		return false;
	}

	// Deduct tokens in a fair way, starting with the token type the player has most of
	const player = gameState.players[playerIndex];
	const tokenTypes = Object.keys(player.tokens);

	// Sort token types by count (descending)
	tokenTypes.sort((a, b) => player.tokens[b] - player.tokens[a]);

	let remaining = cost;
	for (const type of tokenTypes) {
		if (remaining <= 0) break;

		const deduct = Math.min(player.tokens[type], remaining);
		player.tokens[type] -= deduct;
		remaining -= deduct;
	}

	return true;
}

/**
 * Gets a summary of tokens for all players
 * @returns {Array<Object>} - Array of player token summaries
 */
export function getAllPlayerTokenSummaries() {
	return gameState.players.map((player, index) => {
		return {
			playerIndex: index,
			playerName: player.name,
			tokens: { ...player.tokens },
			total: getPlayerTokenTotal(index),
		};
	});
}
