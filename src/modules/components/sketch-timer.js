/**
 * Sketch Timer Web Component
 *
 * Manages the timer for sketching rounds, including starting, stopping, and adjusting duration.
 *
 * @module components/sketch-timer
 */

import { logError } from "../logger.js";
import {
	formatTime,
	startTimer,
	stopTimer,
	resetTimer,
	setTimerDuration,
	addTimerEventListener,
	removeTimerEventListener,
	isTimerRunning,
} from "../timer.js";
import { playSound } from "../audio.js";

/**
 * Sketch Timer Web Component
 * @extends HTMLElement
 */
export class SketchTimer extends HTMLElement {
	/**
	 * Create a new SketchTimer
	 */
	constructor() {
		super();

		// Create shadow DOM
		this.attachShadow({ mode: "open" });

		// Initialize state
		this.state = {
			duration: 90, // Default 1:30
			isRunning: false,
			timeRemaining: 90,
		};

		// Timer event listeners
		this.timerTickListener = this.handleTimerTick.bind(this);
		this.timerEndListener = this.handleTimerEnd.bind(this);

		// Build component
		this.render();
	}

	/**
	 * Called when the element is added to the DOM
	 */
	connectedCallback() {
		// Add event listeners
		this.addEventListeners();

		// Register timer events
		addTimerEventListener("tick", this.timerTickListener);
		addTimerEventListener("end", this.timerEndListener);

		// Dispatch connected event
		this.dispatchEvent(new CustomEvent("sketch-timer-connected"));
	}

	/**
	 * Called when the element is removed from the DOM
	 */
	disconnectedCallback() {
		// Remove timer event listeners
		removeTimerEventListener("tick", this.timerTickListener);
		removeTimerEventListener("end", this.timerEndListener);
	}

