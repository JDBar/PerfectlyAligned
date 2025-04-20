/**
 * Scoreboard Web Component
 *
 * Displays the current scores, tokens, and player information.
 *
 * @module components/scoreboard
 */

import { logError } from "../logger.js";
import { gameState } from "../gameState.js";
import { getTokenTypes } from "../tokens.js";

/**
 * Scoreboard Web Component
 * @extends HTMLElement
 */
export class Scoreboard extends HTMLElement {
	/**
	 * Create a new Scoreboard
	 */
	constructor() {
		super();

		// Create shadow DOM
		this.attachShadow({ mode: "open" });

		// Initialize state
		this.state = {
			targetScore: 5,
			players: [],
			currentJudgeIndex: 0,
			avatarBasePath: "/assets/images/avatars/",
			tokenTypes: {},
		};

		// Build component
		this.render();
	}

	/**
	 * Called when the element is added to the DOM
	 */
	connectedCallback() {
		// Dispatch connected event
		this.dispatchEvent(new CustomEvent("scoreboard-connected"));
	}

	/**
	 * Sets the target score needed to win
	 * @param {number} score - Target score
	 */
	setTargetScore(score) {
		this.state.targetScore = score;
		this.updateTargetScoreDisplay();
	}

	/**
	 * Sets the avatar base path
	 * @param {string} path - Path to avatars directory
	 */
	setAvatarBasePath(path) {
		this.state.avatarBasePath = path;
	}

	/**
	 * Sets the token types configuration
	 * @param {Object} tokenTypes - Token types configuration
	 */
	setTokenTypes(tokenTypes) {
		this.state.tokenTypes = tokenTypes;
	}

	/**
	 * Updates the scoreboard with current game state
	 * @param {Array<Object>} players - Array of player objects
	 * @param {number} judgeIndex - Index of current judge
	 */
	updateScoreboard(players, judgeIndex) {
		this.state.players = players;
		this.state.currentJudgeIndex = judgeIndex;

		this.renderScoreboard();
	}

