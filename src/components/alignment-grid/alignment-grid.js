/**
 * Alignment Grid Web Component
 *
 * Displays and manages the D&D alignment grid, allowing users to roll
 * for a random alignment or manually select one.
 *
 * @module components/alignment-grid
 */

import * as Logger from "../../lib/logger.js";
import * as Audio from "../../lib/audio.js";
import * as GameState from "../../lib/gameState.js";
import { ComponentBase } from "../component-base.js";

/**
 * Alignment Grid Web Component
 * @extends ComponentBase
 */
export class AlignmentGrid extends ComponentBase {
	/**
	 * Create a new AlignmentGrid
	 */
	constructor() {
		super(
			"./components/alignment-grid/alignment-grid.template.html",
			"./components/alignment-grid/alignment-grid.styles.css"
		);

		// Initialize state
		this.state = {
			currentAlignment: null,
			recentAlignments: [],
			isRolling: false,
			isJudgeChoice: false,
		};

		// Alignment data
		this.alignments = ["LG", "NG", "CG", "LN", "TN", "CN", "LE", "NE", "CE"];
	}

	/**
	 * Called after the component is rendered
	 * Overrides the afterRender method from ComponentBase
	 */
	afterRender() {
		this.addEventListeners();
	}

	/**
	 * Add event listeners to the component
	 * @private
	 */
	addEventListeners() {
		// Get elements from shadow DOM
		const rollButton = this.shadowRoot.getElementById("roll-button");
		const grid = this.shadowRoot.getElementById("alignment-chart-grid");

		// Roll button click
		if (rollButton) {
			rollButton.addEventListener("click", () => this.handleRollClick());
		}

		// Grid cell clicks
		if (grid) {
			grid.addEventListener("click", (event) => {
				if (event.target.classList.contains("alignment-cell")) {
					this.handleAlignmentClick(event);
				}
			});

			// Grid cell hover
			grid.addEventListener("mouseover", (event) => {
				if (event.target.classList.contains("alignment-cell")) {
					this.handleAlignmentHover(event);
				}
			});

			// Grid cell hover end
			grid.addEventListener("mouseout", (event) => {
				if (event.target.classList.contains("alignment-cell")) {
					this.handleAlignmentHoverEnd(event);
				}
			});
		}
	}

