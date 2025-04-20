/**
 * Deck Module
 *
 * Handles loading and managing prompt decks, including drawing random prompts,
 * managing available cards, and combining decks.
 *
 * @module deck
 */

import { logError, logWarning } from "./logger.js";
import { gameState } from "./gameState.js";

/**
 * All loaded decks from the JSON file
 * @type {Object.<string, Array<string>>}
 */
let loadedDecks = {};

/**
 * Current active combined deck
 * @type {Array<string>}
 */
let activeDeck = [];

/**
 * The initial complete deck without removing cards
 * @type {Array<string>}
 */
let completeDeck = [];

/**
 * Shuffle an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array
 */
function shuffleArray(array) {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
}

/**
 * Loads deck data from JSON file
 * @param {string} url - URL to the decks.json file
 * @returns {Promise<boolean>} - Promise that resolves to true if loading was successful
 */
export async function loadDecks(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch deck data: ${response.status} ${response.statusText}`
			);
		}

		loadedDecks = await response.json();
		return true;
	} catch (error) {
		logError(`Error loading decks: ${error.message}`);
		return false;
	}
}

/**
 * Gets available decks that can be selected
 * @returns {Object.<string, Array<string>>} - The available decks
 */
export function getAvailableDecks() {
	return loadedDecks;
}

/**
 * Creates an active combined deck from the selected deck keys
 * @param {Array<string>} deckKeys - Array of deck identifiers to combine
 * @returns {boolean} - Whether the deck was successfully created
 */
export function createActiveDeck(deckKeys) {
	if (!deckKeys || !Array.isArray(deckKeys) || deckKeys.length === 0) {
		logWarning("Invalid or empty deck keys provided to createActiveDeck");
		return false;
	}

	activeDeck = [];
	completeDeck = [];

	// Combine all selected decks
	deckKeys.forEach((key) => {
		if (loadedDecks[key] && Array.isArray(loadedDecks[key])) {
			completeDeck = completeDeck.concat(loadedDecks[key]);
		} else {
			logWarning(`Deck key "${key}" not found or not an array`);
		}
	});

	// Initialize active deck with complete deck
	activeDeck = [...completeDeck];

	// Shuffle the deck
	activeDeck = shuffleArray(activeDeck);

	return activeDeck.length > 0;
}

/**
 * Draws a specified number of random prompts from the active deck
 * @param {number} count - Number of prompts to draw
 * @param {boolean} removeFromDeck - Whether to remove the drawn prompts from the deck
 * @returns {Array<string>} - Array of drawn prompts
 */
export function drawRandomPrompts(count, removeFromDeck = true) {
	if (activeDeck.length < count) {
		// Reshuffle all cards back in if we're running low
		logWarning(
			`Deck running low (${activeDeck.length} cards), reshuffling complete deck`
		);
		activeDeck = [...completeDeck];
		activeDeck = shuffleArray(activeDeck);
	}

	const selectedPrompts = [];

	// Select cards from active deck
	for (let i = 0; i < count; i++) {
		if (activeDeck.length === 0) break;

		// Select a random index
		const randomIndex = Math.floor(Math.random() * activeDeck.length);
		selectedPrompts.push(activeDeck[randomIndex]);

		// Remove from the deck if specified
		if (removeFromDeck) {
			activeDeck.splice(randomIndex, 1);
		}
	}

	return selectedPrompts;
}

/**
 * Returns prompts to the deck (for unused prompts)
 * @param {Array<string>} prompts - Prompts to return to the deck
 */
export function returnPromptsToDeck(prompts) {
	if (!Array.isArray(prompts)) return;

	activeDeck = activeDeck.concat(prompts);
	activeDeck = shuffleArray(activeDeck);
}

/**
 * Gets the number of cards remaining in the active deck
 * @returns {number} - Number of cards remaining
 */
export function getRemainingCardCount() {
	return activeDeck.length;
}

/**
 * Resets the active deck to the complete deck
 */
export function resetDeck() {
	activeDeck = [...completeDeck];
	activeDeck = shuffleArray(activeDeck);
}
