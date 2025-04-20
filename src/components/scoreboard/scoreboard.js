/**
 * Scoreboard Web Component
 *
 * Displays the current scores, tokens, and player information.
 *
 * @module components/scoreboard
 */

import { ComponentBase } from "../component-base.js";

/**
 * Scoreboard Web Component
 * @extends ComponentBase
 */
export class Scoreboard extends ComponentBase {
	/**
	 * Create a new Scoreboard
	 */
	constructor() {
		super(
			"./components/scoreboard/scoreboard.template.html",
			"./components/scoreboard/scoreboard.styles.css"
		);

		// Initialize state
		this.state = {
			targetScore: 5,
			players: [],
			currentJudgeIndex: 0,
			avatarBasePath: "assets/images/avatars/",
			tokenTypes: {},
		};
	}

	/**
	 * Called after the component is rendered
	 * Overrides the afterRender method from ComponentBase
	 */
	afterRender() {
		// Initialize target score display
		this.updateTargetScoreDisplay();

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
