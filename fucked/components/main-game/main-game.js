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

		// Component references
		this.playerSetup = null;
		this.alignmentGrid = null;
		this.promptCard = null;
		this.sketchTimer = null;
		this.scoreboard = null;
		this.finalScoreboard = null;

		// Bind methods for callbacks
		this.handlePlayerCountChanged = this.handlePlayerCountChanged.bind(this);
		this.handleAlignmentSelected = this.handleAlignmentSelected.bind(this);
		this.handlePromptSelected = this.handlePromptSelected.bind(this);
		this.handleTimerEnded = this.handleTimerEnded.bind(this);
		this.handleStartGame = this.handleStartGame.bind(this);
		this.handleEndGame = this.handleEndGame.bind(this);
		this.handleNextRound = this.handleNextRound.bind(this);
		this.handleConfirmWinner = this.handleConfirmWinner.bind(this);
		this.handleNewGame = this.handleNewGame.bind(this);
		this.handleResetGame = this.handleResetGame.bind(this);
	}

	/**
	 * Called after the component is rendered
	 * Overrides the afterRender method from ComponentBase
	 */
	afterRender() {
		// Get component references and set up callbacks
		this.initializeComponents();
		this.setupButtons();
	}

	/**
	 * Initialize components and set up callbacks
	 */
	initializeComponents() {
		// Get component references
		this.playerSetup = this.shadowRoot.getElementById("player-setup");
		this.alignmentGrid = this.shadowRoot.getElementById("alignment-grid");
		this.promptCard = this.shadowRoot.getElementById("prompt-card");
		this.sketchTimer = this.shadowRoot.getElementById("sketch-timer");
		this.scoreboard = this.shadowRoot.getElementById("scoreboard");
		this.finalScoreboard = this.shadowRoot.getElementById("final-scoreboard");

		// Set callbacks for components - React-like props passing
		this.setComponentCallbacks();
	}

	/**
	 * Set callbacks on child components (React-like props passing)
	 */
	setComponentCallbacks() {
		// Direct callback passing to components
		if (this.playerSetup) {
			// Define onPlayerCountChanged as a property on the component
			this.playerSetup.onPlayerCountChanged = this.handlePlayerCountChanged;
		}

		if (this.alignmentGrid) {
			// Define onAlignmentSelected as a property on the component
			this.alignmentGrid.onAlignmentSelected = this.handleAlignmentSelected;
		}

		if (this.promptCard) {
			// Define onPromptSelected as a property on the component
			this.promptCard.onPromptSelected = this.handlePromptSelected;
		}

		if (this.sketchTimer) {
			// Define onTimerEnded as a property on the component
			this.sketchTimer.onTimerEnded = this.handleTimerEnded;
		}
	}

	/**
	 * Setup button event listeners
	 */
	setupButtons() {
		// Start game button
		const startGameButton = this.shadowRoot.getElementById("start-game-button");
		if (startGameButton) {
			startGameButton.addEventListener("click", this.handleStartGame);
		}

		// End game button
		const endGameButton = this.shadowRoot.getElementById("end-game-button");
		if (endGameButton) {
			endGameButton.addEventListener("click", this.handleEndGame);
		}

		// Next round button
		const nextRoundButton = this.shadowRoot.getElementById("next-round-button");
		if (nextRoundButton) {
			nextRoundButton.addEventListener("click", this.handleNextRound);
		}

		// Confirm winner button
		const confirmWinnerButton = this.shadowRoot.getElementById(
			"confirm-winner-button"
		);
		if (confirmWinnerButton) {
			confirmWinnerButton.addEventListener("click", this.handleConfirmWinner);
		}

		// New game button
		const newGameButton = this.shadowRoot.getElementById("new-game-button");
		if (newGameButton) {
			newGameButton.addEventListener("click", this.handleNewGame);
		}

		// Reset game button
		const resetGameButton = this.shadowRoot.getElementById("reset-game-button");
		if (resetGameButton) {
			resetGameButton.addEventListener("click", this.handleResetGame);
		}
	}

	/**
	 * Callback for player count change
	 * @param {number} count - The new player count
	 */
	handlePlayerCountChanged(count) {
		Logger.logInfo(`Player count changed to ${count}`);
		// Any other logic needed when player count changes
	}

	/**
	 * Callback for alignment selection
	 * @param {string} alignment - The selected alignment
	 */
	handleAlignmentSelected(alignment) {
		this.updateSketchPhaseWithAlignment(alignment);
	}

	/**
	 * Callback for prompt selection
	 * @param {string} prompt - The selected prompt
	 */
	handlePromptSelected(prompt) {
		// Enable alignment grid if we have a prompt
		if (this.alignmentGrid) {
			this.alignmentGrid.disabled = false;
		}

		// Update sketch instructions
		if (prompt) {
			this.updateSketchInstructions(
				`<strong>Prompt chosen:</strong> ${prompt}<br><br>Waiting for the judge to roll the alignment...`
			);
		}
	}

	/**
	 * Callback for timer ended
	 */
	handleTimerEnded() {
		this.switchToJudgingPhase();
	}

	/**
	 * Switch to a different view
	 * @param {string} viewName - Name of the view to switch to ('setup', 'play', 'results')
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
	 */
	handleStartGame() {
		// Validate player setup
		if (!this.playerSetup || !this.playerSetup.validateAllInputs()) {
			Logger.logWarning("Player setup is not valid");
			return;
		}

		// Get player data
		const playerData = this.playerSetup.getPlayerData();
		if (!playerData || playerData.length < 3) {
			Logger.logWarning("Need at least 3 players to start");
			return;
		}

		// Reset previous game state and add players
		GameState.resetGame(false);
		playerData.forEach((player) => {
			GameState.addPlayer(player.name, player.avatar);
		});

		// Set up initial game state
		GameState.setGameStarted(true);

		// Create the active deck from selected decks
		Deck.createActiveDeck(GameState.gameState.selectedDecks);

		// Update scoreboard
		if (this.scoreboard) {
			this.scoreboard.setTokenTypes(Tokens.getTokenTypes());
			this.scoreboard.updateScoreboard(
				GameState.gameState.players,
				GameState.gameState.currentPlayerIndex
			);
		}

		// Set up prompt card with initial judge
		if (this.promptCard) {
			this.promptCard.setIsJudge(true, GameState.gameState.currentPlayerIndex);
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
	 */
	updateSketchPhaseWithAlignment(alignment) {
		// Get current prompt
		const prompt = this.promptCard ? this.promptCard.getSelectedPrompt() : null;

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
		if (this.sketchTimer) {
			this.sketchTimer.start();
			this.state.timerRunning = true;
		}

		// Set round as active
		this.state.roundActive = true;
	}

	/**
	 * Switch from sketch phase to judging phase
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
			const prompt = this.promptCard
				? this.promptCard.getSelectedPrompt()
				: "Unknown prompt";
			const alignment = this.alignmentGrid
				? this.alignmentGrid.getCurrentAlignment()
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
			avatarDisplay.style.backgroundImage = `url('/assets/images/avatars/${player.avatar}')`;

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
		if (this.scoreboard) {
			this.scoreboard.updatePlayerTokens(
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
		if (this.scoreboard) {
			const player = GameState.gameState.players[actualPlayerIndex];
			this.scoreboard.updatePlayerScore(actualPlayerIndex, player.score, true);
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
	 */
	resetForNewRound() {
		// Reset prompt card
		if (this.promptCard) {
			this.promptCard.reset();
			this.promptCard.setIsJudge(true, GameState.gameState.currentPlayerIndex);
		}

		// Reset alignment grid
		if (this.alignmentGrid) {
			this.alignmentGrid.disabled = true;
		}

		// Reset sketch timer
		if (this.sketchTimer) {
			this.sketchTimer.reset();
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
		if (this.sketchTimer && this.sketchTimer.isTimerRunning()) {
			this.sketchTimer.stop();
		}

		// Switch to results view without declaring winner
		if (this.finalScoreboard) {
			this.finalScoreboard.setTokenTypes(Tokens.getTokenTypes());
			this.finalScoreboard.updateScoreboard(
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
		if (this.playerSetup && typeof this.playerSetup.reset === "function") {
			this.playerSetup.reset();
		}

		// Reset prompt card
		if (this.promptCard) {
			this.promptCard.reset();
		}

		// Reset alignment grid
		if (this.alignmentGrid && typeof this.alignmentGrid.reset === "function") {
			this.alignmentGrid.reset();
		}

		// Reset sketch timer
		if (this.sketchTimer) {
			this.sketchTimer.reset();
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
		if (this.scoreboard) {
			this.scoreboard.updateScoreboard(
				GameState.gameState.players,
				GameState.gameState.currentPlayerIndex
			);
		}
	}

	/**
	 * Handle game end when a winner is determined
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
		if (this.finalScoreboard) {
			this.finalScoreboard.setTokenTypes(Tokens.getTokenTypes());
			this.finalScoreboard.updateScoreboard(
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
