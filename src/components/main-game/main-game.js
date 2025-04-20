/**
 * Main Game Web Component
 *
 * The central component that orchestrates the entire game experience,
 * integrating all other components and managing game flow.
 *
 * @module components/main-game
 */

import * as Logger from "../../lib/logger.js";
import * as Audio from "../../lib/audio.js";
import * as GameState from "../../lib/gameState.js";
import * as Deck from "../../lib/deck.js";
import * as Tokens from "../../lib/tokens.js";
import { ComponentBase } from "../component-base.js";

/**
 * Main Game Web Component
 * @extends ComponentBase
 */
export class MainGame extends ComponentBase {
	/**
	 * Create a new MainGame component
	 */
	constructor() {
		super(
			"./components/main-game/main-game.template.html",
			"./components/main-game/main-game.styles.css"
		);

		// Initialize state
		this.state = {
			currentView: "setup", // setup, play, results
			winner: null,
			winnerAnnounced: false,
			roundActive: false,
			timerRunning: false,
		};
	}

	/**
	 * Called after the component is rendered
	 * Overrides the afterRender method from ComponentBase
	 */
	afterRender() {
		// Add event listeners
		this.setupEventListeners();

		// Dispatch connected event
		this.dispatchEvent(new CustomEvent("main-game-connected"));
	}

	/**
	 * Set up all event listeners for sub-components
	 * @private
	 */
	setupEventListeners() {
		// Setup event listeners for child components
		setTimeout(() => {
			this.setupPlayerSetupListeners();
			this.setupAlignmentGridListeners();
			this.setupPromptCardListeners();
			this.setupSketchTimerListeners();
			this.setupScoreboardListeners();
			this.setupButtonListeners();
		}, 0);
	}

	/**
	 * Setup listeners for player setup component
	 * @private
	 */
	setupPlayerSetupListeners() {
		const playerSetup = this.shadowRoot.getElementById("player-setup");
		if (!playerSetup) return;

		// Listen for player-setup-complete event
		playerSetup.addEventListener("player-setup-complete", (event) => {
			const playerData = event.detail.players;

			// Add players to game state
			if (Array.isArray(playerData) && playerData.length >= 3) {
				// Enable start game button
				const startGameButton =
					this.shadowRoot.getElementById("start-game-button");
				if (startGameButton) {
					startGameButton.disabled = false;
				}
			}
		});
	}

	/**
	 * Setup listeners for alignment grid component
	 * @private
	 */
	setupAlignmentGridListeners() {
		const alignmentGrid = this.shadowRoot.getElementById("alignment-grid");
		if (!alignmentGrid) return;

		// Listen for alignment selection
		alignmentGrid.addEventListener("alignment-selected", (event) => {
			const alignment = event.detail.alignment;

			// Update sketch instructions with alignment and prompt
			this.updateSketchPhaseWithAlignment(alignment);
		});
	}

	/**
	 * Setup listeners for prompt card component
	 * @private
	 */
	setupPromptCardListeners() {
		const promptCard = this.shadowRoot.getElementById("prompt-card");
		if (!promptCard) return;

		// Listen for prompt selection
		promptCard.addEventListener("prompt-selected", (event) => {
			const prompt = event.detail.prompt;

			// Enable alignment grid if we have a prompt
			const alignmentGrid = this.shadowRoot.getElementById("alignment-grid");
			if (alignmentGrid) {
				// Enable for judge roll
				alignmentGrid.disabled = false;
			}

			// Update sketch instructions to prompt users to wait for alignment roll
			if (prompt) {
				this.updateSketchInstructions(
					`<strong>Prompt chosen:</strong> ${prompt}<br><br>Waiting for the judge to roll the alignment...`
				);
			}
		});
	}

	/**
	 * Setup listeners for sketch timer component
	 * @private
	 */
	setupSketchTimerListeners() {
		const sketchTimer = this.shadowRoot.getElementById("sketch-timer");
		if (!sketchTimer) return;

		// Listen for timer ended event
		sketchTimer.addEventListener("timer-ended", () => {
			// Show judging phase, hide sketch phase
			this.switchToJudgingPhase();
		});
	}

