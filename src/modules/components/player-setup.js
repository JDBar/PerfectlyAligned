/**
 * Player Setup Web Component
 *
 * Handles player name input and avatar selection for game setup.
 *
 * @module components/player-setup
 */

import { logError, displayError, clearError } from "../logger.js";

/**
 * Player Setup Web Component
 * @extends HTMLElement
 */
export class PlayerSetup extends HTMLElement {
	/**
	 * Create a new PlayerSetup
	 */
	constructor() {
		super();

		// Create shadow DOM
		this.attachShadow({ mode: "open" });

		// Initialize state
		this.state = {
			availableAvatars: [],
			selectedAvatars: [],
			playerCount: 3,
			avatarBasePath: "/assets/images/avatars/",
		};

		// Build component
		this.render();
	}

	/**
	 * Called when the element is added to the DOM
	 */
	connectedCallback() {
		// Add event listeners
		this.addEventListeners();

		// Dispatch connected event
		this.dispatchEvent(new CustomEvent("player-setup-connected"));
	}

	/**
	 * Called when the element is removed from the DOM
	 */
	disconnectedCallback() {
		// Clean up event listeners if necessary
	}

	/**
	 * Set avatar data for the component
	 * @param {Object} avatarData - Object containing avatar information
	 */
	setAvatarData(avatarData) {
		if (avatarData.avatars && Array.isArray(avatarData.avatars)) {
			this.state.availableAvatars = avatarData.avatars;
		}

		if (avatarData.basePath) {
			this.state.avatarBasePath = avatarData.basePath;
		}

		// Re-render with new data
		this.updatePlayerInputs();
	}

