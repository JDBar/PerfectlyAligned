/**
 * Player Setup Web Component
 *
 * Handles player name input and avatar selection for game setup.
 *
 * @module components/player-setup
 */

import { ComponentBase } from "../component-base.js";

/**
 * Player Setup Web Component
 * @extends ComponentBase
 */
export class PlayerSetup extends ComponentBase {
	/**
	 * Create a new PlayerSetup
	 */
	constructor() {
		super(
			"./components/player-setup/player-setup.template.html",
			"./components/player-setup/player-setup.styles.css"
		);

		// Initialize state
		this.state = {
			availableAvatars: [],
			selectedAvatars: [],
			playerCount: 3,
			minPlayers: 3,
			maxPlayers: 8,
			avatarBasePath: "/assets/images/avatars/",
		};
	}

	/**
	 * Called after the component is rendered
	 * Overrides the afterRender method from ComponentBase
	 */
	afterRender() {
		// Set up player count controls
		this.setupPlayerCountControls();

		// Initial update of player inputs
		this.updatePlayerInputs();
	}

	/**
	 * Set up player count controls
	 * @private
	 */
	setupPlayerCountControls() {
		const decreaseBtn = this.shadowRoot.getElementById("decrease-player-count");
		const increaseBtn = this.shadowRoot.getElementById("increase-player-count");
		const countDisplay = this.shadowRoot.getElementById("player-count-display");

		if (decreaseBtn && increaseBtn && countDisplay) {
			// Update display
			countDisplay.textContent = this.state.playerCount;

			// Add event listeners
			decreaseBtn.addEventListener("click", () => {
				if (this.state.playerCount > this.state.minPlayers) {
					this.state.playerCount--;
					countDisplay.textContent = this.state.playerCount;
					this.updatePlayerInputs();

					// Enable increase button if it was disabled
					increaseBtn.disabled = false;

					// Disable decrease button if at minimum
					if (this.state.playerCount <= this.state.minPlayers) {
						decreaseBtn.disabled = true;
					}

					// Dispatch event for player count change
					this.dispatchEvent(
						new CustomEvent("player-count-changed", {
							detail: { count: this.state.playerCount },
						})
					);
				}
			});

			increaseBtn.addEventListener("click", () => {
				if (this.state.playerCount < this.state.maxPlayers) {
					this.state.playerCount++;
					countDisplay.textContent = this.state.playerCount;
					this.updatePlayerInputs();

					// Enable decrease button if it was disabled
					decreaseBtn.disabled = false;

					// Disable increase button if at maximum
					if (this.state.playerCount >= this.state.maxPlayers) {
						increaseBtn.disabled = true;
					}

					// Dispatch event for player count change
					this.dispatchEvent(
						new CustomEvent("player-count-changed", {
							detail: { count: this.state.playerCount },
						})
					);
				}
			});

			// Initial button state
			decreaseBtn.disabled = this.state.playerCount <= this.state.minPlayers;
			increaseBtn.disabled = this.state.playerCount >= this.state.maxPlayers;
		}
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

		// Dispatch player-setup-complete event when validation passes
		this.dispatchEvent(
			new CustomEvent("player-setup-complete", {
				detail: { players: this.getPlayerData() },
			})
		);

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

	/**
	 * Reset the component
	 */
	reset() {
		// Reset state
		this.state.selectedAvatars = [];

		// Update UI
		this.updatePlayerInputs();
	}
}

// Define the custom element
customElements.define("player-setup", PlayerSetup);