	/**
	 * Setup listeners for scoreboard component
	 * @private
	 */
	setupScoreboardListeners() {
		const scoreboard = this.shadowRoot.getElementById("scoreboard");
		if (!scoreboard) return;

		// No event listeners needed for scoreboard currently
		// It's mostly driven by data updates from this component
	}

	/**
	 * Setup listeners for game control buttons
	 * @private
	 */
	setupButtonListeners() {
		// Start game button
		const startGameButton = this.shadowRoot.getElementById("start-game-button");
		if (startGameButton) {
			startGameButton.addEventListener("click", () => this.handleStartGame());
		}

		// End game button
		const endGameButton = this.shadowRoot.getElementById("end-game-button");
		if (endGameButton) {
			endGameButton.addEventListener("click", () => this.handleEndGame());
		}

		// Next round button
		const nextRoundButton = this.shadowRoot.getElementById("next-round-button");
		if (nextRoundButton) {
			nextRoundButton.addEventListener("click", () => this.handleNextRound());
		}

		// Confirm winner button
		const confirmWinnerButton = this.shadowRoot.getElementById(
			"confirm-winner-button"
		);
		if (confirmWinnerButton) {
			confirmWinnerButton.addEventListener("click", () =>
				this.handleConfirmWinner()
			);
		}

		// New game button
		const newGameButton = this.shadowRoot.getElementById("new-game-button");
		if (newGameButton) {
			newGameButton.addEventListener("click", () => this.handleNewGame());
		}

		// Reset game button
		const resetGameButton = this.shadowRoot.getElementById("reset-game-button");
		if (resetGameButton) {
			resetGameButton.addEventListener("click", () => this.handleResetGame());
		}
	}

	/**
	 * Switch to a different view
	 * @param {string} viewName - Name of the view to switch to ('setup', 'play', 'results')
	 * @private
	 */
	switchToView(viewName) {
		// Hide all views
		const views = this.shadowRoot.querySelectorAll(".view");
		views.forEach((view) => view.classList.remove("active"));

		// Show the requested view
		const targetView = this.shadowRoot.getElementById(`${viewName}-view`);
		if (targetView) {
			targetView.classList.add("active");
			this.state.currentView = viewName;
		}
	}

	/**
	 * Handle start game button click
	 * @private
	 */
	handleStartGame() {
		// Get player setup component and validate inputs
		const playerSetup = this.shadowRoot.getElementById("player-setup");
		if (!playerSetup || !playerSetup.validateAllInputs()) {
			Logger.logWarning("Player setup is not valid");
			return;
		}

		// Get player data
		const playerData = playerSetup.getPlayerData();
		if (!playerData || playerData.length < 3) {
			Logger.logWarning("Need at least 3 players to start");
			return;
		}

		// Set up initial game state
		GameState.setGameStarted(true);

		// Create the active deck from selected decks
		Deck.createActiveDeck(GameState.gameState.selectedDecks);

		// Update scoreboard
		const scoreboard = this.shadowRoot.getElementById("scoreboard");
		if (scoreboard) {
			scoreboard.setTokenTypes(Tokens.getTokenTypes());
			scoreboard.updateScoreboard(
				GameState.gameState.players,
				GameState.gameState.currentPlayerIndex
			);
		}

		// Set up prompt card with initial judge
		const promptCard = this.shadowRoot.getElementById("prompt-card");
		if (promptCard) {
			promptCard.setIsJudge(true, GameState.gameState.currentPlayerIndex);
		}

		// Update judge display
		this.updateJudgeDisplay();

		// Update round number
		const roundNumber = this.shadowRoot.getElementById("round-number");
		if (roundNumber) {
			roundNumber.textContent = GameState.gameState.currentRound.toString();
		}

		// Switch to play view
		this.switchToView("play");

		// Set sketch instructions
		this.updateSketchInstructions(
			"Waiting for the judge to select a prompt and roll the alignment..."
		);
	}

	/**
	 * Updates the judge display with current judge name
	 * @private
	 */
	updateJudgeDisplay() {
		const judgeName = this.shadowRoot.getElementById("judge-name");
		if (!judgeName) return;

		const currentJudge = GameState.getCurrentJudge();
		if (currentJudge) {
			judgeName.textContent = currentJudge.name;
		} else {
			judgeName.textContent = "-";
		}
	}

