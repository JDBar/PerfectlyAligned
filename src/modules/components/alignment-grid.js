/**
 * Alignment Grid Web Component
 *
 * Displays and manages the D&D alignment grid, allowing users to roll
 * for a random alignment or manually select one.
 *
 * @module components/alignment-grid
 */

import { logError } from "../logger.js";
import { playSound } from "../audio.js";
import { setCurrentAlignment } from "../gameState.js";

/**
 * Alignment Grid Web Component
 * @extends HTMLElement
 */
export class AlignmentGrid extends HTMLElement {
	/**
	 * Create a new AlignmentGrid
	 */
	constructor() {
		super();

		// Create shadow DOM
		this.attachShadow({ mode: "open" });

		// Initialize state
		this.state = {
			currentAlignment: null,
			recentAlignments: [],
			isRolling: false,
			isJudgeChoice: false,
		};

		// Alignment data
		this.alignments = ["LG", "NG", "CG", "LN", "TN", "CN", "LE", "NE", "CE"];

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
		this.dispatchEvent(new CustomEvent("alignment-grid-connected"));
	}

	/**
	 * Called when the element is removed from the DOM
	 */
	disconnectedCallback() {
		// Clean up event listeners if necessary
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
	 * Renders the component
	 * @private
	 */
	render() {
		this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--pixel-font, 'Press Start 2P', cursive);
        }
        
        .alignment-roll-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 15px;
        }
        
        #roll-button {
          background-color: #0d0517;
          color: #ffff00;
          border: 2px solid #00ffff;
          padding: 10px 15px;
          font-family: var(--pixel-font, 'Press Start 2P', cursive);
          font-size: 1em;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        #roll-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 5px rgba(0, 255, 255, 0.5);
        }
        
        #roll-button:active {
          transform: translateY(0);
        }
        
        #die-display {
          font-size: 2em;
          font-weight: bold;
          color: #00ffff;
          background-color: #1a0a2e;
          border: 2px solid #00ffff;
          width: 60px;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 10px 0;
          border-radius: 5px;
          text-shadow: 0 0 5px #00ffff;
        }
        
        #die-display.rolling {
          animation: rollAnim 0.2s ease-in-out infinite;
        }
        
        @keyframes rollAnim {
          0% { transform: translateY(-2px) rotate(-5deg); }
          50% { transform: translateY(2px) rotate(5deg); }
          100% { transform: translateY(-2px) rotate(-5deg); }
        }
        
        #alignment-chart-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 5px;
          max-width: 300px;
          margin: 0 auto;
        }
        
        .alignment-cell {
          background-color: #1a0a2e;
          border: 2px solid #333333;
          padding: 15px 10px;
          text-align: center;
          font-size: 1.2em;
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;
        }
        
        .alignment-cell:hover {
          border-color: #00ffff;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .alignment-cell.highlighted {
          border-color: #ff00ff;
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.7);
          transform: scale(1.05);
        }
        
        .alignment-good {
          color: #ffff00;
        }
        
        .alignment-neutral-row {
          color: #00ffff;
        }
        
        .alignment-evil {
          color: #ff00ff;
        }
        
        .alignment-lawful, .alignment-neutral-col, .alignment-chaotic {
          font-weight: bold;
        }
        
        .alignment-examples {
          margin-top: 20px;
          font-size: 0.9em;
          padding: 10px;
          background-color: #0d0517;
          border: 1px solid #00ffff;
          border-radius: 5px;
          color: #ffffff;
        }
        
        @media (max-width: 768px) {
          #alignment-chart-grid {
            max-width: 220px;
          }
          
          .alignment-cell {
            font-size: 1.1em;
            padding: 8px 4px;
          }
        }
        
        @media (max-width: 480px) {
          #alignment-chart-grid {
            max-width: 180px;
          }
          
          .alignment-cell {
            font-size: 0.9em;
            padding: 5px 2px;
          }
        }
      </style>
      
      <div class="alignment-roll-area">
        <button id="roll-button" type="button">Roll Alignment!</button>
        <div id="die-display" aria-live="polite">?</div>
      </div>
      
      <div id="alignment-chart-grid" role="grid">
        <div class="alignment-cell alignment-good" data-alignment="LG" role="gridcell" tabindex="0" title="Lawful Good">LG</div>
        <div class="alignment-cell alignment-good" data-alignment="NG" role="gridcell" tabindex="0" title="Neutral Good">NG</div>
        <div class="alignment-cell alignment-good" data-alignment="CG" role="gridcell" tabindex="0" title="Chaotic Good">CG</div>
        <div class="alignment-cell alignment-neutral-row" data-alignment="LN" role="gridcell" tabindex="0" title="Lawful Neutral">LN</div>
        <div class="alignment-cell alignment-neutral-row" data-alignment="TN" role="gridcell" tabindex="0" title="True Neutral">TN</div>
        <div class="alignment-cell alignment-neutral-row" data-alignment="CN" role="gridcell" tabindex="0" title="Chaotic Neutral">CN</div>
        <div class="alignment-cell alignment-evil" data-alignment="LE" role="gridcell" tabindex="0" title="Lawful Evil">LE</div>
        <div class="alignment-cell alignment-evil" data-alignment="NE" role="gridcell" tabindex="0" title="Neutral Evil">NE</div>
        <div class="alignment-cell alignment-evil" data-alignment="CE" role="gridcell" tabindex="0" title="Chaotic Evil">CE</div>
      </div>
      
      <div class="alignment-examples" id="alignment-examples">
        <p><em>Hover over grid or wait for roll...</em></p>
      </div>
    `;
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
			logError(`Error loading alignment examples: ${error.message}`);
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
		playSound("roll");

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
		setCurrentAlignment(alignment);

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
		setCurrentAlignment(alignment);

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
			logError(`Invalid alignment: ${alignment}`);
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
		setCurrentAlignment(alignment);
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
			logError(`Error setting alignment data: ${error.message}`);
			return false;
		}
	}
}

// Define the custom element
customElements.define("alignment-grid", AlignmentGrid);
