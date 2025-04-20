/**
 * Prompt Card Web Component
 *
 * Displays random prompts and manages prompt selection.
 *
 * @module components/prompt-card
 */

import * as Logger from "../../lib/logger.js";
import * as Audio from "../../lib/audio.js";
import * as Deck from "../../lib/deck.js";
import * as GameState from "../../lib/gameState.js";
import * as Tokens from "../../lib/tokens.js";
import { ComponentBase } from "../component-base.js";

/**
 * Prompt Card Web Component
 * @extends ComponentBase
 */
export class PromptCard extends ComponentBase {
	/**
	 * Create a new PromptCard component
	 */
	constructor() {
		super(
			"./components/prompt-card/prompt-card.template.html",
			"./components/prompt-card/prompt-card.styles.css"
		);

		// Initialize state
		this.state = {
			prompts: [],
			selectedPromptIndex: null,
			isJudge: false,
			canReroll: false,
			judgePlayerIndex: -1,
		};
	}

	/**
	 * Called after the component is rendered
	 * Overrides the afterRender method from ComponentBase
	 */
	afterRender() {
		// Add event listeners
		this.addEventListeners();

		// Dispatch connected event
		this.dispatchEvent(new CustomEvent("prompt-card-connected"));
	}

	/**
	 * Called when the element is removed from the DOM
	 */
	disconnectedCallback() {
		// Clean up event listeners if necessary
	}

	/**
	 * Set whether the current user is the judge
	 * @param {boolean} isJudge - Whether the current user is the judge
	 * @param {number} judgePlayerIndex - Index of the judge player
	 */
	setIsJudge(isJudge, judgePlayerIndex) {
		this.state.isJudge = isJudge;
		this.state.judgePlayerIndex = judgePlayerIndex;
		this.updateButtonVisibility();
	}

	/**
	 * Set whether the reroll button should be enabled
	 * @param {boolean} canReroll - Whether reroll is allowed
	 */
	setCanReroll(canReroll) {
		this.state.canReroll = canReroll;
		this.updateButtonVisibility();
	}

	/**
	 * Add event listeners to the component
	 * @private
	 */
	addEventListeners() {
		// Get elements from shadow DOM
		const drawButton = this.shadowRoot.getElementById("draw-prompts-button");
		const redrawButton = this.shadowRoot.getElementById(
			"redraw-prompts-button"
		);
		const promptList = this.shadowRoot.getElementById("prompt-list");

		// Draw button click
		if (drawButton) {
			drawButton.addEventListener("click", () => this.handleDrawClick());
		}

		// Redraw button click
		if (redrawButton) {
			redrawButton.addEventListener("click", () => this.handleRedrawClick());
		}

		// Prompt item clicks
		if (promptList) {
			promptList.addEventListener("click", (event) => {
				if (event.target.classList.contains("prompt-choice")) {
					this.handlePromptClick(event);
				}
			});
		}
	}

	/**
	 * Updates the visibility of buttons based on state
	 * @private
	 */
	updateButtonVisibility() {
		const drawButton = this.shadowRoot.getElementById("draw-prompts-button");
		const redrawButton = this.shadowRoot.getElementById(
			"redraw-prompts-button"
		);

		if (!drawButton || !redrawButton) return;

		// Only show buttons if user is the judge
		if (this.state.isJudge) {
			drawButton.style.display =
				this.state.selectedPromptIndex === null ? "block" : "none";

			// Only show redraw if no prompt is selected and reroll is allowed
			redrawButton.style.display =
				this.state.prompts.length > 0 &&
				this.state.selectedPromptIndex === null &&
				this.state.canReroll
					? "block"
					: "none";
		} else {
			drawButton.style.display = "none";
			redrawButton.style.display = "none";
		}
	}

	/**
	 * Handles draw button click
	 * @private
	 */
	handleDrawClick() {
		if (!this.state.isJudge) return;

		// Draw 3 random prompts
		const prompts = Deck.drawRandomPrompts(3, true);

		if (prompts.length === 0) {
			Logger.logError("Failed to draw prompts - deck may be empty");
			return;
		}

		// Update state
		this.state.prompts = prompts;
		this.state.selectedPromptIndex = null;

		// Play sound
		Audio.playSound("draw_prompts");

		// Update the UI with animations
		this.updatePromptList(true);

		// Update game state
		GameState.setDisplayedPrompts(prompts);

		// Update button visibility
		this.updateButtonVisibility();

		// Update instructions
		const instructions = this.shadowRoot.getElementById("prompt-instructions");
		if (instructions) {
			instructions.textContent = "Judge: Select one of the prompts below!";
		}

		// Dispatch event
		this.dispatchEvent(
			new CustomEvent("prompts-drawn", {
				detail: { prompts },
			})
		);
	}