	/**
	 * Updates the sketch instructions text
	 * @param {string} text - New instruction text
	 * @private
	 */
	updateSketchInstructions(text) {
		const instructionsText = this.shadowRoot.getElementById(
			"sketch-instructions-text"
		);
		if (instructionsText) {
			instructionsText.innerHTML = text;
		}
	}

	/**
	 * Updates the sketch phase with the selected alignment and prompt
	 * @param {string} alignment - Selected alignment code (e.g., "LG", "CE")
	 * @private
	 */
	updateSketchPhaseWithAlignment(alignment) {
		// Get current prompt
		const promptCard = this.shadowRoot.getElementById("prompt-card");
		const prompt = promptCard ? promptCard.getSelectedPrompt() : null;

		if (!prompt) {
			Logger.logWarning("No prompt selected when alignment was rolled");
			return;
		}

		// Update sketch instructions with full instructions
		let fullPrompt = `<strong>Prompt:</strong> ${prompt}<br>`;
		fullPrompt += `<strong>Alignment:</strong> ${alignment}<br><br>`;
		fullPrompt += `Artists: Draw this prompt as if it were ${alignment}!<br>`;
		fullPrompt += `You have until the timer ends to create your masterpiece. Judge, don't peek!`;

		this.updateSketchInstructions(fullPrompt);

		// Start the timer
		const sketchTimer = this.shadowRoot.getElementById("sketch-timer");
		if (sketchTimer) {
			sketchTimer.start();
			this.state.timerRunning = true;
		}

		// Set round as active
		this.state.roundActive = true;
	}

	/**
	 * Switch from sketch phase to judging phase
	 * @private
	 */
	switchToJudgingPhase() {
		// Hide sketch phase, show judging phase
		const sketchPhase = this.shadowRoot.getElementById(
			"sketch-phase-container"
		);
		const judgingPhase = this.shadowRoot.getElementById(
			"judging-phase-container"
		);

		if (sketchPhase) {
			sketchPhase.style.display = "none";
		}

		if (judgingPhase) {
			judgingPhase.style.display = "block";
		}

		// Update judging instructions
		const judgeInstructions = this.shadowRoot.getElementById(
			"judging-instructions-text"
		);
		if (judgeInstructions) {
			const promptCard = this.shadowRoot.getElementById("prompt-card");
			const alignmentGrid = this.shadowRoot.getElementById("alignment-grid");

			const prompt = promptCard
				? promptCard.getSelectedPrompt()
				: "Unknown prompt";
			const alignment = alignmentGrid
				? alignmentGrid.getCurrentAlignment()
				: "Unknown alignment";

			judgeInstructions.innerHTML = `
				<strong>Prompt:</strong> ${prompt}<br>
				<strong>Alignment:</strong> ${alignment}<br><br>
				Judge: Look at everyone's sketches and select a winner for this round. You may also award special tokens!
			`;
		}

		// Populate player selection list for judging
		this.populatePlayerSelectionList();

		// Populate token award buttons
		this.populateTokenAwardButtons();

		// Hide next round button during judging
		const nextRoundButton = this.shadowRoot.getElementById("next-round-button");
		if (nextRoundButton) {
			nextRoundButton.style.display = "none";
		}
	}

	/**
	 * Populates the player selection list for the judge to select a winner
	 * @private
	 */
	populatePlayerSelectionList() {
		const playerSelectionList = this.shadowRoot.getElementById(
			"player-selection-list"
		);
		if (!playerSelectionList) return;

		// Clear existing options
		playerSelectionList.innerHTML = "";

		// Add each contestant (non-judge player)
		const contestants = GameState.getContestants();

		contestants.forEach((player, index) => {
			const playerOption = document.createElement("div");
			playerOption.className = "player-option";
			playerOption.dataset.playerIndex = index;

			// Add avatar
			const avatarDisplay = document.createElement("div");
			avatarDisplay.className = "player-option-avatar";
			avatarDisplay.style.backgroundImage = `url('assets/images/avatars/${player.avatar}')`;

			// Add name
			const nameDisplay = document.createElement("div");
			nameDisplay.className = "player-option-name";
			nameDisplay.textContent = player.name;

			playerOption.appendChild(avatarDisplay);
			playerOption.appendChild(nameDisplay);

			// Add click event
			playerOption.addEventListener("click", () =>
				this.handlePlayerSelection(playerOption)
			);

			playerSelectionList.appendChild(playerOption);
		});
	}

