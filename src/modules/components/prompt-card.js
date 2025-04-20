/**
 * Prompt Card Web Component
 *
 * Displays random prompts and manages prompt selection.
 *
 * @module components/prompt-card
 */

import { logError } from "../logger.js";
import { playSound } from "../audio.js";
import { drawRandomPrompts, returnPromptsToDeck } from "../deck.js";
import { setDisplayedPrompts, setChosenPrompt } from "../gameState.js";
import { canAffordAction, deductActionCost } from "../tokens.js";

/**
 * Prompt Card Web Component
 * @extends HTMLElement
 */
export class PromptCard extends HTMLElement {
	/**
	 * Create a new PromptCard component
	 */
	constructor() {
		super();

		// Create shadow DOM
		this.attachShadow({ mode: "open" });

		// Initialize state
		this.state = {
			prompts: [],
			selectedPromptIndex: null,
			isJudge: false,
			canReroll: false,
			judgePlayerIndex: -1,
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
	 * Render the component
	 * @private
	 */
	render() {
		this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--pixel-font, 'Press Start 2P', cursive);
        }
        
        .prompt-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 20px 0;
        }
        
        #draw-prompts-button,
        #redraw-prompts-button {
          background-color: #0d0517;
          color: #ffff00;
          border: 2px solid #00ffff;
          padding: 10px 20px;
          font-family: var(--pixel-font, 'Press Start 2P', cursive);
          font-size: 1em;
          margin-bottom: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        #draw-prompts-button:hover,
        #redraw-prompts-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 5px rgba(0, 255, 255, 0.5);
        }
        
        #draw-prompts-button:active,
        #redraw-prompts-button:active {
          transform: translateY(0);
        }
        
        #redraw-prompts-button {
          background-color: #1a0a2e;
          color: #ff00ff;
        }
        
        .prompt-display-area {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .instructions {
          color: #00ffff;
          text-align: center;
          margin-bottom: 15px;
          font-size: 0.9em;
        }
        
        #prompt-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .prompt-choice {
          background-color: #1a0a2e;
          border: 2px solid #333333;
          border-radius: 5px;
          padding: 15px;
          cursor: pointer;
          color: #ffffff;
          transition: all 0.3s ease;
          position: relative;
          font-family: var(--readable-font, 'Courier New', monospace);
          font-size: 1.1em;
        }
        
        .prompt-choice:hover {
          border-color: #00ffff;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
          transform: translateY(-2px);
        }
        
        .prompt-choice.selected {
          border-color: #ff00ff;
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.7);
          background-color: #34145a;
          font-weight: bold;
        }
        
        .prompt-choice.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          border-color: #333333;
          box-shadow: none;
          transform: none;
        }
        
        @keyframes dealPromptCard {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .prompt-choice.deal-animation {
          animation: dealPromptCard 0.3s ease-out forwards;
        }
        
        @media (max-width: 768px) {
          #prompt-list {
            gap: 10px;
          }
          
          .prompt-choice {
            padding: 10px;
            font-size: 1em;
          }
        }
        
        @media (max-width: 480px) {
          .prompt-choice {
            padding: 8px;
            font-size: 0.9em;
          }
        }
      </style>
      
      <div class="prompt-section">
        <button id="draw-prompts-button" type="button">Draw Prompts!</button>
        <button id="redraw-prompts-button" type="button" style="display: none;">Re-draw Prompts (Cost: 1 Token)</button>
        
        <div class="prompt-display-area">
          <p class="instructions" id="prompt-instructions">Judge: Click "Draw Prompts" or lock it in!</p>
          <ul id="prompt-list">
            <!-- Prompts will be populated here -->
            <li class="prompt-choice">-</li>
            <li class="prompt-choice">-</li>
            <li class="prompt-choice">-</li>
          </ul>
        </div>
      </div>
    `;
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
		const prompts = drawRandomPrompts(3, true);

		if (prompts.length === 0) {
			logError("Failed to draw prompts - deck may be empty");
			return;
		}

		// Update state
		this.state.prompts = prompts;
		this.state.selectedPromptIndex = null;

		// Play sound
		playSound("draw_prompts");

		// Update the UI with animations
		this.updatePromptList(true);

		// Update game state
		setDisplayedPrompts(prompts);

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
		if (!canAffordAction(this.state.judgePlayerIndex, "reroll")) {
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
		if (!deductActionCost(this.state.judgePlayerIndex, "reroll")) {
			return;
		}

		// Return current prompts to the deck
		returnPromptsToDeck(this.state.prompts);

		// Draw new prompts
		const prompts = drawRandomPrompts(3, true);

		if (prompts.length === 0) {
			logError("Failed to redraw prompts - deck may be empty");
			return;
		}

		// Update state
		this.state.prompts = prompts;
		this.state.selectedPromptIndex = null;

		// Play sound
		playSound("draw_prompts");

		// Update the UI with animations
		this.updatePromptList(true);

		// Update game state
		setDisplayedPrompts(prompts);

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
		setChosenPrompt(this.state.prompts[promptIndex]);

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