	/**
	 * Render the initial component
	 * @private
	 */
	render() {
		this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--pixel-font, 'Press Start 2P', cursive);
        }
        
        .scoreboard-section {
          margin: 20px 0;
        }
        
        .scoreboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        h3 {
          margin: 0;
          color: #00ffff;
          text-shadow: 1px 1px 0px #ff00ff;
          font-size: 1.4em;
        }
        
        #target-score-display {
          color: #ffff00;
        }
        
        #scoreboard-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .player-score-item {
          display: flex;
          align-items: center;
          background-color: #1a0a2e;
          border: 2px solid #333333;
          border-radius: 5px;
          padding: 10px;
          margin-bottom: 10px;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .player-score-item.current-judge {
          border-color: #ff00ff;
          box-shadow: 0 0 10px rgba(255, 0, 255, 0.3);
        }
        
        .avatar-display-small {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          border: 2px solid #00ffff;
          margin-right: 10px;
          flex-shrink: 0;
        }
        
        .player-info {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .player-name-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .player-name-display {
          font-size: 1.1em;
          color: #ffffff;
          margin-right: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        
        .player-score {
          font-size: 1.2em;
          color: #ffff00;
          font-weight: bold;
          margin-left: auto;
          padding: 0 10px;
        }
        
        .token-display {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          font-size: 0.8em;
        }
        
        .token-display.no-tokens {
          color: #777777;
          font-style: italic;
        }
        
        .token-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 20px;
          padding: 2px 5px;
          border-radius: 10px;
          margin-right: 3px;
          font-size: 0.8em;
          color: #000000;
          font-weight: bold;
        }
        
        .token-mindReader {
          background-color: #00ffff;
        }
        
        .token-artBro {
          background-color: #ffff00;
        }
        
        .token-perfectlyAligned {
          background-color: #39ff14;
        }
        
        .token-psychopath {
          background-color: #ff00ff;
          color: #ffffff;
        }
        
        .judge-indicator {
          position: absolute;
          top: 5px;
          right: 5px;
          font-size: 0.7em;
          color: #ff00ff;
          background-color: #1a0a2e;
          padding: 2px 5px;
          border-radius: 5px;
          border: 1px solid #ff00ff;
        }
        
        .point-animation {
          animation: pointGainPulse 0.5s ease-out;
        }
        
        @keyframes pointGainPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @media (max-width: 768px) {
          .player-name-display {
            font-size: 1em;
            max-width: 120px;
          }
          
          .avatar-display-small {
            width: 30px;
            height: 30px;
          }
          
          .token-display {
            font-size: 0.7em;
          }
        }
        
        @media (max-width: 480px) {
          .player-score-item {
            padding: 8px;
          }
          
          .player-name-display {
            font-size: 0.9em;
            max-width: 100px;
          }
          
          .avatar-display-small {
            width: 25px;
            height: 25px;
          }
          
          .token-display {
            font-size: 0.7em;
          }
          
          .token-icon {
            height: 16px;
            padding: 1px 4px;
          }
        }
      </style>
      
      <div class="scoreboard-section">
        <div class="scoreboard-header">
          <h3>Scoreboard (Target: <span id="target-score-display">5</span>)</h3>
        </div>
        <ul id="scoreboard-list" aria-live="polite">
          <!-- Player scores will be populated here -->
          <li class="player-score-item">
            <div class="avatar-display-small"></div>
            <div class="player-info">
              <div class="player-name-row">
                <span class="player-name-display">Loading...</span>
                <span class="player-score">0</span>
              </div>
              <div class="token-display no-tokens">No tokens yet</div>
            </div>
          </li>
        </ul>
      </div>
    `;

		// Initialize target score display
		this.updateTargetScoreDisplay();
	}

	/**
	 * Updates the target score display
	 * @private
	 */
	updateTargetScoreDisplay() {
		const targetScoreDisplay = this.shadowRoot.getElementById(
			"target-score-display"
		);
		if (targetScoreDisplay) {
			targetScoreDisplay.textContent = this.state.targetScore.toString();
		}
	}

	/**
	 * Renders the scoreboard with current player data
	 * @private
	 */
	renderScoreboard() {
		const scoreboard = this.shadowRoot.getElementById("scoreboard-list");
		if (!scoreboard) return;

		// Clear existing entries
		scoreboard.innerHTML = "";

		// Add each player
		this.state.players.forEach((player, index) => {
			const isJudge = index === this.state.currentJudgeIndex;
			const playerItem = this.createPlayerScoreItem(player, index, isJudge);
			scoreboard.appendChild(playerItem);
		});
	}

	/**
	 * Creates a player score item element
	 * @param {Object} player - Player object
	 * @param {number} index - Player index
	 * @param {boolean} isJudge - Whether this player is the current judge
	 * @returns {HTMLElement} - List item element
	 * @private
	 */
	createPlayerScoreItem(player, index, isJudge) {
		const li = document.createElement("li");
		li.className = "player-score-item";
		li.dataset.playerIndex = index;

		if (isJudge) {
			li.classList.add("current-judge");
		}

		// Avatar
		const avatar = document.createElement("div");
		avatar.className = "avatar-display-small";
		if (player.avatar) {
			avatar.style.backgroundImage = `url('${this.state.avatarBasePath}${player.avatar}')`;
		}
		li.appendChild(avatar);

		// Player info container
		const playerInfo = document.createElement("div");
		playerInfo.className = "player-info";

		// Name and score row
		const nameRow = document.createElement("div");
		nameRow.className = "player-name-row";

		const nameDisplay = document.createElement("span");
		nameDisplay.className = "player-name-display";
		nameDisplay.textContent = player.name;
		nameRow.appendChild(nameDisplay);

		const scoreDisplay = document.createElement("span");
		scoreDisplay.className = "player-score";
		scoreDisplay.textContent = player.score.toString();
		nameRow.appendChild(scoreDisplay);

		playerInfo.appendChild(nameRow);

		// Token display
		const tokenDisplay = document.createElement("div");
		tokenDisplay.className = "token-display";

		// Check if player has any tokens
		const totalTokens = Object.values(player.tokens).reduce(
			(sum, count) => sum + count,
			0
		);

		if (totalTokens === 0) {
			tokenDisplay.classList.add("no-tokens");
			tokenDisplay.textContent = "No tokens yet";
		} else {
			// Add token counts
			for (const [tokenType, count] of Object.entries(player.tokens)) {
				if (count === 0) continue;

				const tokenElement = document.createElement("span");
				tokenElement.className = `token-count`;

				const tokenIcon = document.createElement("span");
				tokenIcon.className = `token-icon token-${tokenType}`;

				// Show token name if available
				let tokenName = tokenType;
				if (
					this.state.tokenTypes[tokenType] &&
					this.state.tokenTypes[tokenType].name
				) {
					tokenName = this.state.tokenTypes[tokenType].name;
				}

				tokenIcon.textContent = tokenName.slice(0, 1);
				tokenIcon.title = tokenName;

				tokenElement.appendChild(tokenIcon);
				tokenElement.appendChild(document.createTextNode(` ${count}`));

				tokenDisplay.appendChild(tokenElement);
			}
		}

		playerInfo.appendChild(tokenDisplay);
		li.appendChild(playerInfo);

		// Judge indicator
		if (isJudge) {
			const judgeIndicator = document.createElement("div");
			judgeIndicator.className = "judge-indicator";
			judgeIndicator.textContent = "Judge";
			li.appendChild(judgeIndicator);
		}

		return li;
	}

	/**
	 * Highlights a player who just gained a point
	 * @param {number} playerIndex - Index of player who gained a point
	 */
	animatePointGain(playerIndex) {
		const playerItem = this.shadowRoot.querySelector(
			`.player-score-item[data-player-index="${playerIndex}"]`
		);

		if (!playerItem) return;

		// Apply animation class
		playerItem.classList.add("point-animation");

		// Remove the class after animation completes
		setTimeout(() => {
			playerItem.classList.remove("point-animation");
		}, 500);
	}

	/**
	 * Update a specific player's score
	 * @param {number} playerIndex - Index of player to update
	 * @param {number} newScore - New score value
	 * @param {boolean} animate - Whether to animate the change
	 */
	updatePlayerScore(playerIndex, newScore, animate = false) {
		const playerItem = this.shadowRoot.querySelector(
			`.player-score-item[data-player-index="${playerIndex}"]`
		);

		if (!playerItem) return;

		const scoreDisplay = playerItem.querySelector(".player-score");
		if (scoreDisplay) {
			scoreDisplay.textContent = newScore.toString();

			if (animate) {
				this.animatePointGain(playerIndex);
			}
		}
	}

	/**
	 * Updates a player's tokens display
	 * @param {number} playerIndex - Index of player to update
	 * @param {Object} tokens - Object containing token counts
	 */
	updatePlayerTokens(playerIndex, tokens) {
		const playerItem = this.shadowRoot.querySelector(
			`.player-score-item[data-player-index="${playerIndex}"]`
		);

		if (!playerItem) return;

		const tokenDisplay = playerItem.querySelector(".token-display");
		if (!tokenDisplay) return;

		// Clear existing tokens
		tokenDisplay.innerHTML = "";

		// Check if player has any tokens
		const totalTokens = Object.values(tokens).reduce(
			(sum, count) => sum + count,
			0
		);

		if (totalTokens === 0) {
			tokenDisplay.classList.add("no-tokens");
			tokenDisplay.textContent = "No tokens yet";
		} else {
			tokenDisplay.classList.remove("no-tokens");

			// Add token counts
			for (const [tokenType, count] of Object.entries(tokens)) {
				if (count === 0) continue;

				const tokenElement = document.createElement("span");
				tokenElement.className = `token-count`;

				const tokenIcon = document.createElement("span");
				tokenIcon.className = `token-icon token-${tokenType}`;

				// Show token name if available
				let tokenName = tokenType;
				if (
					this.state.tokenTypes[tokenType] &&
					this.state.tokenTypes[tokenType].name
				) {
					tokenName = this.state.tokenTypes[tokenType].name;
				}

				tokenIcon.textContent = tokenName.slice(0, 1);
				tokenIcon.title = tokenName;

				tokenElement.appendChild(tokenIcon);
				tokenElement.appendChild(document.createTextNode(` ${count}`));

				tokenDisplay.appendChild(tokenElement);
			}
		}
	}
}

// Define the custom element
customElements.define("game-scoreboard", Scoreboard);