	/**
	 * Populates the token award buttons
	 * @private
	 */
	populateTokenAwardButtons() {
		const tokenAwardButtons = this.shadowRoot.getElementById(
			"token-award-buttons"
		);
		if (!tokenAwardButtons) return;

		// Clear existing buttons
		tokenAwardButtons.innerHTML = "";

		// Get token types
		const tokenTypes = Tokens.getTokenTypes();

		// Add a button for each token type
		for (const [tokenId, tokenData] of Object.entries(tokenTypes)) {
			const button = document.createElement("button");
			button.className = `token-award-button token-${tokenId}`;
			button.dataset.tokenType = tokenId;

			button.style.backgroundColor = tokenData.color || "#1a0a2e";
			button.style.color = tokenData.color ? "#000000" : "#ffffff";
			button.style.borderColor = tokenData.color || "#ffffff";

			button.textContent = tokenData.name || tokenId;
			button.title = tokenData.description || "";

			// Add click event
			button.addEventListener("click", () => this.handleTokenAward(tokenId));

			tokenAwardButtons.appendChild(button);
		}
	}

	/**
	 * Handles player selection for judging
	 * @param {HTMLElement} playerOption - The selected player option element
	 * @private
	 */
	handlePlayerSelection(playerOption) {
		// Deselect all options
		const playerOptions = this.shadowRoot.querySelectorAll(".player-option");
		playerOptions.forEach((option) => option.classList.remove("selected"));

		// Select clicked option
		playerOption.classList.add("selected");

		// Enable confirm button
		const confirmButton = this.shadowRoot.getElementById(
			"confirm-winner-button"
		);
		if (confirmButton) {
			confirmButton.disabled = false;
		}
	}

	/**
	 * Handles awarding a token to the selected player
	 * @param {string} tokenType - Type of token to award
	 * @private
	 */
	handleTokenAward(tokenType) {
		// Get selected player
		const selectedOption = this.shadowRoot.querySelector(
			".player-option.selected"
		);
		if (!selectedOption) {
			// Prompt to select a player first
			const judgeInstructions = this.shadowRoot.getElementById(
				"judging-instructions-text"
			);
			if (judgeInstructions) {
				const originalText = judgeInstructions.innerHTML;
				judgeInstructions.innerHTML += `<div style="color: #ff3333; margin-top: 10px;">Select a player first!</div>`;

				// Reset after 2 seconds
				setTimeout(() => {
					judgeInstructions.innerHTML = originalText;
				}, 2000);
			}
			return;
		}

		// Get player index from data attribute, accounting for contestants array
		const playerIndexAttr = parseInt(selectedOption.dataset.playerIndex, 10);

		// Convert contestant index to actual player index (skipping the judge)
		const contestants = GameState.getContestants();
		const actualPlayerIndex = contestants[playerIndexAttr]
			? GameState.gameState.players.indexOf(contestants[playerIndexAttr])
			: -1;

		if (actualPlayerIndex === -1) {
			Logger.logError("Could not find player to award token to");
			return;
		}

		// Award token
		Tokens.awardToken(actualPlayerIndex, tokenType);

		// Play sound
		Audio.playSound("token_gain");

		// Update scoreboard
		const scoreboard = this.shadowRoot.getElementById("scoreboard");
		if (scoreboard) {
			scoreboard.updatePlayerTokens(
				actualPlayerIndex,
				GameState.gameState.players[actualPlayerIndex].tokens
			);
		}

		// Visual feedback
		const button = this.shadowRoot.querySelector(
			`.token-award-button[data-token-type="${tokenType}"]`
		);
		if (button) {
			button.classList.add("awarded");

			// Reset after animation
			setTimeout(() => {
				button.classList.remove("awarded");
			}, 1000);
		}
	}

