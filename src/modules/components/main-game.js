/**
 * Main Game Web Component
 *
 * The central component that orchestrates the entire game experience,
 * integrating all other components and managing game flow.
 *
 * @module components/main-game
 */

import { logError, logWarning } from "../logger.js";
import { playSound } from "../audio.js";
import {
	gameState,
	getCurrentJudge,
	getContestants,
	advanceToNextJudge,
	setRoundWinner,
	awardPoint,
	checkForWinner,
	setGameStarted,
	resetGame,
} from "../gameState.js";
import { createActiveDeck } from "../deck.js";
import { getTokenTypes, awardToken } from "../tokens.js";

/**
 * Main Game Web Component
 * @extends HTMLElement
 */
export class MainGame extends HTMLElement {
	/**
	 * Create a new MainGame component
	 */
	constructor() {
		super();

		// Create shadow DOM
		this.attachShadow({ mode: "open" });

		// Initialize state
		this.state = {
			currentView: "setup", // setup, play, results
			winner: null,
			winnerAnnounced: false,
			roundActive: false,
			timerRunning: false,
		};

		// Build component
		this.render();
	}

	/**
	 * Called when the element is added to the DOM
	 */
	connectedCallback() {
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
	 * Render the component
	 * @private
	 */
	render() {
		this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--pixel-font, 'Press Start 2P', cursive);
          color: #ffffff;
          --section-spacing: 20px;
        }
        
        .game-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .view {
          display: none;
        }
        
        .view.active {
          display: block;
        }
        
        .game-title {
          text-align: center;
          color: #ff00ff;
          text-shadow: 3px 3px 0px #00ffff;
          font-size: 2.5em;
          margin-bottom: 20px;
        }
        
        .setup-view {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .play-view {
          display: flex;
          flex-direction: column;
          gap: var(--section-spacing);
        }
        
        .game-section {
          margin-bottom: var(--section-spacing);
        }
        
        .round-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background-color: #1a0a2e;
          border: 2px solid #00ffff;
          border-radius: 5px;
          margin-bottom: 15px;
        }
        
        .round-number {
          color: #ffff00;
          font-size: 1.1em;
        }
        
        .current-judge {
          color: #ff00ff;
        }
        
