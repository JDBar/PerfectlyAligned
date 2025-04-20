/**
 * Main Application Entry Point
 *
 * Initializes all game components and loads necessary data.
 */

import { logError, logInfo } from "./modules/logger.js";
import { loadSounds, preloadAllSounds } from "./modules/audio.js";
import { loadDecks } from "./modules/deck.js";
import { loadTokenData } from "./modules/tokens.js";

// Import components
import "./modules/components/alignment-grid.js";
import "./modules/components/player-setup.js";
import "./modules/components/prompt-card.js";
import "./modules/components/scoreboard.js";
import "./modules/components/sketch-timer.js";
import "./modules/components/main-game.js";

/**
 * Initialize the application once DOM is loaded
 */
document.addEventListener("DOMContentLoaded", async () => {
	try {
		logInfo("Initializing Perfectly Aligned game...");

		// Load game data
		const soundsPromise = loadSounds("/data/sounds.json");
		const decksPromise = loadDecks("/data/decks.json");
		const tokensPromise = loadTokenData("/data/tokens.json");

		// Wait for all data to load
		const [soundsLoaded, decksLoaded, tokensLoaded] = await Promise.all([
			soundsPromise,
			decksPromise,
			tokensPromise,
		]);

		// Check if all data loaded successfully
		if (!soundsLoaded || !decksLoaded || !tokensLoaded) {
			throw new Error("Failed to load game data");
		}

		// Preload audio assets
		await preloadAllSounds();

		// Initialize components with alignment grid data
		const alignmentGrids = document.querySelectorAll("alignment-grid");
		alignmentGrids.forEach(async (grid) => {
			await grid.loadAlignmentExamples("/data/alignments.json");
		});

		// Initialize player setup with avatars
		const playerSetups = document.querySelectorAll("player-setup");
		playerSetups.forEach(async (setup) => {
			// Fetch avatar data
			const response = await fetch("/data/avatars.json");
			if (!response.ok) {
				throw new Error("Failed to load avatar data");
			}

			const avatarData = await response.json();
			setup.setAvatarData(avatarData);
		});

		logInfo("Game initialized successfully!");
	} catch (error) {
		logError(`Initialization error: ${error.message}`);

		// Display error to user
		const gameContainer = document.getElementById("game-container");
		if (gameContainer) {
			gameContainer.innerHTML = `
        <div style="color: #ff3333; padding: 20px; text-align: center;">
          <h2>Failed to initialize game</h2>
          <p>${error.message}</p>
          <p>Please try refreshing the page.</p>
        </div>
      `;
		}
	}
});