	/**
	 * Handle confirm winner button click
	 * @private
	 */
	handleConfirmWinner() {
		// Get selected player
		const selectedOption = this.shadowRoot.querySelector(
			".player-option.selected"
		);
		if (!selectedOption) {
			return;
		}

		// Get player index
		const playerIndexAttr = parseInt(selectedOption.dataset.playerIndex, 10);

		// Convert contestant index to actual player index (skipping the judge)
		const contestants = GameState.getContestants();
		const actualPlayerIndex = contestants[playerIndexAttr]
			? GameState.gameState.players.indexOf(contestants[playerIndexAttr])
			: -1;

		if (actualPlayerIndex === -1) {
			Logger.logError("Could not find winning player");
			return;
		}

		// Set round winner
		GameState.setRoundWinner(actualPlayerIndex);

		// Award point
		GameState.awardPoint(actualPlayerIndex);

		// Play sound
		Audio.playSound("point_gain");

		// Update scoreboard
		const scoreboard = this.shadowRoot.getElementById("scoreboard");
		if (scoreboard) {
			const player = GameState.gameState.players[actualPlayerIndex];
			scoreboard.updatePlayerScore(actualPlayerIndex, player.score, true);
		}

		// Check for game winner
		const winner = GameState.checkForWinner();
		if (winner) {
			// Game is over, switch to results
			this.state.winner = winner;
			this.handleGameEnd();
		} else {
			// Show next round button
			const nextRoundButton =
				this.shadowRoot.getElementById("next-round-button");
			if (nextRoundButton) {
				nextRoundButton.style.display = "block";
			}

			// Disable confirm button to prevent multiple awards
			const confirmButton = this.shadowRoot.getElementById(
				"confirm-winner-button"
			);
			if (confirmButton) {
				confirmButton.disabled = true;
			}
		}
	}

	/**
	 * Handle next round button click
	 * @private
	 */
	handleNextRound() {
		// Advance to next judge
		GameState.advanceToNextJudge();

		// Reset components for new round
		this.resetForNewRound();

		// Update the UI
		this.updateRoundDisplay();
	}

	/**
	 * Reset components for a new round
	 * @private
	 */
	resetForNewRound() {
		// Reset prompt card
		const promptCard = this.shadowRoot.getElementById("prompt-card");
		if (promptCard) {
			promptCard.reset();
			promptCard.setIsJudge(true, GameState.gameState.currentPlayerIndex);
		}

		// Reset alignment grid
		const alignmentGrid = this.shadowRoot.getElementById("alignment-grid");
		if (alignmentGrid) {
			alignmentGrid.disabled = true;
		}

		// Reset sketch timer
		const sketchTimer = this.shadowRoot.getElementById("sketch-timer");
		if (sketchTimer) {
			sketchTimer.reset();
		}

		// Switch back to sketch phase
		const sketchPhase = this.shadowRoot.getElementById(
			"sketch-phase-container"
		);
		const judgingPhase = this.shadowRoot.getElementById(
			"judging-phase-container"
		);

		if (sketchPhase) {
			sketchPhase.style.display = "block";
		}

		if (judgingPhase) {
			judgingPhase.style.display = "none";
		}

		// Reset next round button
		const nextRoundButton = this.shadowRoot.getElementById("next-round-button");
		if (nextRoundButton) {
			nextRoundButton.style.display = "none";
		}

		// Reset sketch instructions
		this.updateSketchInstructions(
			"Waiting for the judge to select a prompt and roll the alignment..."
		);
	}

	/**
	 * Handle end game button click
	 * @private
	 */
	handleEndGame() {
		// Confirm with user
		if (
			!confirm(
				"Are you sure you want to end the game? No winner will be declared."
			)
		) {
			return;
		}

		// Stop any active timer
		const sketchTimer = this.shadowRoot.getElementById("sketch-timer");
		if (sketchTimer && sketchTimer.isTimerRunning()) {
			sketchTimer.stop();
		}

		// Switch to results view without declaring winner
		const finalScoreboard = this.shadowRoot.getElementById("final-scoreboard");
		if (finalScoreboard) {
			finalScoreboard.setTokenTypes(Tokens.getTokenTypes());
			finalScoreboard.updateScoreboard(
				GameState.gameState.players,
				GameState.gameState.currentPlayerIndex
			);
		}

		// Find player with highest score to display as "winner"
		const highestScorePlayer = [...GameState.gameState.players].sort(
			(a, b) => b.score - a.score
		)[0];
		if (highestScorePlayer) {
			const winnerName = this.shadowRoot.getElementById("winner-name");
			if (winnerName) {
				winnerName.textContent = `${highestScorePlayer.name} (Highest Score)`;
			}
		}

		// Switch to results view
		this.switchToView("results");
	}