        .action-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 20px 0;
        }
        
        button {
          background-color: #1a0a2e;
          border: 2px solid #00ffff;
          color: #00ffff;
          font-family: var(--pixel-font, 'Press Start 2P', cursive);
          padding: 10px 20px;
          font-size: 1em;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 5px rgba(0, 255, 255, 0.5);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .primary-button {
          background-color: #003300;
          color: #39ff14;
          border-color: #39ff14;
        }
        
        .secondary-button {
          background-color: #1a0a2e;
          color: #ffff00;
          border-color: #ffff00;
        }
        
        .danger-button {
          background-color: #330000;
          color: #ff3333;
          border-color: #ff3333;
        }
        
        .results-view {
          text-align: center;
        }
        
        .winner-display {
          padding: 30px;
          background-color: #1a0a2e;
          border: 2px solid #ff00ff;
          border-radius: 5px;
          margin: 20px 0;
          animation: winnerGlow 2s infinite;
        }
        
        @keyframes winnerGlow {
          0% { box-shadow: 0 0 10px rgba(255, 0, 255, 0.3); }
          50% { box-shadow: 0 0 20px rgba(255, 0, 255, 0.7); }
          100% { box-shadow: 0 0 10px rgba(255, 0, 255, 0.3); }
        }
        
        .winner-name {
          font-size: 2em;
          color: #ffff00;
          margin: 10px 0;
        }
        
        .trophy-icon {
          font-size: 3em;
          margin: 20px 0;
        }
        
        .game-controls {
          margin-top: 30px;
        }
        
        .sketch-phase-container,
        .judging-phase-container {
          padding: 15px;
          background-color: #1a0a2e;
          border: 2px solid #00ffff;
          border-radius: 5px;
        }
        
        .phase-heading {
          color: #ff00ff;
          margin-top: 0;
          margin-bottom: 15px;
        }
        
        .sketch-instructions,
        .judging-instructions {
          background-color: #0d0517;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 15px;
          color: #ffffff;
          font-family: var(--readable-font, 'Courier New', monospace);
          font-size: 1.1em;
          line-height: 1.5;
        }
        
        .token-award-section {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .token-award-heading {
          color: #ffff00;
          margin-bottom: 10px;
        }
        
        .token-award-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        
        .token-award-button {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          font-size: 0.8em;
        }
        
        .player-selection {
          margin-top: 20px;
        }
        
        .player-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-top: 15px;
        }
        
        .player-option {
          background-color: #0d0517;
          border: 2px solid #333333;
          border-radius: 5px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .player-option:hover {
          border-color: #00ffff;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }
        
        .player-option.selected {
          border-color: #ff00ff;
          box-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
        }
        
        .player-option-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          border: 2px solid #00ffff;
        }
        
        .player-option-name {
          color: #ffffff;
          font-size: 0.9em;
        }
        
        @media (max-width: 768px) {
          .game-title {
            font-size: 2em;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          button {
            width: 100%;
          }
        }
      </style>
      
      <div class="game-container">
        <h1 class="game-title">Perfectly Aligned™</h1>
        
        <!-- SETUP VIEW -->
        <div id="setup-view" class="view setup-view active">
          <div class="setup-section">
            <player-setup id="player-setup"></player-setup>
          </div>
          
          <div class="setup-section">
            <div class="action-buttons">
              <button id="start-game-button" class="primary-button">Start Game</button>
            </div>
          </div>
        </div>
        
        <!-- PLAY VIEW -->
        <div id="play-view" class="view play-view">
          <div class="game-section">
            <div class="round-info">
              <div class="round-number">Round <span id="round-number">1</span></div>
              <div class="current-judge">Judge: <span id="judge-name">-</span></div>
            </div>
            
            <game-scoreboard id="scoreboard"></game-scoreboard>
          </div>
          
          <div class="game-section">
            <alignment-grid id="alignment-grid"></alignment-grid>
          </div>
          
          <div class="game-section">
            <prompt-card id="prompt-card"></prompt-card>
          </div>
          
          <div class="game-section">
            <div id="sketch-phase-container" class="sketch-phase-container">
              <h3 class="phase-heading">Sketching Phase</h3>
              
              <div class="sketch-instructions">
                <div id="sketch-instructions-text">
                  Waiting for the judge to select a prompt and roll the alignment...
                </div>
              </div>
              
              <sketch-timer id="sketch-timer"></sketch-timer>
            </div>
          </div>
          
          <div class="game-section">
            <div id="judging-phase-container" class="judging-phase-container" style="display: none;">
              <h3 class="phase-heading">Judging Phase</h3>
              
              <div class="judging-instructions">
                <div id="judging-instructions-text">
                  Time to judge! Look at everyone's sketches and select a winner for this round.
                </div>
              </div>
              
              <div class="player-selection">
                <h4>Select Round Winner:</h4>
                <div id="player-selection-list" class="player-list">
                  <!-- Player options will be dynamically added here -->
                </div>
              </div>
              
              <div class="token-award-section">
                <h4 class="token-award-heading">Award Bonus Tokens (Optional):</h4>
                <div class="token-award-buttons" id="token-award-buttons">
                  <!-- Token award buttons will be dynamically added here -->
                </div>
              </div>
              
              <div class="action-buttons">
                <button id="confirm-winner-button" class="primary-button" disabled>Confirm Winner</button>
              </div>
            </div>
          </div>
          
          <div class="action-buttons">
            <button id="next-round-button" class="primary-button" style="display: none;">Next Round</button>
            <button id="end-game-button" class="danger-button">End Game</button>
          </div>
        </div>
        
        <!-- RESULTS VIEW -->
        <div id="results-view" class="view results-view">
          <h2>Game Over!</h2>
          
          <div class="winner-display">
            <div class="trophy-icon">🏆</div>
            <h3>Winner:</h3>
            <div class="winner-name" id="winner-name">Player 1</div>
          </div>
          
          <game-scoreboard id="final-scoreboard"></game-scoreboard>
          
          <div class="game-controls">
            <div class="action-buttons">
              <button id="new-game-button" class="primary-button">New Game</button>
              <button id="reset-game-button" class="secondary-button">Reset Game</button>
            </div>
          </div>
        </div>
      </div>
    `;
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
			logWarning("Player setup is not valid");
			return;
		}

		// Get player data
		const playerData = playerSetup.getPlayerData();
		if (!playerData || playerData.length < 3) {
			logWarning("Need at least 3 players to start");
			return;
		}

		// Set up initial game state
		setGameStarted(true);

		// Create the active deck from selected decks
		createActiveDeck(gameState.selectedDecks);

		// Update scoreboard
		const scoreboard = this.shadowRoot.getElementById("scoreboard");
		if (scoreboard) {
			scoreboard.setTokenTypes(getTokenTypes());
			scoreboard.updateScoreboard(
				gameState.players,
				gameState.currentPlayerIndex
			);
		}

		// Set up prompt card with initial judge
		const promptCard = this.shadowRoot.getElementById("prompt-card");
		if (promptCard) {
			promptCard.setIsJudge(true, gameState.currentPlayerIndex);
		}

		// Update judge display
		this.updateJudgeDisplay();

		// Update round number
		const roundNumber = this.shadowRoot.getElementById("round-number");
		if (roundNumber) {
			roundNumber.textContent = gameState.currentRound.toString();
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

		const currentJudge = getCurrentJudge();
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
			logWarning("No prompt selected when alignment was rolled");
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
		const contestants = getContestants();

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
		const tokenTypes = getTokenTypes();

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
		const contestants = getContestants();
		const actualPlayerIndex = contestants[playerIndexAttr]
			? gameState.players.indexOf(contestants[playerIndexAttr])
			: -1;

		if (actualPlayerIndex === -1) {
			logError("Could not find player to award token to");
			return;
		}

		// Award token
		awardToken(actualPlayerIndex, tokenType);

		// Play sound
		playSound("token_gain");

		// Update scoreboard
		const scoreboard = this.shadowRoot.getElementById("scoreboard");
		if (scoreboard) {
			scoreboard.updatePlayerTokens(
				actualPlayerIndex,
				gameState.players[actualPlayerIndex].tokens
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
		const contestants = getContestants();
		const actualPlayerIndex = contestants[playerIndexAttr]
			? gameState.players.indexOf(contestants[playerIndexAttr])
			: -1;

		if (actualPlayerIndex === -1) {
			logError("Could not find winning player");
			return;
		}

		// Set round winner
		setRoundWinner(actualPlayerIndex);

		// Award point
		awardPoint(actualPlayerIndex);

		// Play sound
		playSound("point_gain");

		// Update scoreboard
		const scoreboard = this.shadowRoot.getElementById("scoreboard");
		if (scoreboard) {
			const player = gameState.players[actualPlayerIndex];
			scoreboard.updatePlayerScore(actualPlayerIndex, player.score, true);
		}

		// Check for game winner
		const winner = checkForWinner();
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
		advanceToNextJudge();

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
			promptCard.setIsJudge(true, gameState.currentPlayerIndex);
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
			finalScoreboard.setTokenTypes(getTokenTypes());
			finalScoreboard.updateScoreboard(
				gameState.players,
				gameState.currentPlayerIndex
			);
		}

		// Find player with highest score to display as "winner"
		const highestScorePlayer = [...gameState.players].sort(
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
		resetGame(true);

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
		resetGame(false);

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
			roundNumber.textContent = gameState.currentRound.toString();
		}

		// Update judge name
		this.updateJudgeDisplay();

		// Update scoreboard
		const scoreboard = this.shadowRoot.getElementById("scoreboard");
		if (scoreboard) {
			scoreboard.updateScoreboard(
				gameState.players,
				gameState.currentPlayerIndex
			);
		}
	}

	/**
	 * Handle game end when a winner is determined
	 * @private
	 */
	handleGameEnd() {
		// Play win sound
		playSound("win");

		// Update winner display
		const winnerName = this.shadowRoot.getElementById("winner-name");
		if (winnerName && this.state.winner) {
			winnerName.textContent = this.state.winner.name;
		}

		// Update final scoreboard
		const finalScoreboard = this.shadowRoot.getElementById("final-scoreboard");
		if (finalScoreboard) {
			finalScoreboard.setTokenTypes(getTokenTypes());
			finalScoreboard.updateScoreboard(
				gameState.players,
				gameState.currentPlayerIndex
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