	/**
	 * Loads alignment examples from JSON
	 * @param {string} url - URL to the alignments.json file
	 * @returns {Promise<boolean>} - Promise resolving to whether loading was successful
	 */
	async loadAlignmentExamples(url) {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch alignment examples: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();

			if (data.alignmentExamples) {
				this.alignmentExamples = data.alignmentExamples;
				return true;
			}

			return false;
		} catch (error) {
			Logger.logError(`Error loading alignment examples: ${error.message}`);
			return false;
		}
	}

	/**
	 * Sets the alignment examples for display
	 * @param {Object} examples - Map of alignment codes to example HTML
	 */
	setAlignmentExamples(examples) {
		this.alignmentExamples = examples;
	}

	/**
	 * Shows alignment examples for a specific alignment
	 * @param {string} alignment - Alignment code (e.g., "LG")
	 * @private
	 */
	showAlignmentExample(alignment) {
		const examplesElement =
			this.shadowRoot.getElementById("alignment-examples");

		if (!examplesElement) return;

		if (this.alignmentExamples && this.alignmentExamples[alignment]) {
			examplesElement.innerHTML = this.alignmentExamples[alignment];
		} else {
			examplesElement.innerHTML = `<p><em>No examples available for ${alignment}</em></p>`;
		}
	}

	/**
	 * Handles roll button click
	 * @private
	 */
	handleRollClick() {
		if (this.state.isRolling) return;

		this.state.isRolling = true;
		Audio.playSound("roll");

		// Update die display
		const dieDisplay = this.shadowRoot.getElementById("die-display");
		if (dieDisplay) {
			dieDisplay.classList.add("rolling");
			dieDisplay.textContent = "?";
		}

		// Simulate rolling animation
		let rollCount = 0;
		const maxRolls = 10;
		const rollInterval = setInterval(() => {
			rollCount++;

			// Show random alignment during rolling
			const randomAlignment = this.getRandomAlignment();
			if (dieDisplay) {
				dieDisplay.textContent = randomAlignment;
			}

			// End rolling after maximum rolls
			if (rollCount >= maxRolls) {
				clearInterval(rollInterval);
				this.finalizeRoll();
			}
		}, 100);
	}

	/**
	 * Finalizes the roll animation and sets the alignment
	 * @private
	 */
	finalizeRoll() {
		// Get a random alignment that wasn't recently rolled
		const alignment = this.getRandomAlignment(true);

		// Update die display
		const dieDisplay = this.shadowRoot.getElementById("die-display");
		if (dieDisplay) {
			dieDisplay.classList.remove("rolling");
			dieDisplay.textContent = alignment;
		}

		// Highlight the selected alignment in the grid
		this.highlightAlignment(alignment);

		// Track this alignment in recent rolls
		this.trackRecentAlignment(alignment);

		// Update game state
		GameState.setCurrentAlignment(alignment);

		// Show examples
		this.showAlignmentExample(alignment);

		// End rolling state
		this.state.isRolling = false;

		// Dispatch event
		this.dispatchEvent(
			new CustomEvent("alignment-rolled", {
				detail: { alignment },
			})
		);
	}

	/**
	 * Gets a random alignment, optionally avoiding recent alignments
	 * @param {boolean} avoidRecent - Whether to avoid recently rolled alignments
	 * @returns {string} - Randomly selected alignment
	 * @private
	 */
	getRandomAlignment(avoidRecent = false) {
		if (!avoidRecent || this.state.recentAlignments.length === 0) {
			// Simple random selection
			const randomIndex = Math.floor(Math.random() * this.alignments.length);
			return this.alignments[randomIndex];
		}

		// Filter out recent alignments if there are enough alignments left
		const availableAlignments = this.alignments.filter(
			(alignment) => !this.state.recentAlignments.includes(alignment)
		);

		// If all alignments have been used recently, just pick a random one
		if (availableAlignments.length === 0) {
			const randomIndex = Math.floor(Math.random() * this.alignments.length);
			return this.alignments[randomIndex];
		}

		// Pick a random alignment from the available ones
		const randomIndex = Math.floor(Math.random() * availableAlignments.length);
		return availableAlignments[randomIndex];
	}

	/**
	 * Tracks an alignment in the recent rolls list
	 * @param {string} alignment - Alignment to track
	 * @private
	 */
	trackRecentAlignment(alignment) {
		this.state.recentAlignments.push(alignment);

		// Keep only the most recent 3 alignments
		if (this.state.recentAlignments.length > 3) {
			this.state.recentAlignments.shift();
		}

		this.state.currentAlignment = alignment;
	}

	/**
	 * Highlights an alignment in the grid
	 * @param {string} alignment - Alignment to highlight
	 * @private
	 */
	highlightAlignment(alignment) {
		// Clear any previous highlights
		const cells = this.shadowRoot.querySelectorAll(".alignment-cell");
		cells.forEach((cell) => cell.classList.remove("highlighted"));

		// Highlight the new alignment
		const alignmentCell = this.shadowRoot.querySelector(
			`.alignment-cell[data-alignment="${alignment}"]`
		);

		if (alignmentCell) {
			alignmentCell.classList.add("highlighted");
		}
	}

	/**
	 * Handles alignment cell click
	 * @param {Event} event - Click event
	 * @private
	 */
	handleAlignmentClick(event) {
		const alignment = event.target.dataset.alignment;
		if (!alignment) return;

		// Highlight the clicked alignment
		this.highlightAlignment(alignment);

		// Update die display
		const dieDisplay = this.shadowRoot.getElementById("die-display");
		if (dieDisplay) {
			dieDisplay.textContent = alignment;
		}

		// Track this alignment and update game state
		this.trackRecentAlignment(alignment);
		GameState.setCurrentAlignment(alignment);

		// Show examples
		this.showAlignmentExample(alignment);

		// Dispatch event
		this.dispatchEvent(
			new CustomEvent("alignment-selected", {
				detail: { alignment },
			})
		);
	}

	/**
	 * Handles alignment cell hover
	 * @param {Event} event - Mouse event
	 * @private
	 */
	handleAlignmentHover(event) {
		const alignment = event.target.dataset.alignment;
		if (!alignment) return;

		// Show example for the hovered alignment
		this.showAlignmentExample(alignment);
	}

	/**
	 * Handles alignment cell hover end
	 * @param {Event} event - Mouse event
	 * @private
	 */
	handleAlignmentHoverEnd(event) {
		// Show current alignment example if available
		if (this.state.currentAlignment) {
			this.showAlignmentExample(this.state.currentAlignment);
		} else {
			// Show default message
			const examplesElement =
				this.shadowRoot.getElementById("alignment-examples");
			if (examplesElement) {
				examplesElement.innerHTML =
					"<p><em>Hover over grid or wait for roll...</em></p>";
			}
		}
	}

	/**
	 * Gets the current alignment
	 * @returns {string|null} - Current alignment or null if none set
	 */
	getCurrentAlignment() {
		return this.state.currentAlignment;
	}

	/**
	 * Sets the current alignment
	 * @param {string} alignment - Alignment to set
	 */
	setAlignment(alignment) {
		if (!this.alignments.includes(alignment)) {
			Logger.logError(`Invalid alignment: ${alignment}`);
			return;
		}

		// Update state and UI
		this.state.currentAlignment = alignment;

		// Update die display
		const dieDisplay = this.shadowRoot.getElementById("die-display");
		if (dieDisplay) {
			dieDisplay.textContent = alignment;
		}

		// Highlight the alignment in the grid
		this.highlightAlignment(alignment);

		// Show examples
		this.showAlignmentExample(alignment);

		// Update game state
		GameState.setCurrentAlignment(alignment);
	}

	/**
	 * Sets the alignment data from a pre-loaded JSON object
	 * @param {Object} data - The alignment data object
	 * @returns {boolean} - Whether setting the data was successful
	 */
	setAlignmentData(data) {
		try {
			if (data && data.alignmentExamples) {
				this.alignmentExamples = data.alignmentExamples;
				return true;
			}
			return false;
		} catch (error) {
			Logger.logError(`Error setting alignment data: ${error.message}`);
			return false;
		}
	}

	/**
	 * Reset the component to initial state
	 */
	reset() {
		// Clear state
		this.state.currentAlignment = null;
		this.state.recentAlignments = [];
		this.state.isRolling = false;

		// Update UI
		const dieDisplay = this.shadowRoot.getElementById("die-display");
		if (dieDisplay) {
			dieDisplay.textContent = "?";
			dieDisplay.classList.remove("rolling");
		}

		// Clear highlight
		const cells = this.shadowRoot.querySelectorAll(".alignment-cell");
		cells.forEach((cell) => cell.classList.remove("highlighted"));

		// Reset examples
		const examplesElement =
			this.shadowRoot.getElementById("alignment-examples");
		if (examplesElement) {
			examplesElement.innerHTML =
				"<p><em>Hover over grid or wait for roll...</em></p>";
		}
	}
}

// Define the custom element
customElements.define("alignment-grid", AlignmentGrid);