	/**
	 * Handle new game button click
	 * @private
	 */
	handleNewGame() {
		// Reset game state but keep players
		GameState.resetGame(true);

		// Reset UI
		this.resetGameUI();

		// Switch to setup view
		this.switchToView("setup");
	}

	/**
	 * Handle reset game button click
	 * @private
	 */
	handleResetGame() {
		// Confirm with user
		if (
			!confirm(
				"Are you sure you want to reset the game? All player data will be lost."
			)
		) {
			return;
		}

		// Reset game state and clear players
		GameState.resetGame(false);

		// Reset UI
		this.resetGameUI();

		// Switch to setup view
		this.switchToView("setup");
	}

	/**
	 * Reset all game UI elements
	 * @private
	 */
	resetGameUI() {
		// Reset state
		this.state = {
			currentView: "setup",
			winner: null,
			winnerAnnounced: false,
			roundActive: false,
			timerRunning: false,
		};

		// Reset player setup
		const playerSetup = this.shadowRoot.getElementById("player-setup");
		if (playerSetup) {
			// Reset the component if it has a reset method
			if (typeof playerSetup.reset === "function") {
				playerSetup.reset();
			}
		}

		// Reset prompt card
		const promptCard = this.shadowRoot.getElementById("prompt-card");
		if (promptCard) {
			promptCard.reset();
		}

		// Reset alignment grid
		const alignmentGrid = this.shadowRoot.getElementById("alignment-grid");
		if (alignmentGrid && typeof alignmentGrid.reset === "function") {
			alignmentGrid.reset();
		}

		// Reset sketch timer
		const sketchTimer = this.shadowRoot.getElementById("sketch-timer");
		if (sketchTimer) {
			sketchTimer.reset();
		}

		// Reset sketch and judging phases
		const sketchPhase = this.shadowRoot.getElementById(
			"sketch-phase-container"
		);
		const judgingPhase = this.shadowRoot.getElementById(
			"judging-phase-container"
		);

		if (sketchPhase) {
			sketchPhase.style.display = "block";
		}

		if (judgingPhase) {
			judgingPhase.style.display = "none";
		}

		// Reset sketch instructions
		this.updateSketchInstructions(
			"Waiting for the judge to select a prompt and roll the alignment..."
		);

		// Reset button states
		const nextRoundButton = this.shadowRoot.getElementById("next-round-button");
		if (nextRoundButton) {
			nextRoundButton.style.display = "none";
		}

		const confirmWinnerButton = this.shadowRoot.getElementById(
			"confirm-winner-button"
		);
		if (confirmWinnerButton) {
			confirmWinnerButton.disabled = true;
		}
	}

	/**
	 * Update the round display elements
	 * @private
	 */
	updateRoundDisplay() {
		// Update round number
		const roundNumber = this.shadowRoot.getElementById("round-number");
		if (roundNumber) {
			roundNumber.textContent = GameState.gameState.currentRound.toString();
		}

		// Update judge name
		this.updateJudgeDisplay();

		// Update scoreboard
		const scoreboard = this.shadowRoot.getElementById("scoreboard");
		if (scoreboard) {
			scoreboard.updateScoreboard(
				GameState.gameState.players,
				GameState.gameState.currentPlayerIndex
			);
		}
	}

	/**
	 * Handle game end when a winner is determined
	 * @private
	 */
	handleGameEnd() {
		// Play win sound
		Audio.playSound("win");

		// Update winner display
		const winnerName = this.shadowRoot.getElementById("winner-name");
		if (winnerName && this.state.winner) {
			winnerName.textContent = this.state.winner.name;
		}

		// Update final scoreboard
		const finalScoreboard = this.shadowRoot.getElementById("final-scoreboard");
		if (finalScoreboard) {
			finalScoreboard.setTokenTypes(Tokens.getTokenTypes());
			finalScoreboard.updateScoreboard(
				GameState.gameState.players,
				GameState.gameState.currentPlayerIndex
			);
		}

		// Switch to results view
		this.switchToView("results");

		// Set winner announced flag
		this.state.winnerAnnounced = true;
	}
}

// Define the custom element
customElements.define("main-game", MainGame);
