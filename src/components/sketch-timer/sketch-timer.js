/**
 * Sketch Timer Web Component
 *
 * Manages the sketch timer functionality, including starting, stopping,
 * resetting, and updating the UI.
 *
 * @module components/sketch-timer
 */

import * as Logger from "../../lib/logger.js";
import * as Audio from "../../lib/audio.js";
import { ComponentBase } from "../component-base.js";

// Constants
const DEFAULT_TIMER_DURATION = 120; // 2 minutes in seconds

/**
 * Sketch Timer Web Component
 * @extends ComponentBase
 */
export class SketchTimer extends ComponentBase {
	/**
	 * Create a new SketchTimer
	 */
	constructor() {
		super(
			"./components/sketch-timer/sketch-timer.template.html",
			"./components/sketch-timer/sketch-timer.styles.css"
		);

		// Initialize state
		this.timerInterval = null;
		this.timerTotalSeconds = DEFAULT_TIMER_DURATION;
		this.timerRunning = false;

		// Event callbacks
		this.eventCallbacks = {
			start: [],
			tick: [],
			end: [],
			reset: [],
		};
	}

	/**
	 * Called after the component is rendered
	 * Overrides the afterRender method from ComponentBase
	 */
	afterRender() {
		this.addEventListeners();
		this.updateTimerDisplay();
	}

	/**
	 * Add event listeners to the component
	 * @private
	 */
	addEventListeners() {
		// Get button elements
		const startButton = this.shadowRoot.getElementById("start-timer-button");
		const stopButton = this.shadowRoot.getElementById("stop-timer-button");
		const resetButton = this.shadowRoot.getElementById("reset-timer-button");

		// Add click event listeners
		if (startButton) {
			startButton.addEventListener("click", () => this.start());
		}

		if (stopButton) {
			stopButton.addEventListener("click", () => this.stop());
		}

		if (resetButton) {
			resetButton.addEventListener("click", () => this.reset());
		}
	}

	/**
	 * Format seconds into MM:SS
	 * @param {number} seconds - Total seconds
	 * @returns {string} - Formatted time string
	 * @private
	 */
	formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	}

	/**
	 * Update the timer display
	 * @private
	 */
	updateTimerDisplay() {
		const minutes = this.shadowRoot.getElementById("timer-minutes");
		const seconds = this.shadowRoot.getElementById("timer-seconds");

		if (!minutes || !seconds) return;

		const mins = Math.floor(this.timerTotalSeconds / 60);
		const secs = this.timerTotalSeconds % 60;

		minutes.textContent = mins.toString().padStart(2, "0");
		seconds.textContent = secs.toString().padStart(2, "0");
	}

	/**
	 * Set the timer duration
	 * @param {number} seconds - Duration in seconds
	 */
	setTimerDuration(seconds) {
		if (this.timerRunning) {
			Logger.logError("Cannot change timer duration while timer is running");
			return;
		}

		this.timerTotalSeconds = seconds;
		this.updateTimerDisplay();
	}

	/**
	 * Start the timer
	 */
	start() {
		if (this.timerRunning) return;

		// Play start sound
		Audio.playSound("timer_start");

		// Set as running
		this.timerRunning = true;

		// Trigger start event
		this.triggerEvent("start");

		// Set UI state
		const startButton = this.shadowRoot.getElementById("start-timer-button");
		const stopButton = this.shadowRoot.getElementById("stop-timer-button");
		const resetButton = this.shadowRoot.getElementById("reset-timer-button");

		if (startButton) startButton.disabled = true;
		if (stopButton) stopButton.disabled = false;
		if (resetButton) resetButton.disabled = true;

		// Start interval
		this.timerInterval = setInterval(() => {
			// Decrement timer
			this.timerTotalSeconds--;

			// Update display
			this.updateTimerDisplay();

			// Trigger tick event
			this.triggerEvent("tick", this.timerTotalSeconds);

			// Check for end
			if (this.timerTotalSeconds <= 0) {
				this.stop();
				this.triggerEvent("end");
				Audio.playSound("timer_end");
			}
		}, 1000);
	}

	/**
	 * Stop the timer
	 */
	stop() {
		if (!this.timerRunning) return;

		// Clear interval
		if (this.timerInterval) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		}

		// Set as not running
		this.timerRunning = false;

		// Trigger stop event
		this.triggerEvent("end");

		// Set UI state
		const startButton = this.shadowRoot.getElementById("start-timer-button");
		const stopButton = this.shadowRoot.getElementById("stop-timer-button");
		const resetButton = this.shadowRoot.getElementById("reset-timer-button");

		if (startButton) startButton.disabled = false;
		if (stopButton) stopButton.disabled = true;
		if (resetButton) resetButton.disabled = false;
	}

	/**
	 * Reset the timer
	 * @param {number} [seconds] - Optional new duration
	 */
	reset(seconds) {
		// Stop timer if running
		if (this.timerRunning) {
			this.stop();
		}

		// Reset to initial duration or provided value
		this.timerTotalSeconds = seconds || DEFAULT_TIMER_DURATION;

		// Update display
		this.updateTimerDisplay();

		// Trigger reset event
		this.triggerEvent("reset");

		// Set UI state
		const startButton = this.shadowRoot.getElementById("start-timer-button");
		const stopButton = this.shadowRoot.getElementById("stop-timer-button");
		const resetButton = this.shadowRoot.getElementById("reset-timer-button");

		if (startButton) startButton.disabled = false;
		if (stopButton) stopButton.disabled = true;
		if (resetButton) resetButton.disabled = false;
	}

	/**
	 * Check if timer is running
	 * @returns {boolean} - Whether timer is running
	 */
	isTimerRunning() {
		return this.timerRunning;
	}

	/**
	 * Get remaining time in seconds
	 * @returns {number} - Remaining seconds
	 */
	getRemainingTime() {
		return this.timerTotalSeconds;
	}

	/**
	 * Add event listener
	 * @param {string} event - Event name
	 * @param {Function} callback - Callback function
	 */
	addEventListener(event, callback) {
		if (!this.eventCallbacks[event]) {
			this.eventCallbacks[event] = [];
		}
		this.eventCallbacks[event].push(callback);
	}

	/**
	 * Remove event listener
	 * @param {string} event - Event name
	 * @param {Function} callback - Callback function
	 */
	removeEventListener(event, callback) {
		if (!this.eventCallbacks[event]) return;

		this.eventCallbacks[event] = this.eventCallbacks[event].filter(
			(cb) => cb !== callback
		);
	}

	/**
	 * Trigger event callbacks
	 * @param {string} event - Event name
	 * @param {*} data - Event data
	 * @private
	 */
	triggerEvent(event, data) {
		if (!this.eventCallbacks[event]) return;

		// Create and dispatch DOM event
		this.dispatchEvent(
			new CustomEvent(`timer-${event}`, {
				detail: { seconds: this.timerTotalSeconds, data },
				bubbles: true,
				composed: true,
			})
		);

		// Call registered callbacks
		this.eventCallbacks[event].forEach((callback) => {
			try {
				callback(data);
			} catch (error) {
				Logger.logError(`Error in timer ${event} callback: ${error.message}`);
			}
		});
	}
}

// Define the custom element
customElements.define("sketch-timer", SketchTimer);