	/**
	 * Add event listeners to the component
	 * @private
	 */
	addEventListeners() {
		// Get elements from shadow DOM
		const startButton = this.shadowRoot.getElementById("start-timer-button");
		const stopButton = this.shadowRoot.getElementById("stop-timer-button");
		const resetButton = this.shadowRoot.getElementById("reset-timer-button");
		const timerSlider = this.shadowRoot.getElementById("timer-slider");

		// Start button click
		if (startButton) {
			startButton.addEventListener("click", () => this.handleStartClick());
		}

		// Stop button click
		if (stopButton) {
			stopButton.addEventListener("click", () => this.handleStopClick());
		}

		// Reset button click
		if (resetButton) {
			resetButton.addEventListener("click", () => this.handleResetClick());
		}

		// Timer slider change
		if (timerSlider) {
			timerSlider.addEventListener("input", (e) => this.handleSliderChange(e));
			timerSlider.addEventListener("change", (e) => this.handleSliderChange(e));
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
        
        .sketch-timer {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 20px;
          align-items: center;
          justify-content: center;
          background-color: #1a0a2e;
          border: 2px solid #00ffff;
          border-radius: 5px;
          padding: 15px;
          position: relative;
        }
        
        .timer-active {
          animation: pulseGlow 2s infinite;
        }
        
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.3); }
          50% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.6); }
          100% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.3); }
        }
        
        .timer-label {
          font-size: 0.8em;
          color: #00ffff;
          width: 130px;
          text-align: center;
        }
        
        #timer-slider {
          -webkit-appearance: none;
          width: 300px;
          height: 15px;
          border-radius: 5px;
          background: #0d0517;
          outline: none;
          margin: 10px 0;
        }
        
        #timer-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background: #ff00ff;
          cursor: pointer;
          border: 2px solid #ffffff;
        }
        
        #timer-slider::-moz-range-thumb {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background: #ff00ff;
          cursor: pointer;
          border: 2px solid #ffffff;
        }
        
        #timer-display {
          font-size: 2em;
          color: #ffff00;
          background-color: #0d0517;
          border: 2px solid #00ffff;
          padding: 10px 15px;
          border-radius: 5px;
          margin: 10px 20px;
          min-width: 100px;
          text-align: center;
        }
        
        #timer-display.time-warning {
          color: #ff3333;
          animation: blinkWarning 1s infinite;
        }
        
        @keyframes blinkWarning {
          0% { background-color: #0d0517; }
          50% { background-color: #330000; }
          100% { background-color: #0d0517; }
        }
        
        .timer-buttons {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        button {
          background-color: #0d0517;
          border: 2px solid #00ffff;
          color: #00ffff;
          font-family: var(--pixel-font, 'Press Start 2P', cursive);
          padding: 8px 15px;
          font-size: 0.9em;
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
        
        #start-timer-button {
          background-color: #003300;
          color: #39ff14;
          border-color: #39ff14;
        }
        
        #stop-timer-button {
          background-color: #330000;
          color: #ff3333;
          border-color: #ff3333;
        }
        
        #reset-timer-button {
          background-color: #331100;
          color: #ff9900;
          border-color: #ff9900;
        }
        
        /* For screen readers */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        @media (max-width: 768px) {
          #timer-slider {
            width: 200px;
          }
          
          #timer-display {
            font-size: 1.8em;
            padding: 8px 12px;
          }
          
          button {
            padding: 6px 12px;
            font-size: 0.8em;
          }
        }
        
        @media (max-width: 480px) {
          .sketch-timer {
            flex-direction: column;
            padding: 10px;
          }
          
          #timer-slider {
            width: 90%;
          }
          
          .timer-label {
            width: 100%;
            margin: 5px 0;
          }
          
          #timer-display {
            font-size: 1.6em;
            margin: 10px 0;
          }
          
          .timer-buttons {
            flex-direction: column;
            width: 100%;
          }
          
          button {
            width: 100%;
            padding: 5px 10px;
          }
        }
      </style>
      
      <div class="sketch-timer" id="sketch-timer">
        <span class="timer-label" id="timer-min-label">Quick (0:15)</span>
        <label for="timer-slider" class="sr-only">Timer Duration</label>
        <input type="range" id="timer-slider" min="15" max="300" step="15" value="90" aria-labelledby="timer-min-label timer-max-label timer-display">
        <span class="timer-label" id="timer-max-label">Detailed (5:00)</span>
        
        <div id="timer-display" aria-live="polite">01:30</div>
        
        <div class="timer-buttons">
          <button id="start-timer-button" type="button">Start</button>
          <button id="stop-timer-button" type="button" disabled>Stop</button>
          <button id="reset-timer-button" type="button">Reset</button>
        </div>
      </div>
    `;

		// Initialize timer display
		this.updateTimerDisplay(this.state.duration);
	}

	/**
	 * Handles timer slider change event
	 * @param {Event} event - Input event
	 * @private
	 */
	handleSliderChange(event) {
		if (this.state.isRunning) return;

		const newValue = parseInt(event.target.value, 10);
		if (isNaN(newValue)) return;

		this.state.duration = newValue;
		this.state.timeRemaining = newValue;

		// Update timer display
		this.updateTimerDisplay(newValue);

		// Update timer module
		setTimerDuration(newValue);
	}

	/**
	 * Handles start button click event
	 * @private
	 */
	handleStartClick() {
		if (this.state.isRunning) return;

		// Start the timer
		this.state.isRunning = startTimer();

		if (this.state.isRunning) {
			// Update UI
			this.updateButtonStates();
			this.addTimerActiveClass();

			// Dispatch event
			this.dispatchEvent(
				new CustomEvent("timer-started", {
					detail: { duration: this.state.duration },
				})
			);
		}
	}

	/**
	 * Handles stop button click event
	 * @private
	 */
	handleStopClick() {
		if (!this.state.isRunning) return;

		// Stop the timer
		const stopped = stopTimer(false);

		if (stopped) {
			this.state.isRunning = false;

			// Update UI
			this.updateButtonStates();
			this.removeTimerActiveClass();

			// Dispatch event
			this.dispatchEvent(
				new CustomEvent("timer-stopped", {
					detail: { timeRemaining: this.state.timeRemaining },
				})
			);
		}
	}

	/**
	 * Handles reset button click event
	 * @private
	 */
	handleResetClick() {
		// Reset the timer
		resetTimer(this.state.duration);

		// Update state
		this.state.isRunning = false;
		this.state.timeRemaining = this.state.duration;

		// Update UI
		this.updateTimerDisplay(this.state.duration);
		this.updateButtonStates();
		this.removeTimerActiveClass();

		// Dispatch event
		this.dispatchEvent(new CustomEvent("timer-reset"));
	}

	/**
	 * Handles timer tick event from the timer module
	 * @param {number} secondsRemaining - Seconds remaining on the timer
	 * @private
	 */
	handleTimerTick(secondsRemaining) {
		// Update state
		this.state.timeRemaining = secondsRemaining;

		// Update timer display
		this.updateTimerDisplay(secondsRemaining);

		// Add warning class if less than 10 seconds remaining
		const timerDisplay = this.shadowRoot.getElementById("timer-display");
		if (timerDisplay) {
			if (secondsRemaining <= 10) {
				timerDisplay.classList.add("time-warning");
			} else {
				timerDisplay.classList.remove("time-warning");
			}
		}

		// Dispatch event
		this.dispatchEvent(
			new CustomEvent("timer-tick", {
				detail: { timeRemaining: secondsRemaining },
			})
		);
	}

	/**
	 * Handles timer end event from the timer module
	 * @private
	 */
	handleTimerEnd() {
		// Update state
		this.state.isRunning = false;
		this.state.timeRemaining = 0;

		// Update UI
		this.updateButtonStates();
		this.removeTimerActiveClass();

		// Play sound
		playSound("timer_end");

		// Dispatch event
		this.dispatchEvent(new CustomEvent("timer-ended"));
	}

	/**
	 * Updates the timer display with the specified seconds
	 * @param {number} seconds - Time in seconds to display
	 * @private
	 */
	updateTimerDisplay(seconds) {
		const timerDisplay = this.shadowRoot.getElementById("timer-display");
		if (timerDisplay) {
			timerDisplay.textContent = formatTime(seconds);
		}
	}

	/**
	 * Updates button states based on the timer's running state
	 * @private
	 */
	updateButtonStates() {
		const startButton = this.shadowRoot.getElementById("start-timer-button");
		const stopButton = this.shadowRoot.getElementById("stop-timer-button");
		const resetButton = this.shadowRoot.getElementById("reset-timer-button");
		const timerSlider = this.shadowRoot.getElementById("timer-slider");

		if (startButton && stopButton && resetButton && timerSlider) {
			if (this.state.isRunning) {
				startButton.disabled = true;
				stopButton.disabled = false;
				resetButton.disabled = true;
				timerSlider.disabled = true;
			} else {
				startButton.disabled = false;
				stopButton.disabled = true;
				resetButton.disabled = false;
				timerSlider.disabled = false;
			}
		}
	}

	/**
	 * Adds the active animation class to the timer container
	 * @private
	 */
	addTimerActiveClass() {
		const timerContainer = this.shadowRoot.getElementById("sketch-timer");
		if (timerContainer) {
			timerContainer.classList.add("timer-active");
		}
	}

	/**
	 * Removes the active animation class from the timer container
	 * @private
	 */
	removeTimerActiveClass() {
		const timerContainer = this.shadowRoot.getElementById("sketch-timer");
		if (timerContainer) {
			timerContainer.classList.remove("timer-active");
		}
	}

	/**
	 * Sets the timer duration
	 * @param {number} seconds - Duration in seconds
	 */
	setDuration(seconds) {
		if (this.state.isRunning) return;

		const newDuration = Math.max(15, Math.min(300, seconds));
		this.state.duration = newDuration;
		this.state.timeRemaining = newDuration;

		// Update UI
		this.updateTimerDisplay(newDuration);

		// Update slider
		const timerSlider = this.shadowRoot.getElementById("timer-slider");
		if (timerSlider) {
			timerSlider.value = newDuration;
		}

		// Update timer module
		setTimerDuration(newDuration);
	}

	/**
	 * Starts the timer programmatically
	 * @returns {boolean} - Whether the timer was successfully started
	 */
	start() {
		if (this.state.isRunning) return false;

		// Start timer
		this.state.isRunning = startTimer();

		if (this.state.isRunning) {
			// Update UI
			this.updateButtonStates();
			this.addTimerActiveClass();
		}

		return this.state.isRunning;
	}

	/**
	 * Stops the timer programmatically
	 * @returns {boolean} - Whether the timer was successfully stopped
	 */
	stop() {
		if (!this.state.isRunning) return false;

		// Stop timer
		const stopped = stopTimer(false);

		if (stopped) {
			this.state.isRunning = false;

			// Update UI
			this.updateButtonStates();
			this.removeTimerActiveClass();
		}

		return stopped;
	}

	/**
	 * Resets the timer programmatically
	 */
	reset() {
		// Reset timer
		resetTimer(this.state.duration);

		// Update state
		this.state.isRunning = false;
		this.state.timeRemaining = this.state.duration;

		// Update UI
		this.updateTimerDisplay(this.state.duration);
		this.updateButtonStates();
		this.removeTimerActiveClass();
	}

	/**
	 * Gets the current time remaining on the timer
	 * @returns {number} - Seconds remaining
	 */
	getTimeRemaining() {
		return this.state.timeRemaining;
	}

	/**
	 * Checks if the timer is currently running
	 * @returns {boolean} - Whether timer is running
	 */
	isTimerRunning() {
		return this.state.isRunning;
	}
}

// Define the custom element
customElements.define("sketch-timer", SketchTimer);