	/**
	 * Handles redraw button click
	 * @private
	 */
	handleRedrawClick() {
		if (!this.state.isJudge) return;

		// Check if player can afford reroll
		if (!Tokens.canAffordAction(this.state.judgePlayerIndex, "reroll")) {
			const instructions = this.shadowRoot.getElementById(
				"prompt-instructions"
			);
			if (instructions) {
				instructions.textContent = "Not enough tokens for a re-draw!";

				// Reset message after a delay
				setTimeout(() => {
					instructions.textContent = "Judge: Select one of the prompts below!";
				}, 2000);
			}
			return;
		}

		// Deduct token
		if (!Tokens.deductActionCost(this.state.judgePlayerIndex, "reroll")) {
			return;
		}

		// Return current prompts to the deck
		Deck.returnPromptsToDeck(this.state.prompts);

		// Draw new prompts
		const prompts = Deck.drawRandomPrompts(3, true);

		if (prompts.length === 0) {
			Logger.logError("Failed to redraw prompts - deck may be empty");
			return;
		}

		// Update state
		this.state.prompts = prompts;
		this.state.selectedPromptIndex = null;

		// Play sound
		Audio.playSound("draw_prompts");

		// Update the UI with animations
		this.updatePromptList(true);

		// Update game state
		GameState.setDisplayedPrompts(prompts);

		// Dispatch event
		this.dispatchEvent(
			new CustomEvent("prompts-redrawn", {
				detail: { prompts },
			})
		);
	}

	/**
	 * Handles prompt click
	 * @param {Event} event - Click event
	 * @private
	 */
	handlePromptClick(event) {
		if (!this.state.isJudge) return;

		// Get prompt index
		const promptIndex = parseInt(event.target.dataset.index, 10);
		if (
			isNaN(promptIndex) ||
			promptIndex < 0 ||
			promptIndex >= this.state.prompts.length
		)
			return;

		// Update state
		this.state.selectedPromptIndex = promptIndex;

		// Update UI
		this.updatePromptSelection();

		// Update button visibility
		this.updateButtonVisibility();

		// Update game state
		GameState.setChosenPrompt(this.state.prompts[promptIndex]);

		// Update instructions
		const instructions = this.shadowRoot.getElementById("prompt-instructions");
		if (instructions) {
			instructions.textContent = "Prompt locked in! Time to sketch!";
		}

		// Dispatch event
		this.dispatchEvent(
			new CustomEvent("prompt-selected", {
				detail: { prompt: this.state.prompts[promptIndex], index: promptIndex },
			})
		);
	}

	/**
	 * Updates the prompt list with current prompts
	 * @param {boolean} animate - Whether to animate the update
	 * @private
	 */
	updatePromptList(animate = false) {
		const promptList = this.shadowRoot.getElementById("prompt-list");
		if (!promptList) return;

		// Clear existing prompts
		promptList.innerHTML = "";

		// Add each prompt
		this.state.prompts.forEach((prompt, index) => {
			const li = document.createElement("li");
			li.className = "prompt-choice";
			if (animate) {
				li.classList.add("deal-animation");
				// Stagger animations
				li.style.animationDelay = `${index * 0.1}s`;
			}

			li.textContent = prompt;
			li.dataset.index = index;

			promptList.appendChild(li);
		});

		// If no prompts, show placeholders
		if (this.state.prompts.length === 0) {
			for (let i = 0; i < 3; i++) {
				const li = document.createElement("li");
				li.className = "prompt-choice";
				li.textContent = "-";
				promptList.appendChild(li);
			}
		}
	}

	/**
	 * Updates the UI to reflect prompt selection
	 * @private
	 */
	updatePromptSelection() {
		const promptItems = this.shadowRoot.querySelectorAll(".prompt-choice");

		promptItems.forEach((item, index) => {
			// Clear existing classes
			item.classList.remove("selected", "disabled");

			// Add appropriate class
			if (this.state.selectedPromptIndex === index) {
				item.classList.add("selected");
			} else if (this.state.selectedPromptIndex !== null) {
				item.classList.add("disabled");
			}
		});
	}

	/**
	 * Resets the component state for a new round
	 */
	reset() {
		this.state.prompts = [];
		this.state.selectedPromptIndex = null;

		// Update UI
		this.updatePromptList();
		this.updateButtonVisibility();

		// Update instructions
		const instructions = this.shadowRoot.getElementById("prompt-instructions");
		if (instructions) {
			instructions.textContent = 'Judge: Click "Draw Prompts" or lock it in!';
		}
	}

	/**
	 * Gets the currently selected prompt
	 * @returns {string|null} - Selected prompt or null if none selected
	 */
	getSelectedPrompt() {
		if (this.state.selectedPromptIndex === null) return null;
		return this.state.prompts[this.state.selectedPromptIndex];
	}

	/**
	 * Gets all currently displayed prompts
	 * @returns {Array<string>} - Array of prompt strings
	 */
	getPrompts() {
		return [...this.state.prompts];
	}
}

// Define the custom element
customElements.define("prompt-card", PromptCard);