	/**
	 * Set the number of players
	 * @param {number} count - Number of players
	 */
	setPlayerCount(count) {
		this.state.playerCount = count;
		this.updatePlayerInputs();
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
        
        .player-names-area {
          margin: 15px 0;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .player-names-row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px 30px;
          justify-content: center;
        }
        
        .player-name-entry {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #1a0a2e;
          border: 2px solid #00ffff;
          border-radius: 8px;
          padding: 15px;
          width: 220px;
          position: relative;
        }
        
        .player-name-entry label {
          font-size: 0.9em;
          margin-bottom: 10px;
          color: #00ffff;
          text-align: center;
        }
        
        .avatar-selection-area {
          display: flex;
          align-items: center;
          margin: 10px 0;
          position: relative;
        }
        
        .avatar-preview {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          border: 2px solid #ff00ff;
          margin: 0 5px;
          position: relative;
        }
        
        .avatar-preview.avatar-taken {
          filter: grayscale(100%);
          opacity: 0.5;
          border-color: #777777;
        }
        
        .avatar-cycle-button {
          background-color: #0d0517;
          color: #00ffff;
          border: 1px solid #00ffff;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
          line-height: 1;
        }
        
        .avatar-cycle-button:hover {
          background-color: #1a0a2e;
          box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
        }
        
        .avatar-cycle-button:active {
          transform: scale(0.95);
        }
        
        .avatar-cycle-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .avatar-taken-message {
          position: absolute;
          bottom: -20px;
          left: 0;
          right: 0;
          text-align: center;
          color: #ff3333;
          font-size: 0.8em;
          visibility: hidden;
        }
        
        .avatar-taken-message.visible {
          visibility: visible;
        }
        
        input[type="text"] {
          background-color: #0d0517;
          border: 2px solid #00ffff;
          padding: 8px 12px;
          color: #ffffff;
          font-family: var(--readable-font, 'Courier New', monospace);
          font-size: 1em;
          width: 80%;
          border-radius: 4px;
          margin-top: 10px;
        }
        
        input[type="text"]:focus {
          outline: none;
          box-shadow: 0 0 5px #00ffff;
        }
        
        input[type="text"]:invalid {
          border-color: #ff3333;
          box-shadow: 0 0 5px #ff3333;
        }
        
        .error-message {
          color: #ff3333;
          font-size: 0.8em;
          margin-top: 5px;
          display: none;
        }
        
        .error-message.visible {
          display: block;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .player-name-entry {
            width: 180px;
            padding: 10px;
          }
          
          .avatar-preview {
            width: 40px;
            height: 40px;
          }
          
          input[type="text"] {
            font-size: 0.9em;
            padding: 6px 10px;
          }
        }
        
        @media (max-width: 480px) {
          .player-names-row {
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }
          
          .player-name-entry {
            width: 90%;
            max-width: 280px;
          }
        }
      </style>
      
      <div class="player-names-area">
        <div class="player-names-row" id="player-inputs-container">
          <!-- Player inputs will be dynamically generated here -->
        </div>
        <div class="error-message" id="players-error-message"></div>
      </div>
    `;

		// Initial update of player inputs
		this.updatePlayerInputs();
	}

	/**
	 * Add event listeners to the component
	 * @private
	 */
	addEventListeners() {
		// No global event listeners needed initially
		// Individual input event listeners are added when inputs are created
	}

	/**
	 * Update player input fields based on player count
	 * @private
	 */
	updatePlayerInputs() {
		const container = this.shadowRoot.getElementById("player-inputs-container");
		if (!container) return;

		// Clear existing inputs
		container.innerHTML = "";

		// Reset selected avatars
		this.state.selectedAvatars = [];

		// Create inputs for each player
		for (let i = 0; i < this.state.playerCount; i++) {
			const playerEntry = this.createPlayerEntry(i);
			container.appendChild(playerEntry);
		}
	}

	/**
	 * Create a player name entry element
	 * @param {number} index - Player index
	 * @returns {HTMLElement} - Player entry element
	 * @private
	 */
	createPlayerEntry(index) {
		const entry = document.createElement("div");
		entry.className = "player-name-entry";
		entry.dataset.playerIndex = index;

		// Create label
		const label = document.createElement("label");
		label.textContent = `Player ${index + 1} Name:`;
		label.htmlFor = `player-name-${index}`;
		entry.appendChild(label);

		// Create input
		const input = document.createElement("input");
		input.type = "text";
		input.id = `player-name-${index}`;
		input.name = `player-name-${index}`;
		input.maxLength = 10;
		input.placeholder = "Max 10 chars";
		input.required = true;
		input.dataset.playerIndex = index;
		entry.appendChild(input);

		// Create avatar selection area
		const avatarArea = document.createElement("div");
		avatarArea.className = "avatar-selection-area";

		// Previous button
		const prevButton = document.createElement("button");
		prevButton.type = "button";
		prevButton.className = "avatar-cycle-button prev";
		prevButton.innerHTML = "&lt;";
		prevButton.dataset.direction = "prev";
		prevButton.dataset.playerIndex = index;
		prevButton.addEventListener("click", (e) => this.handleAvatarCycle(e));
		avatarArea.appendChild(prevButton);

		// Avatar preview
		const avatar = document.createElement("div");
		avatar.className = "avatar-preview";
		avatar.id = `avatar-preview-${index}`;
		avatar.dataset.playerIndex = index;
		avatarArea.appendChild(avatar);

		// Next button
		const nextButton = document.createElement("button");
		nextButton.type = "button";
		nextButton.className = "avatar-cycle-button next";
		nextButton.innerHTML = "&gt;";
		nextButton.dataset.direction = "next";
		nextButton.dataset.playerIndex = index;
		nextButton.addEventListener("click", (e) => this.handleAvatarCycle(e));
		avatarArea.appendChild(nextButton);

		// Avatar taken message
		const avatarTakenMsg = document.createElement("div");
		avatarTakenMsg.className = "avatar-taken-message";
		avatarTakenMsg.id = `avatar-taken-message-${index}`;
		avatarTakenMsg.textContent = "Avatar already chosen!";
		avatarArea.appendChild(avatarTakenMsg);

		entry.appendChild(avatarArea);

		// Add event listeners
		input.addEventListener("input", (e) => this.validatePlayerName(e.target));

		// Set initial avatar
		this.setInitialAvatar(index);

		return entry;
	}

	/**
	 * Set the initial avatar for a player
	 * @param {number} playerIndex - Player index
	 * @private
	 */
	setInitialAvatar(playerIndex) {
		if (this.state.availableAvatars.length === 0) return;

		// Choose an avatar that isn't already selected
		let avatarIndex = playerIndex % this.state.availableAvatars.length;
		let attempts = 0;
		const maxAttempts = this.state.availableAvatars.length;

		while (
			attempts < maxAttempts &&
			this.state.selectedAvatars.includes(
				this.state.availableAvatars[avatarIndex].id
			)
		) {
			avatarIndex = (avatarIndex + 1) % this.state.availableAvatars.length;
			attempts++;
		}

		const avatar = this.state.availableAvatars[avatarIndex];
		this.state.selectedAvatars[playerIndex] = avatar.id;

		// Update preview
		const preview = this.shadowRoot.getElementById(
			`avatar-preview-${playerIndex}`
		);
		if (preview) {
			preview.style.backgroundImage = `url('${this.state.avatarBasePath}${avatar.filename}')`;
			preview.dataset.avatarId = avatar.id;
		}
	}

	/**
	 * Handle avatar cycling button click
	 * @param {Event} event - Click event
	 * @private
	 */
	handleAvatarCycle(event) {
		const direction = event.target.dataset.direction;
		const playerIndex = parseInt(event.target.dataset.playerIndex, 10);

		if (isNaN(playerIndex) || !this.state.availableAvatars.length) return;

		// Get current avatar index
		const currentAvatarId = this.state.selectedAvatars[playerIndex];
		let currentIndex = this.state.availableAvatars.findIndex(
			(avatar) => avatar.id === currentAvatarId
		);
		if (currentIndex === -1) currentIndex = 0;

		// Calculate new index
		let newIndex;
		if (direction === "next") {
			newIndex = (currentIndex + 1) % this.state.availableAvatars.length;
		} else {
			newIndex =
				(currentIndex - 1 + this.state.availableAvatars.length) %
				this.state.availableAvatars.length;
		}

		// Update avatar
		const newAvatar = this.state.availableAvatars[newIndex];
		this.state.selectedAvatars[playerIndex] = newAvatar.id;

		// Update preview
		const preview = this.shadowRoot.getElementById(
			`avatar-preview-${playerIndex}`
		);
		if (preview) {
			preview.style.backgroundImage = `url('${this.state.avatarBasePath}${newAvatar.filename}')`;
			preview.dataset.avatarId = newAvatar.id;
		}
	}

	/**
	 * Validate player name input
	 * @param {HTMLInputElement} input - The input element
	 * @private
	 */
	validatePlayerName(input) {
		const value = input.value.trim();

		if (value.length === 0) {
			input.setCustomValidity("Please enter a player name");
		} else if (
			this.isDuplicateName(value, parseInt(input.dataset.playerIndex, 10))
		) {
			input.setCustomValidity("Player names must be unique");
		} else {
			input.setCustomValidity("");
		}

		// Trigger validation UI
		input.reportValidity();
	}

	/**
	 * Check if a name is a duplicate
	 * @param {string} name - Name to check
	 * @param {number} currentIndex - Current player index
	 * @returns {boolean} - Whether the name is a duplicate
	 * @private
	 */
	isDuplicateName(name, currentIndex) {
		const inputs = this.shadowRoot.querySelectorAll('input[type="text"]');

		for (let i = 0; i < inputs.length; i++) {
			const input = inputs[i];
			const playerIndex = parseInt(input.dataset.playerIndex, 10);

			if (
				playerIndex !== currentIndex &&
				input.value.trim().toLowerCase() === name.toLowerCase()
			) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Validate all player inputs
	 * @returns {boolean} - Whether all inputs are valid
	 */
	validateAllInputs() {
		const inputs = this.shadowRoot.querySelectorAll('input[type="text"]');
		const errorMessage = this.shadowRoot.getElementById(
			"players-error-message"
		);

		// Check for empty names
		const emptyInputs = Array.from(inputs).filter(
			(input) => !input.value.trim()
		);
		if (emptyInputs.length > 0) {
			if (errorMessage) {
				errorMessage.textContent = "All player names are required";
				errorMessage.classList.add("visible");
			}
			return false;
		}

		// Check for duplicate names
		const names = new Set();
		const duplicates = [];

		inputs.forEach((input) => {
			const name = input.value.trim().toLowerCase();
			if (names.has(name)) {
				duplicates.push(input);
			} else {
				names.add(name);
			}
		});

		if (duplicates.length > 0) {
			if (errorMessage) {
				errorMessage.textContent = "All player names must be unique";
				errorMessage.classList.add("visible");
			}
			return false;
		}

		// Check for duplicate avatars
		const avatarIds = new Set();
		const duplicateAvatars = [];

		for (let i = 0; i < this.state.playerCount; i++) {
			const avatarId = this.state.selectedAvatars[i];
			if (avatarIds.has(avatarId)) {
				duplicateAvatars.push(i);
			} else {
				avatarIds.add(avatarId);
			}
		}

		if (duplicateAvatars.length > 0) {
			if (errorMessage) {
				errorMessage.textContent = "Players cannot use the same avatar";
				errorMessage.classList.add("visible");

				// Highlight the duplicates
				duplicateAvatars.forEach((playerIndex) => {
					const preview = this.shadowRoot.getElementById(
						`avatar-preview-${playerIndex}`
					);
					if (preview) {
						preview.classList.add("avatar-taken");
						setTimeout(() => {
							preview.classList.remove("avatar-taken");
						}, 2000);
					}
				});
			}
			return false;
		}

		// All valid
		if (errorMessage) {
			errorMessage.textContent = "";
			errorMessage.classList.remove("visible");
		}

		return true;
	}

	/**
	 * Get the player data from inputs
	 * @returns {Array<Object>} - Array of player objects
	 */
	getPlayerData() {
		if (!this.validateAllInputs()) {
			return null;
		}

		const inputs = this.shadowRoot.querySelectorAll('input[type="text"]');
		const players = [];

		inputs.forEach((input) => {
			const playerIndex = parseInt(input.dataset.playerIndex, 10);
			const avatarPreview = this.shadowRoot.getElementById(
				`avatar-preview-${playerIndex}`
			);

			if (avatarPreview) {
				const avatarId = avatarPreview.dataset.avatarId;
				const avatar = this.state.availableAvatars.find(
					(a) => a.id === avatarId
				);

				players.push({
					name: input.value.trim(),
					avatar: avatar ? avatar.filename : null,
					avatarId: avatarId,
				});
			}
		});

		return players;
	}
}

// Define the custom element
customElements.define("player-setup", PlayerSetup);
